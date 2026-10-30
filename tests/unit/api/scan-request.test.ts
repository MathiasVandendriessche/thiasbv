import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/mail/graph', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mail/graph')>();
  return { ...actual, sendMail: vi.fn() };
});

import * as route from '@/app/api/scan-request/route';
import { MailError, sendMail } from '@/lib/mail/graph';

const { POST } = route;
const sendMock = vi.mocked(sendMail);

let ipCounter = 0;
const freshIp = () => `198.51.100.${++ipCounter}`;

const valid = {
  email: 'jan@voorbeeld.be',
  name: 'Jan Peeters',
  company: 'Voorbeeld BV',
  domain: 'https://Voorbeeld.be/pad',
  consent: true,
  website: '',
  lang: 'nl',
};

function req(body: unknown, ip = freshIp(), raw = false) {
  return new NextRequest('http://localhost/api/scan-request', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

describe('POST /api/scan-request', () => {
  const spies: ReturnType<typeof vi.spyOn>[] = [];

  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue(undefined);
    for (const m of ['log', 'info', 'warn', 'error', 'debug'] as const) {
      spies.push(vi.spyOn(console, m).mockImplementation(() => {}));
    }
  });
  afterEach(() => {
    vi.restoreAllMocks();
    spies.length = 0;
  });

  it('only exports POST with node runtime', () => {
    const handlers = Object.keys(route).filter((k) =>
      /^(GET|HEAD|PUT|PATCH|DELETE|OPTIONS|POST)$/.test(k),
    );
    expect(handlers).toEqual(['POST']);
    expect(route.runtime).toBe('nodejs');
    expect(route.dynamic).toBe('force-dynamic');
  });

  it('sends the mail for a valid request', async () => {
    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({ success: true });
    expect(sendMock).toHaveBeenCalledTimes(1);
    const arg = sendMock.mock.calls[0][0];
    expect(arg.subject).toBe('Aanvraag volledige scan: voorbeeld.be');
    expect(arg.replyTo).toBe('jan@voorbeeld.be');
    expect(arg.text).toContain('E-mail: jan@voorbeeld.be');
    expect(arg.text).toContain('Naam: Jan Peeters');
    expect(arg.text).toContain('Bedrijf: Voorbeeld BV');
    expect(arg.text).toContain('Domein: voorbeeld.be');
    expect(arg.text).toContain('Taal: nl');
    expect(arg.text).toMatch(/Tijdstip: \d{4}-\d{2}-\d{2}T[\d:.]+Z/);
  });

  it('shows "-" for empty optional fields and strips CR/LF from name and company', async () => {
    await POST(req({ ...valid, name: 'Jan\r\nBcc: x@y.be', company: undefined }));
    const text = sendMock.mock.calls[0][0].text;
    expect(text).toContain('Naam: Jan Bcc: x@y.be');
    expect(text).toContain('Bedrijf: -');
    expect(text.split('\n').filter((l) => l.startsWith('Bcc:'))).toHaveLength(0);
  });

  it.each([
    ['consent false', { consent: false }],
    ['consent missing', { consent: undefined }],
    ['consent string', { consent: 'true' }],
    ['invalid email', { email: 'nope' }],
    ['email not string', { email: 5 }],
    ['invalid domain', { domain: 'localhost' }],
    ['domain missing', { domain: undefined }],
    ['bad lang', { lang: 'de' }],
    ['name not string', { name: 5 }],
    ['name too long', { name: 'a'.repeat(201) }],
    ['company too long', { company: 'a'.repeat(201) }],
  ])('rejects %s with 400', async (_label, patch) => {
    const res = await POST(req({ ...valid, ...patch }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, error: 'invalid' });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('rejects non-JSON, arrays and oversized bodies with 400', async () => {
    expect((await POST(req('{nope', freshIp(), true))).status).toBe(400);
    expect((await POST(req([1]))).status).toBe(400);
    expect((await POST(req({ ...valid, name: 'a'.repeat(3000) }))).status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('accepts name/company of exactly 200 chars', async () => {
    const res = await POST(req({ ...valid, name: 'a'.repeat(200), company: 'b'.repeat(200) }));
    expect(res.status).toBe(200);
  });

  it('honeypot filled returns success without mail and without using rate limit', async () => {
    const ip = freshIp();
    for (let i = 0; i < 5; i++) {
      const res = await POST(req({ ...valid, website: 'http://spam.example' }, ip));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    }
    expect(sendMock).not.toHaveBeenCalled();
    for (let i = 0; i < 3; i++) expect((await POST(req(valid, ip))).status).toBe(200);
  });

  it('invalid input does not consume rate limit', async () => {
    const ip = freshIp();
    for (let i = 0; i < 5; i++) await POST(req({ ...valid, email: 'bad' }, ip));
    for (let i = 0; i < 3; i++) expect((await POST(req(valid, ip))).status).toBe(200);
  });

  it('returns 429 on the 4th request within an hour from one IP', async () => {
    const ip = freshIp();
    for (let i = 0; i < 3; i++) expect((await POST(req(valid, ip))).status).toBe(200);
    const res = await POST(req(valid, ip));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ success: false, error: 'rate_limited' });
    expect(sendMock).toHaveBeenCalledTimes(3);
  });

  it('returns 503 when sending fails and logs only a fixed code', async () => {
    sendMock.mockRejectedValue(new MailError('send_failed'));
    const res = await POST(req(valid));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ success: false, error: 'unavailable' });
    const logged = JSON.stringify(
      (['log', 'info', 'warn', 'error', 'debug'] as const).flatMap((m) =>
        vi.mocked(console[m]).mock.calls,
      ),
    );
    expect(logged).toContain('scan-request: send_failed');
    expect(logged).not.toMatch(/jan@voorbeeld|Jan Peeters|Voorbeeld|198\.51\.100/);
  });

  it('logs a fixed code for non-mail errors', async () => {
    sendMock.mockRejectedValue(new Error('boom jan@voorbeeld.be'));
    const res = await POST(req(valid));
    expect(res.status).toBe(503);
    const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logged).toContain('scan-request: unknown');
    expect(logged).not.toContain('jan@voorbeeld');
  });
});
