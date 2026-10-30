import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail, MailError, sendMail } from '@/lib/mail/graph';

export const runtime = 'nodejs';

const MAX_NAME = 200;
const MAX_PHONE = 50;
const MAX_MESSAGE = 5000;

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() : null;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return badRequest('Naam, e-mail en bericht zijn verplicht');
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return badRequest('Naam, e-mail en bericht zijn verplicht');
  }

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
      { error: 'Er is een fout opgetreden. Probeer het later opnieuw.' },
      { status: 502 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Bedankt voor uw bericht. We nemen zo snel mogelijk contact met u op.',
    },
    { status: 200 }
  );
}
