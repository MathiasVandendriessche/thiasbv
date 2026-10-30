/**
 * Every limit of the public quick check lives here, so later modules import
 * one source of truth instead of repeating numbers.
 */

/** Hard time-out per outbound request (DNS lookup included). */
export const REQUEST_TIMEOUT_MS = 4_000;

/** Hard time budget for one complete quick check. */
export const TOTAL_TIMEOUT_MS = 12_000;

/** Maximum response body that is read; the rest is discarded. */
export const MAX_RESPONSE_BYTES = 256 * 1024;

/** Maximum number of redirect hops that are followed. */
export const MAX_REDIRECTS = 3;

/** The only ports an outbound request may use, per scheme. */
export const ALLOWED_PORTS: Readonly<Record<'http:' | 'https:', number>> = Object.freeze({
  'http:': 80,
  'https:': 443,
});

/** The only HTTP methods an outbound request may use. */
export const ALLOWED_METHODS = ['GET', 'HEAD'] as const;

/** Maximum length of a domain name (input validation). */
export const MAX_DOMAIN_LENGTH = 253;

/** User-Agent of every outbound request. */
export const USER_AGENT = 'ThiasSecureScanQuickCheck/1.0 (+https://www.thiasbv.com/nl/ai-projecten)';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** A rate-limit window: at most `limit` hits per `ms` milliseconds. */
export interface RateLimitWindow {
  readonly limit: number;
  readonly ms: number;
}

/** Per client IP: 5 checks / 10 min and 20 / day. */
export const QUICK_CHECK_IP_LIMITS: readonly RateLimitWindow[] = Object.freeze([
  { limit: 5, ms: 10 * MINUTE_MS },
  { limit: 20, ms: DAY_MS },
]);

/** Global, all visitors together: 60 / hour and 300 / day. */
export const QUICK_CHECK_GLOBAL_LIMITS: readonly RateLimitWindow[] = Object.freeze([
  { limit: 60, ms: HOUR_MS },
  { limit: 300, ms: DAY_MS },
]);

/** Scan-request route, per client IP: 3 / hour. */
export const SCAN_REQUEST_IP_LIMITS: readonly RateLimitWindow[] = Object.freeze([
  { limit: 3, ms: HOUR_MS },
]);

/** Contact form route, per client IP: 3 / hour. */
export const CONTACT_IP_LIMITS: readonly RateLimitWindow[] = Object.freeze([
  { limit: 3, ms: HOUR_MS },
]);

/**
 * Every mail the site sends (contact form and scan request together):
 * 20 / hour and 50 / day, so a flood can never exhaust the mailbox's
 * sending limits.
 */
export const MAIL_GLOBAL_LIMITS: readonly RateLimitWindow[] = Object.freeze([
  { limit: 20, ms: HOUR_MS },
  { limit: 50, ms: DAY_MS },
]);

/** How often the shared limiters drop expired client-IP entries. */
export const RATE_LIMIT_SWEEP_MS = 10 * MINUTE_MS;

/**
 * DNS resolver settings (c-ares, not the libuv thread pool): a query that gets
 * no answer gives up after 1.5 s instead of occupying a worker thread.
 */
export const DNS_RESOLVER_OPTIONS = Object.freeze({ timeout: 1_500, tries: 1 });
