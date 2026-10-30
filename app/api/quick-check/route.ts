import { NextRequest, NextResponse } from 'next/server';
import { normalizeDomain } from '@/lib/quick-check/domain';
import { BlockedTargetError } from '@/lib/quick-check/net/ssrf-guard';
import { getClientIp, globalLimiter, quickCheckLimiter } from '@/lib/quick-check/rate-limit';
import { readJsonBody } from '@/lib/http/read-json-body';
import { runQuickCheck, type QuickCheckReport } from '@/lib/quick-check/run';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 1024;

type ErrorCode = 'invalid_domain' | 'rate_limited' | 'blocked' | 'unavailable';
type Envelope = { success: true; data: QuickCheckReport } | { success: false; error: ErrorCode };

function respond(body: Envelope, status: number) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

const fail = (error: ErrorCode, status: number) => respond({ success: false, error }, status);

export async function POST(request: NextRequest) {
  const read = await readJsonBody(request, MAX_BODY_BYTES);
  if (!read.ok) return fail('invalid_domain', 400);
  const body = read.value;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return fail('invalid_domain', 400);
  }

  const parsed = normalizeDomain((body as Record<string, unknown>).domain);
  if (!parsed.ok) return fail('invalid_domain', 400);

  const ip = getClientIp(request.headers) ?? 'unknown';
  if (!quickCheckLimiter.hit(ip)) return fail('rate_limited', 429);
  if (!globalLimiter.hit('global')) return fail('rate_limited', 429);

  try {
    const data = await runQuickCheck(parsed.domain);
    return respond({ success: true, data }, 200);
  } catch (err) {
    if (err instanceof BlockedTargetError) return fail('blocked', 400);
    console.error('quick-check: unavailable');
    return fail('unavailable', 503);
  }
}
