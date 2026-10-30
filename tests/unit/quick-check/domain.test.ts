import { describe, expect, it } from 'vitest';
import { normalizeDomain } from '@/lib/quick-check/domain';

const ok = (domain: string) => ({ ok: true, domain });
const fail = (reason: string) => ({ ok: false, reason });

describe('normalizeDomain', () => {
  describe('accepts and normalizes', () => {
    it('plain domain', () => {
      expect(normalizeDomain('voorbeeld.be')).toEqual(ok('voorbeeld.be'));
    });
    it('pasted URL is reduced to the lowercase host', () => {
      expect(normalizeDomain(' HTTPS://WWW.Voorbeeld.be/contact?x=1 ')).toEqual(ok('www.voorbeeld.be'));
    });
    it('strips a trailing dot', () => {
      expect(normalizeDomain('voorbeeld.be.')).toEqual(ok('voorbeeld.be'));
    });
    it('converts IDN to punycode', () => {
      expect(normalizeDomain('müller.be')).toEqual(ok('xn--mller-kva.be'));
    });
    it('accepts a path without scheme', () => {
      expect(normalizeDomain('voorbeeld.be/pad')).toEqual(ok('voorbeeld.be'));
    });
  });

  describe('ports', () => {
    it.each(['voorbeeld.be:8443', 'https://voorbeeld.be:443', 'http://voorbeeld.be:80', 'voorbeeld.be:80/x'])(
      '%s is port_not_allowed',
      (input) => {
        expect(normalizeDomain(input)).toEqual(fail('port_not_allowed'));
      },
    );
  });

  describe('IP addresses', () => {
    it.each(['1.2.3.4', '[::1]', '0x7f000001', '2130706433', '127.1', 'http://10.0.0.1/', '[2001:db8::1]:443'])(
      '%s is ip_not_allowed',
      (input) => {
        const r = normalizeDomain(input);
        expect(r.ok).toBe(false);
        if (!r.ok) expect(['ip_not_allowed', 'port_not_allowed']).toContain(r.reason);
      },
    );
    it.each(['1.2.3.4', '[::1]', '0x7f000001', '2130706433', '127.1', 'http://10.0.0.1/'])(
      '%s is exactly ip_not_allowed',
      (input) => {
        expect(normalizeDomain(input)).toEqual(fail('ip_not_allowed'));
      },
    );
  });

  describe('internal names', () => {
    it.each(['localhost', 'intranet', 'printer.local', 'x.internal', 'a.lan', 'b.home.arpa', 'c.localhost'])(
      '%s is internal_name',
      (input) => {
        expect(normalizeDomain(input)).toEqual(fail('internal_name'));
      },
    );
  });

  describe('invalid input', () => {
    it('credentials in the URL', () => {
      expect(normalizeDomain('user:pw@voorbeeld.be')).toEqual(fail('invalid'));
      expect(normalizeDomain('https://user@voorbeeld.be')).toEqual(fail('invalid'));
    });
    it('label of 64 characters', () => {
      expect(normalizeDomain(`${'a'.repeat(64)}.be`)).toEqual(fail('invalid'));
    });
    it('leading hyphen and underscore', () => {
      expect(normalizeDomain('-a.be')).toEqual(fail('invalid'));
      expect(normalizeDomain('a_b.be')).toEqual(fail('invalid'));
      expect(normalizeDomain('a-.be')).toEqual(fail('invalid'));
    });
    it('digit-only TLD', () => {
      expect(normalizeDomain('a.123')).toEqual(fail('invalid'));
    });
    it('empty labels and other schemes', () => {
      expect(normalizeDomain('a..be')).toEqual(fail('invalid'));
      expect(normalizeDomain('ftp://voorbeeld.be')).toEqual(fail('invalid'));
      expect(normalizeDomain('https://')).toEqual(fail('invalid'));
    });
    it('non-string, non-empty values', () => {
      expect(normalizeDomain(42)).toEqual(fail('invalid'));
      expect(normalizeDomain({})).toEqual(fail('invalid'));
    });
  });

  describe('empty', () => {
    it.each([['empty string', ''], ['whitespace', '   '], ['null', null], ['undefined', undefined]])(
      '%s is empty',
      (_n, input) => {
        expect(normalizeDomain(input)).toEqual(fail('empty'));
      },
    );
  });

  describe('length', () => {
    it('254 characters is too_long', () => {
      const host = `${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(59)}.be`;
      expect(host.length).toBe(254);
      expect(normalizeDomain(host)).toEqual(fail('too_long'));
    });
    it('253 characters is accepted', () => {
      const host = `${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(58)}.be`;
      expect(host.length).toBe(253);
      expect(normalizeDomain(host)).toEqual(ok(host));
    });
    it('absurdly long input is too_long', () => {
      expect(normalizeDomain(`voorbeeld.be/${'x'.repeat(5000)}`)).toEqual(fail('too_long'));
    });
  });
});
