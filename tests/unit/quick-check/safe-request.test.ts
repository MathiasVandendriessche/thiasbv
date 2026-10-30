import { createServer, type IncomingHttpHeaders } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MAX_RESPONSE_BYTES, USER_AGENT } from '@/lib/quick-check/constants';
import { BlockedTargetError } from '@/lib/quick-check/net/ssrf-guard';
import {
  TimeoutError,
  TooManyRedirectsError,
  createPinnedLookup,
  followRedirects,
  nodeRequest,
  safeRequest,
  type NetDeps,
  type PinnedRequest,
  type RawResponse,
} from '@/lib/quick-check/net/safe-request';

type Responder = (req: PinnedRequest) => RawResponse | Promise<RawResponse>;

const PUBLIC_DNS: Record<string, string[]> = {
  'voorbeeld.be': ['93.184.216.34', '93.184.216.35'],
  'www.voorbeeld.be': ['93.184.216.40'],
  'x.be': ['93.184.216.50'],
  'intern.voorbeeld.be': ['10.0.0.5'],
};

function fakeDeps(responder: Responder = () => ({ status: 200, headers: {}, body: 'ok' })) {
  const resolve = vi.fn(async (host: string) => PUBLIC_DNS[host] ?? []);
  const request = vi.fn(async (req: PinnedRequest) => responder(req));
  const deps: NetDeps = { resolve, request };
  return { deps, resolve, request };
}

const redirect = (location: string, status = 301): RawResponse => ({
  status,
  headers: { location },
  body: '',
});

