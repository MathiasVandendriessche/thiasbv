import { NextRequest, NextResponse } from 'next/server';
import { isJsonRequest } from '@/lib/http/is-json-request';
import { readJsonBody } from '@/lib/http/read-json-body';
import { isValidEmail, MailError, sendMail } from '@/lib/mail/graph';
import { contactLimiter, getClientIp, mailGlobalLimiter } from '@/lib/quick-check/rate-limit';

export const runtime = 'nodejs';

const MAX_NAME = 200;
const MAX_PHONE = 50;
const MAX_MESSAGE = 5000;
const MAX_BODY_BYTES = 8192;

const GENERIC_ERROR = 'Er is een fout opgetreden. Probeer het later opnieuw.';
const RATE_LIMITED = 'Te veel berichten op korte tijd. Probeer het later opnieuw.';
const THANKS = 'Bedankt voor uw bericht. We nemen zo snel mogelijk contact met u op.';

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

const success = () => NextResponse.json({ success: true, message: THANKS }, { status: 200 });

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() : null;
}

export async function POST(request: NextRequest) {
  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 415 });
  }
  const read = await readJsonBody(request, MAX_BODY_BYTES);
  const parsed = read.ok ? read.value : null;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return badRequest('Naam, e-mail en bericht zijn verplicht');
  }
  const body = parsed as Record<string, unknown>;

  // Honeypot: pretend success, send nothing, do not consume any rate limit.
  if (body.website !== undefined && typeof body.website !== 'string') {
    return badRequest('Naam, e-mail en bericht zijn verplicht');
  }
  if (typeof body.website === 'string' && body.website !== '') return success();

  const name = asString(body.name);
  const email = asString(body.email);
  const message = asString(body.message);
  const phone = body.phone === undefined || body.phone === null ? '' : asString(body.phone);

  if (!name || !email || !message || phone === null) {
    return badRequest('Naam, e-mail en bericht zijn verplicht');
  }
  if (!isValidEmail(email)) {
    return badRequest('Ongeldig e-mailadres');
  }
  if (name.length > MAX_NAME || phone.length > MAX_PHONE || message.length > MAX_MESSAGE) {
    return badRequest('Een of meer velden zijn te lang');
  }

  const ip = getClientIp(request.headers) ?? 'unknown';
  if (!contactLimiter.hit(ip) || !mailGlobalLimiter.hit('global')) {
    return NextResponse.json({ error: RATE_LIMITED }, { status: 429 });
  }

  try {
    await sendMail({
      subject: `Contactformulier: ${name}`,
      replyTo: email,
      text: [
        `Naam: ${name}`,
        `E-mail: ${email}`,
        `Telefoon: ${phone || '-'}`,
        '',
        message,
      ].join('\n'),
    });
  } catch (error) {
    const code = error instanceof MailError ? error.code : 'unknown';
    console.error(`contact: ${code}`);
    return NextResponse.json(
      { error: GENERIC_ERROR },
      { status: 502 }
    );
  }

  return success();
}
