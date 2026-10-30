import { NextRequest, NextResponse } from 'next/server';
import { readJsonBody } from '@/lib/http/read-json-body';
import { isValidEmail, MailError, sendMail } from '@/lib/mail/graph';
import { normalizeDomain } from '@/lib/quick-check/domain';
import { getClientIp, scanRequestLimiter } from '@/lib/quick-check/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 2048;
const MAX_FIELD_LENGTH = 200;
const LANGS = ['nl', 'en', 'fr'] as const;

type Lang = (typeof LANGS)[number];
type ErrorCode = 'invalid' | 'rate_limited' | 'unavailable';
type Envelope = { success: true } | { success: false; error: ErrorCode };

function respond(body: Envelope, status: number) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

const fail = (error: ErrorCode, status: number) => respond({ success: false, error }, status);

const isOptionalString = (v: unknown): v is string | undefined =>
  v === undefined || typeof v === 'string';

const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);

/** Single-line value for the mail body: no CR/LF, trimmed, '-' when empty. */
function line(value: string | undefined): string {
  const clean = (value ?? '').replace(/[\r\n]+/g, ' ').trim();
  return clean === '' ? '-' : clean;
}

export async function POST(request: NextRequest) {
  const read = await readJsonBody(request, MAX_BODY_BYTES);
  if (!read.ok) return fail('invalid', 400);
  const body = read.value;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return fail('invalid', 400);
  }
  const { email, name, company, domain, consent, website, lang } = body as Record<string, unknown>;

  if (
    typeof email !== 'string' ||
    typeof domain !== 'string' ||
    !isOptionalString(name) ||
    !isOptionalString(company) ||
    !isOptionalString(website) ||
    consent !== true ||
    !isLang(lang)
  ) {
    return fail('invalid', 400);
  }

  // Honeypot: pretend success, send nothing, do not consume the rate limit.
  if (website !== undefined && website !== '') return respond({ success: true }, 200);

  const parsed = normalizeDomain(domain);
  if (!parsed.ok) return fail('invalid', 400);
  if (!isValidEmail(email)) return fail('invalid', 400);
  if ((name ?? '').length > MAX_FIELD_LENGTH || (company ?? '').length > MAX_FIELD_LENGTH) {
    return fail('invalid', 400);
  }

  const ip = getClientIp(request.headers) ?? 'unknown';
  if (!scanRequestLimiter.hit(ip)) return fail('rate_limited', 429);

  const text = [
    `E-mail: ${line(email)}`,
    `Naam: ${line(name)}`,
    `Bedrijf: ${line(company)}`,
    `Domein: ${parsed.domain}`,
    `Taal: ${lang}`,
    `Tijdstip: ${new Date().toISOString()}`,
  ].join('\n');

  try {
    await sendMail({
      subject: `Aanvraag volledige scan: ${parsed.domain}`,
      text,
      replyTo: email,
    });
    return respond({ success: true }, 200);
  } catch (err) {
    console.error(`scan-request: ${err instanceof MailError ? err.code : 'unknown'}`);
    return fail('unavailable', 503);
  }
}