describe('safeRequest', () => {
  it('pins the connection to the IP returned by assertPublicHost', async () => {
    const { deps, request } = fakeDeps();
    const res = await safeRequest('https://voorbeeld.be/', { deps });
    expect(request).toHaveBeenCalledTimes(1);
    const sent = request.mock.calls[0][0];
    expect(sent.ip).toBe('93.184.216.34');
    expect(sent.hostname).toBe('voorbeeld.be');
    expect(sent.port).toBe(443);
    expect(sent.protocol).toBe('https:');
    expect(res.ip).toBe('93.184.216.34');
    expect(res.url).toBe('https://voorbeeld.be/');
    expect(res.status).toBe(200);
  });

  it('sends the fixed User-Agent and no cookies or body', async () => {
    const { deps, request } = fakeDeps();
    await safeRequest('http://voorbeeld.be/pad?q=1', { deps });
    const sent = request.mock.calls[0][0];
    expect(sent.headers['User-Agent']).toBe(USER_AGENT);
    expect(sent.headers.Accept).toBe('text/html,*/*;q=0.8');
    expect(sent.headers['Accept-Encoding']).toBe('identity');
    expect(Object.keys(sent.headers).map((h) => h.toLowerCase())).not.toContain('cookie');
    expect(sent.path).toBe('/pad?q=1');
    expect(sent.port).toBe(80);
    expect(sent.method).toBe('GET');
  });

  it.each([
    'https://voorbeeld.be:8443/',
    'http://voorbeeld.be:8080/',
    'https://voorbeeld.be:80/',
    'http://voorbeeld.be:443/',
  ])('blocks %s before any DNS lookup', async (url) => {
    const { deps, resolve, request } = fakeDeps();
    await expect(safeRequest(url, { deps })).rejects.toBeInstanceOf(BlockedTargetError);
    expect(resolve).not.toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
  });

  it('accepts the default port written explicitly', async () => {
    const { deps, request } = fakeDeps();
    await safeRequest('https://voorbeeld.be:443/', { deps });
    expect(request.mock.calls[0][0].port).toBe(443);
  });

  it.each([
    'file:///etc/passwd',
    'ftp://voorbeeld.be/',
    'gopher://voorbeeld.be/',
    'not a url',
    'https://user:pw@voorbeeld.be/',
    'http://127.0.0.1/',
    'http://8.8.8.8/',
    'http://[::1]/',
    'https://intern.voorbeeld.be/',
    'https://onbekend.be/',
  ])('blocks %s without connecting', async (url) => {
    const { deps, request } = fakeDeps();
    await expect(safeRequest(url, { deps })).rejects.toBeInstanceOf(BlockedTargetError);
    expect(request).not.toHaveBeenCalled();
  });

  it('refuses methods other than GET and HEAD', async () => {
    const { deps, resolve, request } = fakeDeps();
    // @ts-expect-error POST is not part of the allowed method type
    await expect(safeRequest('https://voorbeeld.be/', { method: 'POST', deps })).rejects.toBeInstanceOf(
      BlockedTargetError,
    );
    expect(resolve).not.toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
  });

  it('passes HEAD through and asks for no body', async () => {
    const { deps, request } = fakeDeps();
    await safeRequest('https://voorbeeld.be/', { method: 'HEAD', deps });
    expect(request.mock.calls[0][0].method).toBe('HEAD');
    expect(request.mock.calls[0][0].maxBytes).toBe(0);
  });

  it('truncates the body at 256 KB', async () => {
    const { deps, request } = fakeDeps(() => ({
      status: 200,
      headers: {},
      body: 'a'.repeat(MAX_RESPONSE_BYTES + 10_000),
    }));
    const res = await safeRequest('https://voorbeeld.be/', { deps });
    expect(request.mock.calls[0][0].maxBytes).toBe(MAX_RESPONSE_BYTES);
    expect(Buffer.byteLength(res.body)).toBe(MAX_RESPONSE_BYTES);
  });

  it('throws TimeoutError when the deadline has already passed', async () => {
    const { deps, resolve, request } = fakeDeps();
    await expect(
      safeRequest('https://voorbeeld.be/', { deadline: Date.now() - 1, deps }),
    ).rejects.toBeInstanceOf(TimeoutError);
    expect(resolve).not.toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
  });

  it('throws TimeoutError and aborts the request when the deadline passes mid-request', async () => {
    let signal: AbortSignal | undefined;
    const { deps } = fakeDeps(
      (req) =>
        new Promise<RawResponse>(() => {
          signal = req.signal;
        }),
    );
    await expect(
      safeRequest('https://voorbeeld.be/', { deadline: Date.now() + 30, deps }),
    ).rejects.toBeInstanceOf(TimeoutError);
    expect(signal?.aborted).toBe(true);
  });

  it('counts a hanging DNS lookup against the deadline', async () => {
    const deps: NetDeps = {
      resolve: () => new Promise<string[]>(() => undefined),
      request: vi.fn(),
    };
    await expect(
      safeRequest('https://voorbeeld.be/', { deadline: Date.now() + 30, deps }),
    ).rejects.toBeInstanceOf(TimeoutError);
    expect(deps.request).not.toHaveBeenCalled();
  });

  it('never connects when the DNS answer arrives after the deadline', async () => {
    const request = vi.fn(async () => ({ status: 200, headers: {}, body: '' }));
    const deps: NetDeps = {
      resolve: () => new Promise<string[]>((r) => setTimeout(() => r(['93.184.216.34']), 40)),
      request,
    };
    await expect(
      safeRequest('https://voorbeeld.be/', { deadline: Date.now() + 10, deps }),
    ).rejects.toBeInstanceOf(TimeoutError);
    await new Promise((r) => setTimeout(r, 60));
    expect(request).not.toHaveBeenCalled();
  });

  it('caps a single request at 4 s even with a later deadline', async () => {
    vi.useFakeTimers();
    try {
      const { deps } = fakeDeps(() => new Promise<RawResponse>(() => undefined));
      const pending = safeRequest('https://voorbeeld.be/', { deadline: Date.now() + 60_000, deps });
      const assertion = expect(pending).rejects.toBeInstanceOf(TimeoutError);
      await vi.advanceTimersByTimeAsync(3_999);
      let settled = false;
      pending.catch(() => undefined).finally(() => (settled = true));
      await vi.advanceTimersByTimeAsync(0);
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(2);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it('returns tlsInfo from the transport', async () => {
    const tlsInfo = { protocol: 'TLSv1.3', validTo: 'Jan  1 00:00:00 2030 GMT', authorized: true };
    const { deps } = fakeDeps(() => ({ status: 200, headers: {}, body: '', tlsInfo }));
    const res = await safeRequest('https://voorbeeld.be/', { deps });
    expect(res.tlsInfo).toEqual(tlsInfo);
  });
});

describe('followRedirects', () => {
  it('follows voorbeeld.be → https://www.voorbeeld.be/ and resolves the new host', async () => {
    const { deps, resolve, request } = fakeDeps((req) =>
      req.hostname === 'voorbeeld.be'
        ? redirect('https://www.voorbeeld.be/')
        : { status: 200, headers: { 'strict-transport-security': 'max-age=1' }, body: 'hi' },
    );
    const res = await followRedirects('http://voorbeeld.be/', { deps });
    expect(resolve).toHaveBeenCalledWith('voorbeeld.be');
    expect(resolve).toHaveBeenCalledWith('www.voorbeeld.be');
    expect(request.mock.calls[1][0].ip).toBe('93.184.216.40');
    expect(res.status).toBe(200);
    expect(res.url).toBe('https://www.voorbeeld.be/');
    expect(res.ip).toBe('93.184.216.40');
    expect(res.redirects).toEqual(['https://www.voorbeeld.be/']);
    expect(res.headers['strict-transport-security']).toBe('max-age=1');
  });

  it('resolves a relative Location against the current URL', async () => {
    const { deps, request } = fakeDeps((req) =>
      req.path === '/' ? redirect('/nl/', 302) : { status: 200, headers: {}, body: '' },
    );
    const res = await followRedirects('https://voorbeeld.be/', { deps });
    expect(res.url).toBe('https://voorbeeld.be/nl/');
    expect(request.mock.calls[1][0].path).toBe('/nl/');
  });

  it.each([
    'http://127.0.0.1/',
    'https://x.be:8080/',
    'file:///etc/passwd',
    'http://169.254.169.254/latest/meta-data/',
    'https://intern.voorbeeld.be/',
  ])('blocks a redirect to %s', async (location) => {
    const { deps, request } = fakeDeps(() => redirect(location));
    await expect(followRedirects('https://voorbeeld.be/', { deps })).rejects.toBeInstanceOf(
      BlockedTargetError,
    );
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('follows 3 redirects but throws TooManyRedirectsError on the 4th', async () => {
    let n = 0;
    const { deps, request } = fakeDeps(() => redirect(`https://voorbeeld.be/${++n}`));
    await expect(followRedirects('https://voorbeeld.be/', { deps })).rejects.toBeInstanceOf(
      TooManyRedirectsError,
    );
    expect(request).toHaveBeenCalledTimes(4);
  });

  it('accepts exactly 3 redirects', async () => {
    let n = 0;
    const { deps } = fakeDeps(() =>
      n < 3 ? redirect(`https://voorbeeld.be/${++n}`) : { status: 200, headers: {}, body: '' },
    );
    const res = await followRedirects('https://voorbeeld.be/', { deps });
    expect(res.redirects).toHaveLength(3);
    expect(res.status).toBe(200);
  });

  it('does not follow anything from a host with an invalid certificate', async () => {
    const { deps, request } = fakeDeps(() => ({
      ...redirect('https://www.voorbeeld.be/'),
      tlsInfo: { protocol: 'TLSv1.2', validTo: '', authorized: false, authError: 'CERT_HAS_EXPIRED' },
    }));
    const res = await followRedirects('https://voorbeeld.be/', { deps });
    expect(request).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(301);
    expect(res.redirects).toEqual([]);
    expect(res.tlsInfo?.authError).toBe('CERT_HAS_EXPIRED');
  });

  it('returns a redirect without Location as is', async () => {
    const { deps } = fakeDeps(() => ({ status: 302, headers: {}, body: '' }));
    const res = await followRedirects('https://voorbeeld.be/', { deps });
    expect(res.status).toBe(302);
    expect(res.redirects).toEqual([]);
  });

  it('shares one deadline across hops', async () => {
    const { deps, request } = fakeDeps(() => redirect('https://www.voorbeeld.be/'));
    await expect(
      followRedirects('https://voorbeeld.be/', { deadline: Date.now() - 1, deps }),
    ).rejects.toBeInstanceOf(TimeoutError);
    expect(request).not.toHaveBeenCalled();
  });

  it('times out on a slow second hop within the shared deadline', async () => {
    const { deps } = fakeDeps((req) =>
      req.hostname === 'voorbeeld.be'
        ? redirect('https://www.voorbeeld.be/')
        : new Promise<RawResponse>(() => undefined),
    );
    await expect(
      followRedirects('https://voorbeeld.be/', { deadline: Date.now() + 40, deps }),
    ).rejects.toBeInstanceOf(TimeoutError);
  });
});

describe('createPinnedLookup', () => {
  const tick = () => new Promise((r) => setImmediate(r));

  it('only ever yields the pinned IP (single form)', async () => {
    const lookup = createPinnedLookup('93.184.216.34');
    const cb = vi.fn();
    lookup('elders.be', {}, cb);
    await tick();
    expect(cb).toHaveBeenCalledWith(null, '93.184.216.34', 4);
  });

  it('only ever yields the pinned IP (all: true form)', async () => {
    const lookup = createPinnedLookup('2606:4700:4700::1111');
    const cb = vi.fn();
    lookup('elders.be', { all: true }, cb);
    await tick();
    expect(cb).toHaveBeenCalledWith(null, [{ address: '2606:4700:4700::1111', family: 6 }]);
  });

  it('supports the (hostname, callback) form', async () => {
    const lookup = createPinnedLookup('93.184.216.34');
    const cb = vi.fn();
    (lookup as unknown as (h: string, c: typeof cb) => void)('elders.be', cb);
    await tick();
    expect(cb).toHaveBeenCalledWith(null, '93.184.216.34', 4);
  });

  it('refuses a family that does not match the pinned IP', async () => {
    const lookup = createPinnedLookup('93.184.216.34');
    const cb = vi.fn();
    lookup('elders.be', { family: 6 }, cb);
    await tick();
    expect(cb.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});

describe('nodeRequest (default transport, loopback only)', () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => {
    await close?.();
    close = undefined;
  });

  async function startServer(handler: (headers: IncomingHttpHeaders, method: string) => {
    status: number;
    headers?: Record<string, string | string[]>;
    body?: string;
  }) {
    const seen: { headers?: IncomingHttpHeaders; method?: string } = {};
    const server = createServer((req, res) => {
      seen.headers = req.headers;
      seen.method = req.method;
      const out = handler(req.headers, req.method ?? '');
      res.writeHead(out.status, out.headers);
      res.end(out.body ?? '');
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    close = () => new Promise<void>((r) => server.close(() => r()));
    return { port: (server.address() as AddressInfo).port, seen };
  }

  const pinned = (port: number, overrides: Partial<PinnedRequest> = {}): PinnedRequest => ({
    protocol: 'http:',
    // Not resolvable in DNS: reaching the server proves Node used the pinned lookup.
    hostname: 'pinned-only.invalid',
    ip: '127.0.0.1',
    port,
    path: '/pad?x=1',
    method: 'GET',
    headers: { 'User-Agent': USER_AGENT },
    maxBytes: MAX_RESPONSE_BYTES,
    signal: new AbortController().signal,
    ...overrides,
  });

  it('connects to the pinned IP, keeps the Host header and returns lowercase headers', async () => {
    const { port, seen } = await startServer(() => ({
      status: 200,
      headers: { 'X-Test': 'ja', 'Set-Cookie': ['a=1', 'b=2'] },
      body: 'hallo',
    }));
    const res = await nodeRequest(pinned(port));
    expect(res.status).toBe(200);
    expect(res.body).toBe('hallo');
    expect(res.headers['x-test']).toBe('ja');
    expect(res.headers['set-cookie']).toEqual(['a=1', 'b=2']);
    expect(res.tlsInfo).toBeUndefined();
    expect(seen.headers?.host).toBe('pinned-only.invalid');
    expect(seen.headers?.['user-agent']).toBe(USER_AGENT);
    expect(seen.headers?.cookie).toBeUndefined();
    expect(seen.method).toBe('GET');
  });

  it('stops reading at maxBytes', async () => {
    const { port } = await startServer(() => ({ status: 200, body: 'b'.repeat(50_000) }));
    const res = await nodeRequest(pinned(port, { maxBytes: 1_000 }));
    expect(res.body).toBe('b'.repeat(1_000));
  });

  it('rejects when the signal aborts', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(nodeRequest(pinned(1, { signal: controller.signal }))).rejects.toBeInstanceOf(Error);
  });
});
