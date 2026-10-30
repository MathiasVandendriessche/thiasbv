import type { SafeResponse } from '@/lib/quick-check/net/safe-request';
import { HEADERS_MESSAGES as M } from '@/lib/quick-check/messages';
import type { CheckResult } from '@/lib/quick-check/types';

type Headers = SafeResponse['headers'];

function get(headers: Headers, name: string): string {
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === name) return (Array.isArray(value) ? value.join(', ') : value).trim();
  }
  return '';
}

const hasHsts = (v: string) => {
  const m = /(?:^|[;\s])max-age\s*=\s*"?(\d+)/i.exec(v);
  return m !== null && Number(m[1]) > 0;
};

const hasFrameProtection = (xfo: string, csp: string) => {
  const v = xfo.toLowerCase();
  return v === 'deny' || v === 'sameorigin' || /(?:^|[;\s])frame-ancestors\s/i.test(csp);
};

export function gradeHeaders(headers: Headers | null): CheckResult {
  if (!headers) return { id: 'headers', status: 'unavailable', messageKey: M.unavailable };

  const csp = get(headers, 'content-security-policy');
  const checks: ReadonlyArray<readonly [string, boolean]> = [
    ['Strict-Transport-Security', hasHsts(get(headers, 'strict-transport-security'))],
    ['Content-Security-Policy', csp !== ''],
    ['X-Frame-Options', hasFrameProtection(get(headers, 'x-frame-options'), csp)],
    ['X-Content-Type-Options', get(headers, 'x-content-type-options').toLowerCase() === 'nosniff'],
    ['Referrer-Policy', get(headers, 'referrer-policy') !== ''],
    ['Permissions-Policy', get(headers, 'permissions-policy') !== ''],
  ];
  const missing = checks.filter(([, ok]) => !ok).map(([name]) => name);

  if (missing.length === 0) return { id: 'headers', status: 'good', messageKey: M.good };
  return {
    id: 'headers',
    status: missing.length >= 3 ? 'bad' : 'warn',
    messageKey: M.missing,
    params: { missing: missing.join(', '), count: missing.length },
  };
}
