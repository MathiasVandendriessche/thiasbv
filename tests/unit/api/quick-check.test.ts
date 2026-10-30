import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/quick-check/run', () => ({ runQuickCheck: vi.fn() }));

import * as route from '@/app/api/quick-check/route';
import { runQuickCheck, type QuickCheckReport } from '@/lib/quick-check/run';
import { BlockedTargetError } from '@/lib/quick-check/net/ssrf-guard';
import { globalLimiter, quickCheckLimiter } from '@/lib/quick-check/rate-limit';

const { POST } = route;
const runMock = vi.mocked(runQuickCheck);
const report: QuickCheckReport = {
  domain: 'voorbeeld.be',
  checkedAt: '2026-10-30T12:00:00.000Z',
  results: [],
  summary: { ok: 0, total: 0 },
};

let ipCounter = 0;
const freshIp = () => `203.0.113.${++ipCounter}`;

function req(body: unknown, ip = freshIp(), raw = false) {
  return new NextRequest('http://localhost/api/quick-check', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

describe('POST /api/quick-check', () => {
  const spies: ReturnType<typeof vi.spyOn>[] = [];

  beforeEach(() => {
    runMock.mockReset();
    runMock.mockResolvedValue(report);
    for (const m of ['log', 'info', 'warn', 'error', 'debug'] as const) {
      spies.push(vi.spyOn(console, m).mockImplementation(() => {}));
    }
  });
  afterEach(() => {
    vi.restoreAllMocks();
    spies.length = 0;
  });

  it('only exports POST', () => {
    const handlers = Object.keys(route).filter((k) => /^(GET|HEAD|PUT|PATCH|DELETE|OPTIONS|POST)$/.test(k));
    expect(handlers).toEqual(['POST']);
    expect(route.runtime).toBe('nodejs');
    expect(route.dynamic).toBe('force-dynamic');
  });

  it('returns the report in the envelope with no-store', async () => {
    const res = await POST(req({ domain: 'https://Voorbeeld.be/pad' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({ success: true, data: report });
    expect(runMock).toHaveBeenCalledWith('voorbeeld.be');
  });

  it('rejects an invalid domain without running', async () => {
    const res = await POST(req({ domain: 'localhost' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, error: 'invalid_domain' });
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(runMock).not.toHaveBeenCalled();
  });

  it('rejects a body above 1 KB, non-JSON and non-object bodies', async () => {
    for (const r of [
      req({ domain: 'voorbeeld.be', pad: 'x'.repeat(1100) }),
      req('not json', freshIp(), true),
      req([1, 2], freshIp()),
      req(null, freshIp()),
    ]) {
      const res = await POST(r);
      expect(res.status).toBe(400);
      expect(res.headers.get('cache-control')).toBe('no-store');
    }
    expect(runMock).not.toHaveBeenCalled();
  });

  it('rejects a huge streamed body without content-length', async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull(c) {
        c.enqueue(new Uint8Array(512));
      },
    });
    const r = new NextRequest('http://localhost/api/quick-check', {
      method: 'POST',
      body: stream,
      duplex: 'half',
    } as ConstructorParameters<typeof NextRequest>[1]);
    r.headers.delete('content-length');
    const res = await POST(r);
    expect(res.status).toBe(400);
    expect(runMock).not.toHaveBeenCalled();
  });

  it('does not count invalid input against the rate limit', async () => {
    const ip = freshIp();
    for (let i = 0; i < 6; i++) await POST(req({ domain: 'nope' }, ip));
    expect((await POST(req({ domain: 'voorbeeld.be' }, ip))).status).toBe(200);
  });

  it('returns 429 on the 6th call from the same IP', async () => {
    const ip = freshIp();
    for (let i = 0; i < 5; i++) expect((await POST(req({ domain: 'voorbeeld.be' }, ip))).status).toBe(200);
    const res = await POST(req({ domain: 'voorbeeld.be' }, ip));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ success: false, error: 'rate_limited' });
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('returns 429 when the global limit is reached', async () => {
    const globalHit = vi.spyOn(globalLimiter, 'hit').mockReturnValue(false);
    const ipHit = vi.spyOn(quickCheckLimiter, 'hit');
    const res = await POST(req({ domain: 'voorbeeld.be' }));
    expect(res.status).toBe(429);
    expect(globalHit).toHaveBeenCalledWith('global');
    expect(ipHit).toHaveBeenCalledTimes(1);
    expect(ipHit.mock.invocationCallOrder[0]).toBeLessThan(globalHit.mock.invocationCallOrder[0]);
    expect(runMock).not.toHaveBeenCalled();
  });

  it('uses the same per-IP key for a missing IP header', async () => {
    const hit = vi.spyOn(quickCheckLimiter, 'hit');
    const noIp = new NextRequest('http://localhost/api/quick-check', {
      method: 'POST',
      body: JSON.stringify({ domain: 'voorbeeld.be' }),
    });
    await POST(noIp);
    expect(hit).toHaveBeenCalledWith('unknown');
  });

  it('maps BlockedTargetError to 400 blocked', async () => {
    runMock.mockRejectedValue(new BlockedTargetError('private_address'));
    const res = await POST(req({ domain: 'voorbeeld.be' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, error: 'blocked' });
  });

  it('maps unexpected errors to 503 without leaking details or logging the domain/IP', async () => {
    const ip = freshIp();
    runMock.mockRejectedValue(new Error('boom voorbeeld.be at /secret/stack.ts'));
    const res = await POST(req({ domain: 'voorbeeld.be' }, ip));
    expect(res.status).toBe(503);
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({ success: false, error: 'unavailable' });
    expect(text).not.toMatch(/voorbeeld|stack|boom/);
    for (const spy of spies) {
      for (const call of spy.mock.calls) {
        const logged = JSON.stringify(call);
        expect(logged).not.toContain('voorbeeld');
        expect(logged).not.toContain(ip);
      }
    }
    expect(spies.some((s) => s.mock.calls.length > 0)).toBe(true);
  });
});
