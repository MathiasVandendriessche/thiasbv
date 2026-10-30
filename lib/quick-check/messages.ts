/**
 * Every messageKey a grader can return. The UI copy (NL/EN/FR) must have a
 * text for each of these. Graders use these constants, never free-form strings.
 */
export const TLS_MESSAGES = {
  good: 'tls.good',
  expiresSoon: 'tls.expiresSoon',
  expired: 'tls.expired',
  invalidCert: 'tls.invalidCert',
  unreadableExpiry: 'tls.unreadableExpiry',
  oldProtocol: 'tls.oldProtocol',
  noHttpsRedirect: 'tls.noHttpsRedirect',
  unavailable: 'tls.unavailable',
} as const;

export const HEADERS_MESSAGES = {
  good: 'headers.good',
  missing: 'headers.missing',
  unavailable: 'headers.unavailable',
} as const;

export const COOKIES_MESSAGES = {
  none: 'cookies.none',
  good: 'cookies.good',
  insecure: 'cookies.insecure',
  sameSite: 'cookies.sameSite',
  unavailable: 'cookies.unavailable',
} as const;

export const EMAIL_MESSAGES = {
  good: 'email.good',
  missingBoth: 'email.missingBoth',
  noSpf: 'email.noSpf',
  noDmarc: 'email.noDmarc',
  spfMultiple: 'email.spfMultiple',
  spfWeak: 'email.spfWeak',
  dmarcNone: 'email.dmarcNone',
  unavailable: 'email.unavailable',
} as const;

export const MESSAGE_KEYS: readonly string[] = [
  ...Object.values(TLS_MESSAGES),
  ...Object.values(HEADERS_MESSAGES),
  ...Object.values(COOKIES_MESSAGES),
  ...Object.values(EMAIL_MESSAGES),
];
