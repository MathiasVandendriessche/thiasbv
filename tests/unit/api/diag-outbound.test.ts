import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('node:dns', () => ({
  promises: {
    resolve4: vi.fn().mockResolvedValue(['93.184.216.34']),
    resolveTxt: vi.fn().mockResolvedValue([['v=DMARC1']]),
  },
}));
vi.mock('node:https', () => ({ default: { request: vi.fn() } }));
vi.mock('node:http', () => ({ default: { request: vi.fn() } }));

import https from 'node:https';
import http from 'node:http';
import { GET } from '@/app/api/diag-outbound/route';

function fakeRequest(errCode?: string) {
  return (_url: string, _opts: unknown, cb: (res: { resume: () => void }) => void) => {
    const handlers: Record<string, (e?: unknown) => void> = {};
    return {
      on: (ev: string, fn: (e?: unknown) => void) => { handlers[ev] = fn; },
      destroy: vi.fn(),
      end: () => {
        if (errCode) handlers.error?.(Object.assign(new Error('x'), { code: errCode }));
        else cb({ resume: () => {} });
      },
    };
  };
}

const call = (qs: string, headers: Record<string, string> = {}) =>
  GET(new NextRequest(`http://localhost/api/diag-outbound${qs}`, { headers }));

describe('GET /api/diag-outbound key gate', () => {
  beforeEach(() => {
    vi.mocked(https.request).mockImplementation(fakeRequest() as never);
    vi.mocked(http.request).mockImplementation(fakeRequest('ENOTFOUND') as never);
  });
  afterEach(() => {
    delete process.env.DIAG_KEY;
  });

  it('404 when DIAG_KEY is unset, even with empty k', async () => {
    expect((await call('?k=')).status).toBe(404);
    expect((await call('')).status).toBe(404);
  });

  it('404 when DIAG_KEY is empty', async () => {
    process.env.DIAG_KEY = '';
    expect((await call('?k=')).status).toBe(404);
  });

  it('404 on missing or wrong key', async () => {
    process.env.DIAG_KEY = 'secret-key';
    expect((await call('')).status).toBe(404);
    expect((await call('?k=wrong')).status).toBe(404);
    expect((await call('?k=secret-keyX')).status).toBe(404);
  });

  it('200 with expected shape on right key', async () => {
    process.env.DIAG_KEY = 'secret-key';
    const res = await call('?k=secret-key', { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await res.json();
    expect(body.probes.dnsResolve4).toEqual({ ok: true });
    expect(body.probes.httpsHead).toEqual({ ok: true });
    expect(body.probes.httpHead).toEqual({ ok: false, error: 'ENOTFOUND' });
    expect(body.probes.dnsTxtDmarc).toEqual({ ok: true });
    expect(body.headerNames).toContain('x-forwarded-for');
    expect(body.ipHeaders['x-forwarded-for']).toBe('1.2.3.4, 5.6.7.8');
    expect(body.ipHeaders['x-real-ip']).toBeNull();
  });
});
