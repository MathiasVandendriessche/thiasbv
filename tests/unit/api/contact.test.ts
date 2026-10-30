import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/mail/graph', async () => {
  const actual = await vi.importActual<typeof import('@/lib/mail/graph')>('@/lib/mail/graph');
  return { ...actual, sendMail: vi.fn() };
});

import { sendMail, MailError } from '@/lib/mail/graph';
import { POST } from '@/app/api/contact/route';
import { mailGlobalLimiter } from '@/lib/quick-check/rate-limit';

const sendMailMock = vi.mocked(sendMail);

let ipCounter = 0;
const freshIp = () => `192.0.2.${++ipCounter}`;

function req(body: unknown, raw = false, ip = freshIp(), type = 'application/json') {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': type, 'x-forwarded-for': ip },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

const valid = {
  name: 'Jan Peeters',
  email: 'jan@example.com',
  phone: '+32 470 00 00 00',
  message: 'Graag meer info.',
};

describe('POST /api/contact', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errSpy: ReturnType<typeof vi.spyOn>;

  let mailSpy: MockInstance<typeof mailGlobalLimiter.hit>;

  beforeEach(() => {
    sendMailMock.mockReset();
    // Keep the shared global mail cap out of the way; tested explicitly below.
    mailSpy = vi.spyOn(mailGlobalLimiter, 'hit').mockReturnValue(true);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    mailSpy.mockRestore();
    logSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('sends mail for a valid body', async () => {
    sendMailMock.mockResolvedValue(undefined);
    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const msg = sendMailMock.mock.calls[0][0];
    expect(msg.replyTo).toBe(valid.email);
    expect(msg.text).toContain(valid.name);
    expect(msg.text).toContain(valid.phone);
    expect(msg.text).toContain(valid.message);
  });

  it.each([
    ['missing name', { ...valid, name: '' }],
    ['missing email', { ...valid, email: '' }],
    ['missing message', { ...valid, message: '' }],
    ['invalid email', { ...valid, email: 'not-an-email' }],
    ['name too long', { ...valid, name: 'n'.repeat(201) }],
    ['phone too long', { ...valid, phone: '1'.repeat(51) }],
    ['message too long', { ...valid, message: 'm'.repeat(5001) }],
    ['non-string name', { ...valid, name: 42 }],
  ])('returns 400 on %s', async (_label, body) => {
    const res = await POST(req(body));
    expect(res.status).toBe(400);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('returns 400 on non-JSON body', async () => {
    const res = await POST(req('not json', true));
    expect(res.status).toBe(400);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('accepts fields of exactly the maximum length', async () => {
    sendMailMock.mockResolvedValue(undefined);
    const res = await POST(
      req({ ...valid, name: 'n'.repeat(200), phone: '1'.repeat(50), message: 'm'.repeat(5000) }),
    );
    expect(res.status).toBe(200);
  });

  it('returns 415 for a non-JSON content type and sends nothing', async () => {
    for (const type of ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data']) {
      const res = await POST(req(valid, false, freshIp(), type));
      expect(res.status).toBe(415);
      expect(typeof (await res.json()).error).toBe('string');
    }
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('accepts application/json with a charset parameter', async () => {
    sendMailMock.mockResolvedValue(undefined);
    const res = await POST(req(valid, false, freshIp(), 'application/json; charset=utf-8'));
    expect(res.status).toBe(200);
  });

  it('returns 400 for a body over 8 KB without sending', async () => {
    const res = await POST(req({ ...valid, message: 'm'.repeat(9000) }));
    expect(res.status).toBe(400);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('honeypot filled returns success without mail and without using any limit', async () => {
    sendMailMock.mockResolvedValue(undefined);
    const ip = freshIp();
    for (let i = 0; i < 5; i++) {
      const res = await POST(req({ ...valid, website: 'http://spam.example' }, false, ip));
      expect(res.status).toBe(200);
      expect((await res.json()).success).toBe(true);
    }
    expect(sendMailMock).not.toHaveBeenCalled();
    expect(mailSpy).not.toHaveBeenCalled();
    for (let i = 0; i < 3; i++) expect((await POST(req(valid, false, ip))).status).toBe(200);
  });

  it('returns 400 for a non-string honeypot', async () => {
    const res = await POST(req({ ...valid, website: 5 }));
    expect(res.status).toBe(400);
  });

  it('invalid input does not consume the rate limits', async () => {
    sendMailMock.mockResolvedValue(undefined);
    const ip = freshIp();
    for (let i = 0; i < 5; i++) await POST(req({ ...valid, email: 'bad' }, false, ip));
    expect(mailSpy).not.toHaveBeenCalled();
    for (let i = 0; i < 3; i++) expect((await POST(req(valid, false, ip))).status).toBe(200);
  });

  it('returns 429 on the 4th message within an hour from one IP', async () => {
    sendMailMock.mockResolvedValue(undefined);
    const ip = freshIp();
    for (let i = 0; i < 3; i++) expect((await POST(req(valid, false, ip))).status).toBe(200);
    const res = await POST(req(valid, false, ip));
    expect(res.status).toBe(429);
    expect(typeof (await res.json()).error).toBe('string');
    expect(sendMailMock).toHaveBeenCalledTimes(3);
  });

  it('returns 429 without sending once the shared global mail cap is reached', async () => {
    sendMailMock.mockResolvedValue(undefined);
    mailSpy.mockRestore();
    const now = Date.now();
    while (mailGlobalLimiter.hit('global', now)) {
      // exhaust the hourly cap
    }
    const res = await POST(req(valid));
    expect(res.status).toBe(429);
    expect(sendMailMock).not.toHaveBeenCalled();
    mailSpy = vi.spyOn(mailGlobalLimiter, 'hit').mockReturnValue(true);
  });

  it('returns 502 and does not log PII when sendMail fails', async () => {
    sendMailMock.mockRejectedValue(new MailError('send_failed'));
    const res = await POST(req(valid));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(JSON.stringify(json)).not.toContain(valid.email);
    const logged = JSON.stringify([...logSpy.mock.calls, ...errSpy.mock.calls]);
    expect(logged).not.toContain(valid.email);
    expect(logged).not.toContain(valid.name);
    expect(logged).toContain('contact: send_failed');
  });
});
