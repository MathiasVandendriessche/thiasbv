import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runQuickCheck } from '@/lib/quick-check/run';
import type { NetDeps, PinnedRequest, RawResponse } from '@/lib/quick-check/net/safe-request';
import { BlockedTargetError } from '@/lib/quick-check/net/ssrf-guard';

const NOW = new Date('2026-10-30T12:00:00Z');
const GOOD_TLS = { protocol: 'TLSv1.3', validTo: 'Jan 1 00:00:00 2027 GMT', authorized: true };
const SECURE_HEADERS = {
  'strict-transport-security': 'max-age=31536000',
  'content-security-policy': "default-src 'self'",
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'permissions-policy': 'camera=()',
};

type Handler = (req: PinnedRequest) => Promise<RawResponse> | RawResponse;

function net(handler: Handler, resolve?: NetDeps['resolve']): NetDeps {
  return {
    resolve: resolve ?? (async () => ['93.184.216.34']),
    request: async (req) => handler(req),
  };
}

const okHttps = (headers: Record<string, string | string[]> = SECURE_HEADERS): RawResponse => ({
  status: 200,
  headers,
  body: '',
  tlsInfo: GOOD_TLS,
});
const txt = (async (name: string) => {
  if (name.startsWith('_dmarc.')) return [['v=DMARC1; p=reject']];
  return [['v=spf1 -all']];
}) as never;
const base = { now: () => NOW, resolveTxt: txt };

describe('runQuickCheck', () => {
  beforeEach(() => vi.useFakeTimers({ now: NOW }));
  afterEach(() => vi.useRealTimers());

  it('returns four results in fixed order with a summary', async () => {
    const deps = net((req) =>
      req.protocol === 'http:'
        ? { status: 301, headers: { location: 'https://voorbeeld.be/' }, body: '' }
        : okHttps(),
    );
    const report = await runQuickCheck('voorbeeld.be', { ...base, net: deps });
    expect(report.domain).toBe('voorbeeld.be');
    expect(report.checkedAt).toBe(NOW.toISOString());
    expect(report.results.map((r) => r.id)).toEqual(['tls', 'headers', 'cookies', 'email']);
    expect(report.results.every((r) => r.status === 'good')).toBe(true);
    expect(report.summary).toEqual({ ok: 4, total: 4 });
  });

  it('runs https, http and dns in parallel', async () => {
    const deps = net(
      (req) =>
        new Promise((resolve) =>
          setTimeout(() => resolve(req.protocol === 'http:' ? { status: 200, headers: {}, body: '' } : okHttps()), 2000),
        ),
    );
    const slowTxt = (async () => {
      await new Promise((r) => setTimeout(r, 3000));
      return [['v=spf1 -all']];
    }) as never;
    const t0 = Date.now();
    const p = runQuickCheck('voorbeeld.be', { ...base, resolveTxt: slowTxt, net: deps });
    await vi.advanceTimersByTimeAsync(3000);
    await p;
    expect(Date.now() - t0).toBe(3000);
  });

  it('gives no penalty when port 80 is unreachable', async () => {
    const deps = net((req) => {
      if (req.protocol === 'http:') throw new Error('refused');
      return okHttps();
    });
    const report = await runQuickCheck('voorbeeld.be', { ...base, net: deps });
    expect(report.results[0].status).toBe('good');
  });

  it('warns when http is served without redirect', async () => {
    const deps = net((req) => (req.protocol === 'http:' ? { status: 200, headers: {}, body: '' } : okHttps()));
    const report = await runQuickCheck('voorbeeld.be', { ...base, net: deps });
    expect(report.results[0].status).toBe('warn');
  });

  it('grades TLS bad for an HTTP-only site (443 refused, port 80 answers), never green', async () => {
    const deps = net((req) => {
      if (req.protocol === 'https:') throw new Error('refused');
      return { status: 200, headers: {}, body: '' };
    });
    const report = await runQuickCheck('voorbeeld.be', { ...base, net: deps });
    expect(report.results[0]).toMatchObject({ id: 'tls', status: 'bad', messageKey: 'tls.noHttps' });
    expect(report.results.map((r) => r.status)).toEqual(['bad', 'unavailable', 'unavailable', 'good']);
    expect(report.summary).toEqual({ ok: 1, total: 2 });
  });

  it('marks tls/headers/cookies unavailable when both 443 and 80 fail, email still graded', async () => {
    const deps = net(() => {
      throw new Error('refused');
    });
    const report = await runQuickCheck('voorbeeld.be', { ...base, net: deps });
    expect(report.results.map((r) => r.status)).toEqual(['unavailable', 'unavailable', 'unavailable', 'good']);
    expect(report.summary).toEqual({ ok: 1, total: 1 });
  });

  it('turns unfinished parts into unavailable at the 12 s deadline', async () => {
    const never = net(() => new Promise<RawResponse>(() => {}));
    const neverTxt = (() => new Promise(() => {})) as never;
    const p = runQuickCheck('voorbeeld.be', { ...base, resolveTxt: neverTxt, net: never });
    await vi.advanceTimersByTimeAsync(12_000);
    const report = await p;
    expect(report.results.map((r) => r.status)).toEqual(['unavailable', 'unavailable', 'unavailable', 'unavailable']);
    expect(report.summary).toEqual({ ok: 0, total: 0 });
  });

  it('follows voorbeeld.be to www and grades headers from the final response', async () => {
    const hosts: string[] = [];
    const deps = net((req) => {
      hosts.push(`${req.method} ${req.protocol}//${req.hostname}`);
      if (req.protocol === 'http:') return { status: 200, headers: {}, body: '' };
      if (req.hostname === 'voorbeeld.be') {
        return req.method === 'GET'
          ? { status: 301, headers: { location: 'https://www.voorbeeld.be/' }, body: '', tlsInfo: GOOD_TLS }
          : okHttps({});
      }
      return okHttps({ ...SECURE_HEADERS, 'set-cookie': ['a=1; Secure; HttpOnly; SameSite=Lax'] });
    });
    const report = await runQuickCheck('voorbeeld.be', { ...base, net: deps });
    expect(hosts).toContain('GET https://www.voorbeeld.be');
    expect(report.results[1].status).toBe('good');
    expect(report.results[2].status).toBe('good');
  });

  it('rejects with BlockedTargetError when the first host is blocked', async () => {
    const deps = net(
      () => okHttps(),
      async () => ['10.0.0.1'],
    );
    await expect(runQuickCheck('voorbeeld.be', { ...base, net: deps })).rejects.toBeInstanceOf(BlockedTargetError);
  });

  it('rejects with BlockedTargetError when a redirect hop is blocked', async () => {
    const deps = net(
      (req) =>
        req.hostname === 'voorbeeld.be'
          ? { status: 302, headers: { location: 'https://intern.voorbeeld.be/' }, body: '', tlsInfo: GOOD_TLS }
          : okHttps(),
      async (host) => (host === 'intern.voorbeeld.be' ? ['192.168.1.1'] : ['93.184.216.34']),
    );
    await expect(runQuickCheck('voorbeeld.be', { ...base, net: deps })).rejects.toBeInstanceOf(BlockedTargetError);
  });
});
