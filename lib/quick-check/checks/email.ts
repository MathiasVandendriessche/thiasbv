import type dns from 'node:dns';
import { EMAIL_MESSAGES as M } from '@/lib/quick-check/messages';
import { getDnsResolver } from '@/lib/quick-check/net/dns';
import type { CheckResult } from '@/lib/quick-check/types';

/** Promise-based resolver (dns.promises.resolveTxt), so tests can inject a plain async function. */
export type ResolveTxt = typeof dns.promises.resolveTxt;

const DNS_TIMEOUT_MS = 4000;
const MISSING_CODES = new Set(['ENOTFOUND', 'ENODATA']);

const result = (status: CheckResult['status'], messageKey: string): CheckResult => ({
  id: 'email',
  status,
  messageKey,
});

/** Pure grading. `spfCount` is the number of SPF records found (more than 1 is invalid). */
export function gradeEmail(spf: string | null, dmarc: string | null, spfCount = spf ? 1 : 0): CheckResult {
  if (!spf && !dmarc) return result('bad', M.missingBoth);
  if (spfCount > 1) return result('warn', M.spfMultiple);
  if (!spf) return result('warn', M.noSpf);
  if (!dmarc) return result('warn', M.noDmarc);

  // A bare `all` means `+all`. Only -all and ~all count as restrictive.
  const allMatch = /(?:^|\s)([+?~-]?)all(?:\s|$)/i.exec(spf);
  if (allMatch && (allMatch[1] === '' || allMatch[1] === '+' || allMatch[1] === '?')) {
    return result('warn', M.spfWeak);
  }

  const policy = /(?:^|;)\s*p\s*=\s*([a-z]+)/i.exec(dmarc)?.[1]?.toLowerCase() ?? 'none';
  if (policy !== 'quarantine' && policy !== 'reject') return result('warn', M.dmarcNone);

  return result('good', M.good);
}

class DnsUnavailableError extends Error {}

/** Returns the joined TXT records, [] when the name has none, throws on any other DNS problem. */
async function lookupTxt(name: string, resolveTxt: ResolveTxt): Promise<string[]> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new DnsUnavailableError()), DNS_TIMEOUT_MS);
  });
  try {
    const records = await Promise.race([
      resolveTxt(name),
      timeout,
    ]);
    return records.map((chunks) => chunks.join(''));
  } catch (err) {
    const code = (err as { code?: unknown } | null)?.code;
    if (typeof code === 'string' && MISSING_CODES.has(code)) return [];
    throw new DnsUnavailableError();
  } finally {
    clearTimeout(timer);
  }
}

export async function checkEmail(
  domain: string,
  resolveTxt: ResolveTxt = (name) => getDnsResolver().resolveTxt(name),
): Promise<CheckResult> {
  try {
    const [root, dmarcRecords] = await Promise.all([
      lookupTxt(domain, resolveTxt),
      lookupTxt(`_dmarc.${domain}`, resolveTxt),
    ]);
    const spfRecords = root.filter((r) => /^v=spf1(\s|$)/i.test(r.trim()));
    const dmarc = dmarcRecords.find((r) => /^v=DMARC1/i.test(r.trim())) ?? null;
    return gradeEmail(spfRecords[0] ?? null, dmarc, spfRecords.length);
  } catch {
    return result('unavailable', M.unavailable);
  }
}
