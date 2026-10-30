import { TOTAL_TIMEOUT_MS } from '@/lib/quick-check/constants';
import { checkEmail, type ResolveTxt } from '@/lib/quick-check/checks/email';
import { gradeCookies } from '@/lib/quick-check/checks/cookies';
import { gradeHeaders } from '@/lib/quick-check/checks/headers';
import { gradeTls } from '@/lib/quick-check/checks/tls';
import { EMAIL_MESSAGES } from '@/lib/quick-check/messages';
import { memoizeResolver } from '@/lib/quick-check/net/dns';
import {
  defaultNetDeps,
  followRedirects,
  safeRequest,
  type NetDeps,
  type SafeResponse,
} from '@/lib/quick-check/net/safe-request';
import { BlockedTargetError } from '@/lib/quick-check/net/ssrf-guard';
import type { CheckResult, QuickCheckReport } from '@/lib/quick-check/types';

export type { QuickCheckReport };

export interface RunDeps {
  net?: NetDeps;
  resolveTxt?: ResolveTxt;
  now?: () => Date;
}

/**
 * Resolves to the part's value, or to `fallback` when the part fails (any
 * error except a block) or is still pending at `deadline`. A BlockedTargetError
 * is never swallowed: it aborts the whole check.
 */
async function settle<T>(work: Promise<T>, deadline: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), Math.max(0, deadline - Date.now()));
  });
  try {
    return await Promise.race([work, expired]);
  } catch (err) {
    if (err instanceof BlockedTargetError) throw err;
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

/** One HTTP HEAD on port 80: true = redirects to https, false = does not, null = unknown. */
async function probeHttpRedirect(domain: string, deadline: number, net?: NetDeps): Promise<boolean | null> {
  const res = await safeRequest(`http://${domain}/`, { method: 'HEAD', deadline, deps: net });
  if (res.status < 300 || res.status > 399) return false;
  const header = res.headers.location;
  const location = Array.isArray(header) ? header[0] : header;
  if (!location) return false;
  try {
    return new URL(location, res.url).protocol === 'https:';
  } catch {
    return false;
  }
}

function setCookies(res: SafeResponse): string[] {
  const value = res.headers['set-cookie'];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export async function runQuickCheck(domain: string, deps: RunDeps = {}): Promise<QuickCheckReport> {
  const now = deps.now ?? (() => new Date());
  const deadline = Date.now() + TOTAL_TIMEOUT_MS;
  const unavailableEmail: CheckResult = { id: 'email', status: 'unavailable', messageKey: EMAIL_MESSAGES.unavailable };
  // Each host is resolved once per check, however many requests go to it.
  const baseNet = deps.net ?? defaultNetDeps;
  const net: NetDeps = { ...baseNet, resolve: memoizeResolver(baseNet.resolve) };

  const [page, tlsProbe, httpRedirect, email] = await Promise.all([
    // Headers and cookies: the final response of the redirect chain.
    settle(followRedirects(`https://${domain}/`, { method: 'GET', deadline, deps: net }), deadline, null),
    // TLS: always the first https response (the chain may end on another host or on http).
    settle(safeRequest(`https://${domain}/`, { method: 'HEAD', deadline, deps: net }), deadline, null),
    settle(probeHttpRedirect(domain, deadline, net), deadline, null),
    settle(checkEmail(domain, deps.resolveTxt), deadline, unavailableEmail),
  ]);

  const results: CheckResult[] = [
    gradeTls({ https: tlsProbe, httpRedirectsToHttps: httpRedirect, now: now() }),
    gradeHeaders(page ? page.headers : null),
    gradeCookies(page ? setCookies(page) : null),
    email,
  ];
  const counted = results.filter((r) => r.status !== 'unavailable');

  return {
    domain,
    checkedAt: now().toISOString(),
    results,
    summary: { ok: counted.filter((r) => r.status === 'good').length, total: counted.length },
  };
}
