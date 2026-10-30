import type { SafeResponse } from '@/lib/quick-check/net/safe-request';
import { TLS_MESSAGES as M } from '@/lib/quick-check/messages';
import type { CheckResult } from '@/lib/quick-check/types';

const DAY_MS = 86_400_000;
const WARN_DAYS = 21;

export interface TlsInput {
  https: SafeResponse | null;
  /** null = port 80 unreachable/unknown: no penalty. false = HTTP served without redirect. */
  httpRedirectsToHttps: boolean | null;
  now: Date;
}

function result(status: CheckResult['status'], messageKey: string, params?: CheckResult['params']): CheckResult {
  return params ? { id: 'tls', status, messageKey, params } : { id: 'tls', status, messageKey };
}

/** TLS 1.2 and up pass. Anything else (SSLv3, TLSv1, TLSv1.1, unknown) fails closed. */
function isModernProtocol(protocol: string): boolean {
  const m = /^TLSv1\.(\d+)$/.exec(protocol);
  return m !== null && Number(m[1]) >= 2;
}

export function gradeTls({ https, httpRedirectsToHttps, now }: TlsInput): CheckResult {
  const info = https?.tlsInfo;
  if (!https || !info) return result('unavailable', M.unavailable);

  if (!isModernProtocol(info.protocol)) return result('bad', M.oldProtocol);

  const validTo = Date.parse(info.validTo);
  const days = Number.isNaN(validTo) ? null : Math.floor((validTo - now.getTime()) / DAY_MS);

  if (days !== null && days <= 0) return result('bad', M.expired);
  if (!info.authorized) return result('bad', M.invalidCert);
  if (days === null) return result('bad', M.unreadableExpiry);
  if (days < WARN_DAYS) return result('warn', M.expiresSoon, { days });
  if (httpRedirectsToHttps === false) return result('warn', M.noHttpsRedirect, { days });
  return result('good', M.good, { days });
}
