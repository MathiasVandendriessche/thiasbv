import type { CheckId, CheckResult, QuickCheckReport, Status } from "@/lib/quick-check/types";

/**
 * Client-side parsing of the quick check and scan request API responses.
 * Plain functions without server dependencies, so they are safe in the client bundle.
 * Anything that does not match the contract becomes 'unavailable'.
 */

export type QuickCheckApiError = "invalid_domain" | "rate_limited" | "blocked" | "unavailable";
export type ScanRequestApiError = "invalid" | "rate_limited" | "unavailable";

export type QuickCheckParsed = { ok: true; report: QuickCheckReport } | { ok: false; error: QuickCheckApiError };
export type ScanRequestParsed = { ok: true } | { ok: false; error: ScanRequestApiError };

const CHECK_IDS: readonly CheckId[] = ["tls", "headers", "cookies", "email"];
const STATUSES: readonly Status[] = ["good", "warn", "bad", "unavailable"];
const QUICK_CHECK_ERRORS: readonly QuickCheckApiError[] = ["invalid_domain", "rate_limited", "blocked", "unavailable"];
const SCAN_REQUEST_ERRORS: readonly ScanRequestApiError[] = ["invalid", "rate_limited", "unavailable"];

type Obj = Record<string, unknown>;

const isObject = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isCount = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;
const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T => list.includes(v as T);

function isParams(v: unknown): v is Record<string, string | number> {
  return isObject(v) && Object.values(v).every((p) => typeof p === "string" || typeof p === "number");
}

function isCheckResult(v: unknown): v is CheckResult {
  return (
    isObject(v) &&
    oneOf(CHECK_IDS, v.id) &&
    oneOf(STATUSES, v.status) &&
    typeof v.messageKey === "string" &&
    (v.params === undefined || isParams(v.params))
  );
}

function isReport(v: unknown): v is QuickCheckReport {
  return (
    isObject(v) &&
    typeof v.domain === "string" &&
    typeof v.checkedAt === "string" &&
    Array.isArray(v.results) &&
    v.results.every(isCheckResult) &&
    isObject(v.summary) &&
    isCount(v.summary.ok) &&
    isCount(v.summary.total)
  );
}

export function parseQuickCheckResponse(body: unknown): QuickCheckParsed {
  if (isObject(body) && body.success === true && isReport(body.data)) return { ok: true, report: body.data };
  if (isObject(body) && body.success === false && oneOf(QUICK_CHECK_ERRORS, body.error)) {
    return { ok: false, error: body.error };
  }
  return { ok: false, error: "unavailable" };
}

export function parseScanRequestResponse(body: unknown): ScanRequestParsed {
  if (isObject(body) && body.success === true) return { ok: true };
  if (isObject(body) && body.success === false && oneOf(SCAN_REQUEST_ERRORS, body.error)) {
    return { ok: false, error: body.error };
  }
  return { ok: false, error: "unavailable" };
}
