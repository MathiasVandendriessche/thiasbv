import http from 'node:http';
import https from 'node:https';
import { isIP, isIPv6, type LookupFunction } from 'node:net';
import type { TLSSocket } from 'node:tls';
import {
  ALLOWED_METHODS,
  ALLOWED_PORTS,
  MAX_REDIRECTS,
  MAX_RESPONSE_BYTES,
  REQUEST_TIMEOUT_MS,
  TOTAL_TIMEOUT_MS,
  USER_AGENT,
} from '@/lib/quick-check/constants';
import { BlockedTargetError, assertPublicHost, resolveHost, type Resolver } from './ssrf-guard';

/**
 * The only way the quick check talks to the outside world.
 *
 * Every request: checks scheme, port and method before any DNS lookup, resolves
 * the host once through the SSRF guard, and connects to exactly that checked IP
 * (pinned lookup, so no second DNS lookup can be rebound). Every redirect hop
 * goes through the same checks again. All hops share one absolute deadline.
 */

export class TimeoutError extends Error {
  constructor() {
    super('quick-check: timeout');
    this.name = 'TimeoutError';
  }
}

export class TooManyRedirectsError extends Error {
  constructor() {
    super('quick-check: too_many_redirects');
    this.name = 'TooManyRedirectsError';
  }
}

/** A transport failure. The message is fixed; `code` is Node's error code (never a host or IP). */
export class NetworkError extends Error {
  readonly code: string;

  constructor(code: unknown) {
    super('quick-check: network_error');
    this.name = 'NetworkError';
    this.code = typeof code === 'string' && /^[A-Z0-9_]{1,40}$/.test(code) ? code : 'UNKNOWN';
  }
}

export type Method = (typeof ALLOWED_METHODS)[number];
type Protocol = keyof typeof ALLOWED_PORTS;

export interface TlsInfo {
  protocol: string;
  validTo: string;
  authorized: boolean;
  authError?: string;
}

export interface SafeResponse {
  status: number;
  headers: Record<string, string | string[]>;
  body: string;
  url: string;
  ip: string;
  tlsInfo?: TlsInfo;
}

/** What the transport receives: everything is already checked and pinned. */
export interface PinnedRequest {
  protocol: Protocol;
  /** Used for the Host header and TLS SNI only — never resolved. */
  hostname: string;
  /** The checked IP to connect to. */
  ip: string;
  port: number;
  path: string;
  method: Method;
  headers: Record<string, string>;
  maxBytes: number;
  signal: AbortSignal;
}

export interface RawResponse {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
  tlsInfo?: TlsInfo;
}

export interface NetDeps {
  resolve: Resolver;
  request: (req: PinnedRequest) => Promise<RawResponse>;
}

export interface SafeRequestOptions {
  method?: Method;
  /** Absolute epoch-ms timestamp shared by all hops of one check. */
  deadline?: number;
  deps?: NetDeps;
}

const REDIRECT_STATUSES: ReadonlySet<number> = new Set([301, 302, 303, 307, 308]);

const REQUEST_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  'User-Agent': USER_AGENT,
  Accept: 'text/html,*/*;q=0.8',
  'Accept-Encoding': 'identity',
});

/**
 * A dns.lookup replacement that only ever yields `ip`, whatever host is asked.
 * Handles both the single-address and the `all: true` callback form.
 */
export function createPinnedLookup(ip: string): LookupFunction {
  const family = isIPv6(ip) ? 6 : 4;
  return (_hostname, options, callback) => {
    const cb = (typeof options === 'function' ? options : callback) as Parameters<LookupFunction>[2];
    const opts = typeof options === 'function' ? {} : (options ?? {});
    const wanted = opts.family;
    const mismatch =
      wanted !== undefined && wanted !== 0 && wanted !== family && wanted !== `IPv${family}`;
    process.nextTick(() => {
      if (mismatch) cb(new Error('quick-check: pinned_family_mismatch'), '', 0);
      else if (opts.all) cb(null, [{ address: ip, family }]);
      else cb(null, ip, family);
    });
  };
}

