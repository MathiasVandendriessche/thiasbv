import { afterEach, describe, expect, it } from 'vitest';
import {
  createRateLimiter,
  getClientIp,
  globalLimiter,
  quickCheckLimiter,
  scanRequestLimiter,
} from '@/lib/quick-check/rate-limit';

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

describe('createRateLimiter', () => {
  const windows = [
    { limit: 5, ms: 10 * MIN },
    { limit: 20, ms: DAY },
  ];

  it('allows 5 hits in 10 minutes and refuses the 6th', () => {
    const l = createRateLimiter(windows);
    for (let i = 0; i < 5; i++) expect(l.hit('a', 1000 + i)).toBe(true);
    expect(l.hit('a', 1010)).toBe(false);
  });

  it('allows again after 10 min + 1 ms, until 20 in one day', () => {
    const l = createRateLimiter(windows);
    let t = 0;
    let allowed = 0;
    for (let burst = 0; burst < 6; burst++) {
      for (let i = 0; i < 5; i++) if (l.hit('a', t + i)) allowed++;
      t += 10 * MIN + 1;
    }
    expect(allowed).toBe(20);
    expect(l.hit('a', t)).toBe(false);
    expect(l.hit('a', DAY + 5)).toBe(true);
  });

  it('is allowed again exactly after the window has passed', () => {
    const l = createRateLimiter([{ limit: 1, ms: 10 * MIN }]);
    expect(l.hit('a', 0)).toBe(true);
    expect(l.hit('a', 10 * MIN)).toBe(false);
    expect(l.hit('a', 10 * MIN + 1)).toBe(true);
  });

  it('does not count refused hits', () => {
    const l = createRateLimiter([{ limit: 2, ms: 1000 }]);
    expect(l.hit('a', 0)).toBe(true);
    expect(l.hit('a', 1)).toBe(true);
    for (let i = 0; i < 10; i++) expect(l.hit('a', 500)).toBe(false);
    expect(l.hit('a', 1001)).toBe(true);
  });

  it('checks all windows before counting (no partial recording)', () => {
    const l = createRateLimiter([
      { limit: 1, ms: 1000 },
      { limit: 100, ms: 100_000 },
    ]);
    expect(l.hit('a', 0)).toBe(true);
    expect(l.hit('a', 10)).toBe(false);
    expect(l.hit('a', 1001)).toBe(true);
    // only 2 allowed hits recorded in the long window
    const l2 = createRateLimiter([
      { limit: 1, ms: 1000 },
      { limit: 2, ms: 100_000 },
    ]);
    expect(l2.hit('a', 0)).toBe(true);
    for (let i = 0; i < 5; i++) expect(l2.hit('a', 10 + i)).toBe(false);
    expect(l2.hit('a', 1001)).toBe(true);
    expect(l2.hit('a', 2002)).toBe(false);
  });

  it('keeps keys independent', () => {
    const l = createRateLimiter([{ limit: 1, ms: 1000 }]);
    expect(l.hit('a', 0)).toBe(true);
    expect(l.hit('b', 0)).toBe(true);
    expect(l.hit('a', 1)).toBe(false);
  });

  it('cleans up expired keys', () => {
    const l = createRateLimiter(windows);
    l.hit('a', 0);
    l.hit('b', 1);
    expect(l.size(2)).toBe(2);
    expect(l.size(DAY + 10)).toBe(0);
  });

  it('drops the oldest key when maxKeys is exceeded', () => {
    const l = createRateLimiter([{ limit: 1, ms: DAY }], { maxKeys: 2 });
    l.hit('a', 0);
    l.hit('b', 1);
    l.hit('c', 2);
    expect(l.size(3)).toBe(2);
    expect(l.hit('b', 4)).toBe(false);
    expect(l.hit('c', 5)).toBe(false);
    expect(l.hit('a', 6)).toBe(true); // 'a' was dropped, starts fresh
  });

  it('uses Date.now() by default', () => {
    const l = createRateLimiter([{ limit: 1, ms: DAY }]);
    expect(l.hit('a')).toBe(true);
    expect(l.hit('a')).toBe(false);
  });
});

describe('singletons', () => {
  it('exports limiters with the configured values', () => {
    const k = `t-${Math.random()}`;
    for (let i = 0; i < 5; i++) expect(quickCheckLimiter.hit(k)).toBe(true);
    expect(quickCheckLimiter.hit(k)).toBe(false);
    for (let i = 0; i < 3; i++) expect(scanRequestLimiter.hit(k)).toBe(true);
    expect(scanRequestLimiter.hit(k)).toBe(false);
  });

  it('global limiter allows 60 per hour', () => {
    const now = 10 * DAY;
    let allowed = 0;
    for (let i = 0; i < 70; i++) if (globalLimiter.hit('global', now + i)) allowed++;
    expect(allowed).toBe(60);
  });
});

describe('getClientIp', () => {
  afterEach(() => {
    delete process.env.CLIENT_IP_HEADER;
  });

  it('takes the last item, trimmed', () => {
    const h = new Headers({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' });
    expect(getClientIp(h)).toBe('2.2.2.2');
  });

  it('returns null for a missing or blank header', () => {
    expect(getClientIp(new Headers())).toBeNull();
    expect(getClientIp(new Headers({ 'x-forwarded-for': '   ' }))).toBeNull();
  });

  it('returns null for an empty last item', () => {
    expect(getClientIp(new Headers({ 'x-forwarded-for': '1.1.1.1,' }))).toBeNull();
  });

  it('caps the value at 64 chars', () => {
    expect(getClientIp(new Headers({ 'x-forwarded-for': 'a'.repeat(64) }))).toBe('a'.repeat(64));
    expect(getClientIp(new Headers({ 'x-forwarded-for': 'a'.repeat(65) }))).toBeNull();
  });

  it('reads CLIENT_IP_HEADER at call time', () => {
    const h = new Headers({ 'x-real-ip': '9.9.9.9', 'x-forwarded-for': '1.1.1.1' });
    process.env.CLIENT_IP_HEADER = 'x-real-ip';
    expect(getClientIp(h)).toBe('9.9.9.9');
    process.env.CLIENT_IP_HEADER = '';
    expect(getClientIp(h)).toBe('1.1.1.1');
  });

  it('prefers an explicit header name argument', () => {
    const h = new Headers({ 'cf-connecting-ip': '5.5.5.5' });
    expect(getClientIp(h, 'cf-connecting-ip')).toBe('5.5.5.5');
  });
});
