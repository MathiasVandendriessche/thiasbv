import { describe, expect, it } from 'vitest';
import { gradeTls } from '@/lib/quick-check/checks/tls';
import { MESSAGE_KEYS } from '@/lib/quick-check/messages';
import type { SafeResponse } from '@/lib/quick-check/net/safe-request';

const now = new Date('2026-10-30T12:00:00Z');
const DAY = 86_400_000;
const validTo = (days: number) => new Date(now.getTime() + days * DAY).toUTCString();

function https(over: Partial<NonNullable<SafeResponse['tlsInfo']>> = {}): SafeResponse {
  return {
    status: 200,
    headers: {},
    body: '',
    url: 'https://example.com/',
    ip: '93.184.216.34',
    tlsInfo: { protocol: 'TLSv1.3', validTo: validTo(90), authorized: true, ...over },
  };
}

const grade = (h: SafeResponse | null, r: boolean | null = true) =>
  gradeTls({ https: h, httpRedirectsToHttps: r, now });

describe('gradeTls', () => {
  it('is good for a valid cert, TLS 1.3 and redirect', () => {
    const r = grade(https());
    expect(r).toMatchObject({ id: 'tls', status: 'good', messageKey: 'tls.good', params: { days: 90 } });
  });

  it('is unavailable when HTTPS is unreachable or has no TLS info', () => {
    expect(grade(null).status).toBe('unavailable');
    expect(grade({ ...https(), tlsInfo: undefined }).status).toBe('unavailable');
  });

  it('warns with days when the cert expires in 10 days', () => {
    const r = grade(https({ validTo: validTo(10) }));
    expect(r).toMatchObject({ status: 'warn', messageKey: 'tls.expiresSoon', params: { days: 10 } });
  });

  it('is good at exactly 21 days and warns at 20', () => {
    expect(grade(https({ validTo: validTo(21) })).status).toBe('good');
    expect(grade(https({ validTo: validTo(20) })).status).toBe('warn');
  });

  it('is bad when expired (0 days or past)', () => {
    expect(grade(https({ validTo: validTo(0) }))).toMatchObject({ status: 'bad', messageKey: 'tls.expired' });
    expect(grade(https({ validTo: validTo(-5), authorized: false })).messageKey).toBe('tls.expired');
  });

  it('is bad for an unauthorized cert', () => {
    const r = grade(https({ authorized: false, authError: 'SELF_SIGNED_CERT_IN_CHAIN' }));
    expect(r).toMatchObject({ status: 'bad', messageKey: 'tls.invalidCert' });
  });

  it.each(['TLSv1', 'TLSv1.1', 'SSLv3', 'weird'])('is bad for protocol %s', (protocol) => {
    expect(grade(https({ protocol }))).toMatchObject({ status: 'bad', messageKey: 'tls.oldProtocol' });
  });

  it('accepts TLS 1.2', () => {
    expect(grade(https({ protocol: 'TLSv1.2' })).status).toBe('good');
  });

  it('fails closed on an unparseable validTo', () => {
    expect(grade(https({ validTo: 'not a date' }))).toMatchObject({
      status: 'bad',
      messageKey: 'tls.unreadableExpiry',
    });
  });

  it('warns when HTTP is served without redirect', () => {
    expect(grade(https(), false)).toMatchObject({ status: 'warn', messageKey: 'tls.noHttpsRedirect' });
  });

  it('does not penalise an unreachable port 80 (null)', () => {
    expect(grade(https(), null).status).toBe('good');
  });

  it('only returns known message keys', () => {
    const cases = [
      grade(null),
      grade(https()),
      grade(https({ validTo: validTo(5) })),
      grade(https({ validTo: validTo(-1) })),
      grade(https({ authorized: false })),
      grade(https({ protocol: 'TLSv1' })),
      grade(https({ validTo: 'x' })),
      grade(https(), false),
    ];
    for (const c of cases) expect(MESSAGE_KEYS).toContain(c.messageKey);
  });
});
