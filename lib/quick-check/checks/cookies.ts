import { COOKIES_MESSAGES as M } from '@/lib/quick-check/messages';
import type { CheckResult } from '@/lib/quick-check/types';

interface CookieFlags {
  secure: boolean;
  httpOnly: boolean;
  sameSite: string | null;
}

/** Reads only the attributes. The name=value pair is never kept. */
function parseFlags(setCookie: string): CookieFlags {
  const [, ...attrs] = setCookie.split(';');
  const flags: CookieFlags = { secure: false, httpOnly: false, sameSite: null };
  for (const attr of attrs) {
    const [rawKey, ...rest] = attr.split('=');
    const key = rawKey.trim().toLowerCase();
    if (key === 'secure') flags.secure = true;
    else if (key === 'httponly') flags.httpOnly = true;
    else if (key === 'samesite') flags.sameSite = rest.join('=').trim().toLowerCase();
  }
  return flags;
}

export function gradeCookies(setCookie: string[] | null): CheckResult {
  if (setCookie === null) return { id: 'cookies', status: 'unavailable', messageKey: M.unavailable };

  const all = setCookie.filter((c) => c.trim() !== '').map(parseFlags);
  if (all.length === 0) return { id: 'cookies', status: 'good', messageKey: M.none };

  const insecure = all.filter((c) => !c.secure || !c.httpOnly).length;
  if (insecure > 0) {
    return { id: 'cookies', status: 'warn', messageKey: M.insecure, params: { count: insecure } };
  }

  const sameSiteIssues = all.filter(
    (c) => c.sameSite === null || c.sameSite === '' || (c.sameSite === 'none' && !c.secure),
  ).length;
  if (sameSiteIssues > 0) {
    return { id: 'cookies', status: 'warn', messageKey: M.sameSite, params: { count: sameSiteIssues } };
  }

  return { id: 'cookies', status: 'good', messageKey: M.good };
}