function readTlsInfo(socket: TLSSocket): TlsInfo {
  const cert = typeof socket.getPeerCertificate === 'function' ? socket.getPeerCertificate() : null;
  const authorized = socket.authorized === true;
  return {
    protocol: (typeof socket.getProtocol === 'function' ? socket.getProtocol() : null) ?? '',
    validTo: typeof cert?.valid_to === 'string' ? cert.valid_to : '',
    authorized,
    ...(authorized ? {} : { authError: String(socket.authorizationError ?? 'UNKNOWN') }),
  };
}

function copyHeaders(
  source: Record<string, string | string[] | undefined>,
): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [name, value] of Object.entries(source)) {
    if (value === undefined) continue;
    out[name.toLowerCase()] = Array.isArray(value) ? [...value] : value;
  }
  return out;
}

/**
 * Default transport over node http/https. Connects to `req.ip` via a pinned
 * lookup and keeps Host/SNI on the hostname. `rejectUnauthorized: false` is
 * only there so an invalid certificate can still be read and reported in
 * `tlsInfo`; callers must not follow anything when `authorized` is false.
 */
export function nodeRequest(req: PinnedRequest): Promise<RawResponse> {
  const isHttps = req.protocol === 'https:';
  const options: https.RequestOptions = {
    host: req.hostname,
    port: req.port,
    path: req.path,
    method: req.method,
    headers: { ...req.headers, Host: req.hostname },
    lookup: createPinnedLookup(req.ip),
    agent: false,
    signal: req.signal,
    ...(isHttps ? { servername: req.hostname.replace(/\.$/, ''), rejectUnauthorized: false } : {}),
  };

  return new Promise<RawResponse>((resolve, reject) => {
    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };
    const fail = (err: unknown) =>
      settle(() => reject(new NetworkError((err as NodeJS.ErrnoException)?.code)));

    const clientReq = (isHttps ? https : http).request(options, (res) => {
      const status = res.statusCode ?? 0;
      const headers = copyHeaders(res.headers);
      const tlsInfo = isHttps ? readTlsInfo(res.socket as TLSSocket) : undefined;
      const chunks: Buffer[] = [];
      let size = 0;
      const done = () =>
        settle(() =>
          resolve({
            status,
            headers,
            body: Buffer.concat(chunks).toString('utf8'),
            ...(tlsInfo ? { tlsInfo } : {}),
          }),
        );

      if (req.maxBytes <= 0) {
        done();
        res.destroy();
        return;
      }
      res.on('data', (chunk: Buffer) => {
        const room = req.maxBytes - size;
        if (room > 0) {
          const part = chunk.length <= room ? chunk : chunk.subarray(0, room);
          chunks.push(part);
          size += part.length;
        }
        if (size >= req.maxBytes) {
          done();
          res.destroy();
        }
      });
      res.on('end', done);
      res.on('close', done);
      res.on('error', fail);
    });

    clientReq.on('error', fail);
    clientReq.end();
  });
}

export const defaultNetDeps: NetDeps = Object.freeze({ resolve: resolveHost, request: nodeRequest });

interface Target {
  href: string;
  protocol: Protocol;
  hostname: string;
  port: number;
  path: string;
}

/** Validates the URL without any network access. Throws BlockedTargetError. */
function parseTarget(url: string): Target {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new BlockedTargetError('invalid_url');
  }
  if (!Object.hasOwn(ALLOWED_PORTS, parsed.protocol)) {
    throw new BlockedTargetError('scheme_not_allowed');
  }
  // WHATWG URL drops a port equal to the scheme default, so any port left is not allowed.
  if (parsed.port !== '') throw new BlockedTargetError('port_not_allowed');
  if (parsed.username !== '' || parsed.password !== '') {
    throw new BlockedTargetError('credentials_not_allowed');
  }
  const hostname = parsed.hostname;
  if (hostname === '') throw new BlockedTargetError('invalid_url');
  if (isIP(hostname.replace(/^\[(.*)\]$/, '$1'))) {
    throw new BlockedTargetError('ip_literal_not_allowed');
  }
  const protocol = parsed.protocol as Protocol;
  return {
    href: parsed.href,
    protocol,
    hostname,
    port: ALLOWED_PORTS[protocol],
    path: `${parsed.pathname}${parsed.search}`,
  };
}

