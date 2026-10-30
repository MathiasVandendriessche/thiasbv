export type Status = 'good' | 'warn' | 'bad' | 'unavailable';
export type CheckId = 'tls' | 'headers' | 'cookies' | 'email';

export interface CheckResult {
  id: CheckId;
  status: Status;
  /** Key into the NL/EN/FR copy. Never contains text from the scanned site. */
  messageKey: string;
  params?: Record<string, string | number>;
}

export interface QuickCheckReport {
  domain: string;
  checkedAt: string;
  results: CheckResult[];
  /** total excludes parts with status 'unavailable'. */
  summary: { ok: number; total: number };
}
