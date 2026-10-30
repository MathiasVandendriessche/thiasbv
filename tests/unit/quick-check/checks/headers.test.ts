import { describe, expect, it } from 'vitest';
import { gradeHeaders } from '@/lib/quick-check/checks/headers';
import { MESSAGE_KEYS } from '@/lib/quick-check/messages';

const full: Record<string, string | string[]> = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'content-security-policy': "default-src 'self'",
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=()',
};
const without = (...names: string[]) =>
  Object.fromEntries(Object.entries(full).filter(([k]) => !names.includes(k)));

describe('gradeHeaders', () => {
  it('is unavailable for null', () => {
    expect(gradeHeaders(null)).toMatchObject({ id: 'headers', status: 'unavailable', messageKey: 'headers.unavailable' });
  });

  it('is good with all six', () => {
    expect(gradeHeaders(full)).toMatchObject({ status: 'good', messageKey: 'headers.good' });
  });

  it('warns with 1-2 missing and lists fixed names', () => {
    const r = gradeHeaders(without('referrer-policy', 'permissions-policy'));
    expect(r).toMatchObject({
      status: 'warn',
      messageKey: 'headers.missing',
      params: { missing: 'Referrer-Policy, Permissions-Policy', count: 2 },
    });
  });

  it('is bad with 3+ missing, including an empty header object', () => {
    expect(gradeHeaders(without('referrer-policy', 'permissions-policy', 'x-frame-options')).status).toBe('bad');
    const r = gradeHeaders({});
    expect(r.status).toBe('bad');
    expect(r.params?.missing).toBe(
      'Strict-Transport-Security, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy',
    );
  });

  it('matches header names case-insensitively', () => {
    const upper = Object.fromEntries(Object.entries(full).map(([k, v]) => [k.toUpperCase(), v]));
    expect(gradeHeaders(upper).status).toBe('good');
  });

  it('does not count an empty CSP', () => {
    expect(gradeHeaders({ ...full, 'content-security-policy': '  ' }).params?.missing).toBe(
      'Content-Security-Policy',
    );
  });

  it('accepts frame-ancestors in CSP instead of X-Frame-Options', () => {
    const h = { ...without('x-frame-options'), 'content-security-policy': "frame-ancestors 'none'" };
    expect(gradeHeaders(h).status).toBe('good');
  });

  it('accepts SAMEORIGIN but rejects ALLOW-FROM style values', () => {
    expect(gradeHeaders({ ...full, 'x-frame-options': 'sameorigin' }).status).toBe('good');
    expect(gradeHeaders({ ...full, 'x-frame-options': 'ALLOW-FROM https://a.example' }).params?.missing).toBe(
      'X-Frame-Options',
    );
  });

  it('requires HSTS max-age > 0', () => {
    expect(gradeHeaders({ ...full, 'strict-transport-security': 'max-age=0' }).params?.missing).toBe(
      'Strict-Transport-Security',
    );
    expect(gradeHeaders({ ...full, 'strict-transport-security': 'includeSubDomains' }).params?.missing).toBe(
      'Strict-Transport-Security',
    );
  });

  it('requires nosniff exactly', () => {
    expect(gradeHeaders({ ...full, 'x-content-type-options': 'sniff' }).params?.missing).toBe('X-Content-Type-Options');
  });

  it('handles array header values', () => {
    expect(gradeHeaders({ ...full, 'content-security-policy': ["default-src 'self'"] }).status).toBe('good');
  });

  it('only returns known message keys', () => {
    for (const r of [gradeHeaders(null), gradeHeaders(full), gradeHeaders({})]) {
      expect(MESSAGE_KEYS).toContain(r.messageKey);
    }
  });
});