function truncateUtf8(body: string, maxBytes: number): string {
  if (Buffer.byteLength(body) <= maxBytes) return body;
  return Buffer.from(body).subarray(0, maxBytes).toString('utf8');
}

/** Runs `work`, rejecting with TimeoutError and aborting `controller` after `ms`. */
function withTimeout<T>(ms: number, controller: AbortController, work: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      controller.abort();
      reject(new TimeoutError());
    }, ms);
    work().then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/** One checked request. Does not follow redirects. */
export async function safeRequest(url: string, opts: SafeRequestOptions = {}): Promise<SafeResponse> {
  const method: unknown = opts.method ?? 'GET';
  if (!(ALLOWED_METHODS as readonly unknown[]).includes(method)) {
    throw new BlockedTargetError('method_not_allowed');
  }
  const deps = opts.deps ?? defaultNetDeps;
  const deadline = opts.deadline ?? Date.now() + REQUEST_TIMEOUT_MS;
  const target = parseTarget(url);

  const budget = Math.min(REQUEST_TIMEOUT_MS, deadline - Date.now());
  if (!(budget > 0)) throw new TimeoutError();

  const controller = new AbortController();
  return withTimeout(budget, controller, async () => {
    const [ip] = await assertPublicHost(target.hostname, deps.resolve);
    // The lookup may have outlived the budget: never connect after a time-out.
    if (controller.signal.aborted) throw new TimeoutError();

    const maxBytes = method === 'HEAD' ? 0 : MAX_RESPONSE_BYTES;
    const raw = await deps.request({
      protocol: target.protocol,
      hostname: target.hostname,
      ip,
      port: target.port,
      path: target.path,
      method: method as Method,
      headers: { ...REQUEST_HEADERS },
      maxBytes,
      signal: controller.signal,
    });

    return {
      status: raw.status,
      headers: copyHeaders(raw.headers),
      body: truncateUtf8(raw.body, maxBytes),
      url: target.href,
      ip,
      ...(target.protocol === 'https:' && raw.tlsInfo ? { tlsInfo: { ...raw.tlsInfo } } : {}),
    };
  });
}

function nextLocation(res: SafeResponse): string | null {
  const header = res.headers.location;
  const location = Array.isArray(header) ? header[0] : header;
  if (!location) return null;
  try {
    return new URL(location, res.url).href;
  } catch {
    return null;
  }
}

/**
 * Follows up to MAX_REDIRECTS redirects; every hop goes through safeRequest
 * again. Stops (and returns that response) at a host whose certificate is
 * invalid. Throws TooManyRedirectsError when one more redirect is offered.
 */
export async function followRedirects(
  url: string,
  opts: SafeRequestOptions = {},
): Promise<SafeResponse & { redirects: string[] }> {
  const hopOpts: SafeRequestOptions = {
    method: opts.method,
    deadline: opts.deadline ?? Date.now() + TOTAL_TIMEOUT_MS,
    deps: opts.deps,
  };
  const redirects: string[] = [];
  let res = await safeRequest(url, hopOpts);

  while (REDIRECT_STATUSES.has(res.status) && res.tlsInfo?.authorized !== false) {
    const next = nextLocation(res);
    if (next === null) break;
    if (redirects.length >= MAX_REDIRECTS) throw new TooManyRedirectsError();
    redirects.push(next);
    res = await safeRequest(next, hopOpts);
  }

  return { ...res, redirects };
}
