import {
  CONTACT_IP_LIMITS,
  MAIL_GLOBAL_LIMITS,
  QUICK_CHECK_GLOBAL_LIMITS,
  RATE_LIMIT_SWEEP_MS,
  QUICK_CHECK_IP_LIMITS,
  SCAN_REQUEST_IP_LIMITS,
  type RateLimitWindow,
} from './constants';

/** A rate-limit window: at most `limit` hits per `ms` milliseconds. */
export type Window = RateLimitWindow;

export interface RateLimiter {
  /** Returns true when allowed (and records the hit); false when refused. */
  hit(key: string, now?: number): boolean;
  /** Number of keys currently tracked, after dropping expired ones. */
  size(now?: number): number;
}

const DEFAULT_MAX_KEYS = 10_000;

export interface RateLimiterOptions {
  maxKeys?: number;
  /**
   * When set, expired keys are also dropped on a timer (unref'd, so it never
   * keeps the process alive). Without it, they are only dropped on the next
   * hit() or size(). Used for the shared limiters, so a client IP is never
   * kept longer than the longest window plus this interval.
   */
  sweepIntervalMs?: number;
}

/**
 * In-memory sliding-window limiter. Nothing is persisted, and keys (client
 * IPs) are never logged. A hit is allowed only if every window has room; only
 * allowed hits are recorded.
 */
export function createRateLimiter(
  windows: readonly Window[],
  opts: RateLimiterOptions = {},
): RateLimiter {
  const maxKeys = opts.maxKeys ?? DEFAULT_MAX_KEYS;
  const longest = Math.max(0, ...windows.map((w) => w.ms));
  // Insertion order == order of last recorded hit (keys are re-inserted).
  const hits = new Map<string, number[]>();

  function sweep(now: number): void {
    for (const [key, stamps] of hits) {
      const newest = stamps[stamps.length - 1];
      if (newest !== undefined && now - newest <= longest) break;
      hits.delete(key);
    }
  }

  if (opts.sweepIntervalMs !== undefined && opts.sweepIntervalMs > 0) {
    const timer = setInterval(() => sweep(Date.now()), opts.sweepIntervalMs);
    timer.unref?.();
  }

  return {
    hit(key, now = Date.now()) {
      sweep(now);
      const stamps = (hits.get(key) ?? []).filter((t) => now - t <= longest);
      for (const w of windows) {
        const inWindow = stamps.filter((t) => now - t <= w.ms).length;
        if (inWindow >= w.limit) {
          if (stamps.length === 0) hits.delete(key);
          else hits.set(key, stamps);
          return false;
        }
      }
      hits.delete(key);
      hits.set(key, [...stamps, now]);
      while (hits.size > maxKeys) {
        const oldest = hits.keys().next().value;
        if (oldest === undefined) break;
        hits.delete(oldest);
      }
      return true;
    },
    size(now = Date.now()) {
      sweep(now);
      return hits.size;
    },
  };
}

const MAX_IP_LENGTH = 64;

/**
 * Client IP from the header set by our own proxy (last comma-separated item).
 * The header name comes from CLIENT_IP_HEADER (default x-forwarded-for) and is
 * read at call time. No format validation; returns null when absent or odd.
 */
export function getClientIp(
  headers: Headers,
  headerName: string | undefined = process.env.CLIENT_IP_HEADER,
): string | null {
  const name = headerName?.trim() || 'x-forwarded-for';
  let raw: string | null;
  try {
    raw = headers.get(name);
  } catch {
    // Invalid header name (misconfigured CLIENT_IP_HEADER): treat as absent.
    return null;
  }
  if (!raw || !raw.trim()) return null;
  const last = raw.split(',').pop()?.trim() ?? '';
  if (!last || last.length > MAX_IP_LENGTH) return null;
  return last;
}

const shared = { sweepIntervalMs: RATE_LIMIT_SWEEP_MS } as const;

export const quickCheckLimiter = createRateLimiter(QUICK_CHECK_IP_LIMITS, shared);
export const globalLimiter = createRateLimiter(QUICK_CHECK_GLOBAL_LIMITS, shared);
export const scanRequestLimiter = createRateLimiter(SCAN_REQUEST_IP_LIMITS, shared);
export const contactLimiter = createRateLimiter(CONTACT_IP_LIMITS, shared);
/** Shared by every route that sends mail; always hit with the key 'global'. */
export const mailGlobalLimiter = createRateLimiter(MAIL_GLOBAL_LIMITS, shared);
