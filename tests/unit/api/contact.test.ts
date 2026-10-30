import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/mail/graph', async () => {
  const actual = await vi.importActual<typeof import('@/lib/mail/graph')>('@/lib/mail/graph');
  return { ...actual, sendMail: vi.fn() };
});

import { sendMail, MailError } from '@/lib/mail/graph';
import { POST } from '@/app/api/contact/route';

const sendMailMock = vi.mocked(sendMail);

function req(body: unknown, raw = false) {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
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

  beforeEach(() => {
    sendMailMock.mockReset();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
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
