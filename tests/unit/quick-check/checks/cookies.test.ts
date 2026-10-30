import { describe, expect, it } from 'vitest';
import { gradeCookies } from '@/lib/quick-check/checks/cookies';
import { MESSAGE_KEYS } from '@/lib/quick-check/messages';

describe('gradeCookies', () => {
  it('is unavailable for null', () => {
    expect(gradeCookies(null)).toMatchObject({ id: 'cookies', status: 'unavailable', messageKey: 'cookies.unavailable' });
  });

  it('is good (cookies.none) without cookies', () => {
    expect(gradeCookies([])).toMatchObject({ status: 'good', messageKey: 'cookies.none' });
  });

  it('is good for fully flagged cookies, case-insensitively', () => {
    const r = gradeCookies(['sid=abc; PATH=/; SECURE; HTTPONLY; samesite=LAX', 'b=2; Secure; HttpOnly; SameSite=Strict']);
    expect(r).toMatchObject({ status: 'good', messageKey: 'cookies.good' });
  });

  it('warns with count when Secure or HttpOnly is missing, across multiple cookies', () => {
    const r = gradeCookies([
      'a=1; Secure; HttpOnly; SameSite=Lax',
      'b=2; HttpOnly; SameSite=Lax',
      'c=3; Secure; SameSite=Lax',
    ]);
    expect(r).toMatchObject({ status: 'warn', messageKey: 'cookies.insecure', params: { count: 2 } });
  });

  it('warns when only SameSite is missing', () => {
    const r = gradeCookies(['a=1; Secure; HttpOnly']);
    expect(r).toMatchObject({ status: 'warn', messageKey: 'cookies.sameSite', params: { count: 1 } });
  });

  it('counts SameSite=None without Secure as an issue', () => {
    expect(gradeCookies(['a=1; HttpOnly; SameSite=None']).status).toBe('warn');
    expect(gradeCookies(['a=1; Secure; HttpOnly; SameSite=None']).status).toBe('good');
  });

  it('never leaks cookie names or values', () => {
    const r = gradeCookies(['supersecretname=supersecretvalue; Path=/']);
    expect(JSON.stringify(r)).not.toContain('supersecret');
  });

  it('only returns known message keys', () => {
    const rs = [
      gradeCookies(null),
      gradeCookies([]),
      gradeCookies(['a=1; Secure; HttpOnly; SameSite=Lax']),
      gradeCookies(['a=1']),
      gradeCookies(['a=1; Secure; HttpOnly']),
    ];
    for (const r of rs) expect(MESSAGE_KEYS).toContain(r.messageKey);
  });
});
