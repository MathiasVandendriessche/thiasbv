# Contactformulier Setup

Het contactformulier is momenteel geconfigureerd om naar `/api/contact` te sturen, maar er is nog geen email service geïmplementeerd.

## Huidige Status

Het formulier:
- ✅ Valideert input
- ✅ Stuurt naar `/app/api/contact/route.ts`
- ✅ Logt naar console (development)
- ❌ Stuurt nog geen emails

## Opties voor Email Delivery

### Optie 1: FormSubmit (Gratis & Eenvoudig)

**Stap 1:** Update `/app/api/contact/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Naam, e-mail en bericht zijn verplicht' },
        { status: 400 }
      );
    }

    // FormSubmit endpoint
    const formSubmitResponse = await fetch('https://formsubmit.co/ajax/info@thiasbv.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        phone: phone || '',
        message,
        _subject: `Nieuw contactformulier bericht van ${name}`,
      }),
    });

    if (!formSubmitResponse.ok) {
      throw new Error('Form submission failed');
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Bedankt voor uw bericht. We nemen zo snel mogelijk contact met u op.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
```

### Optie 2: Resend (Aanbevolen voor Productie)

**Stap 1:** Installeer Resend:
```bash
npm install resend
```

**Stap 2:** Maak account op https://resend.com en krijg API key

**Stap 3:** Voeg toe aan `.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Stap 4:** Update `/app/api/contact/route.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Naam, e-mail en bericht zijn verplicht' },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>', // Update met je verified domain
      to: 'info@thiasbv.com',
      subject: `Nieuw contactformulier bericht van ${name}`,
      html: `
        <h2>Nieuw contactformulier bericht</h2>
        <p><strong>Naam:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        ${phone ? `<p><strong>Telefoon:</strong> ${phone}</p>` : ''}
        <p><strong>Bericht:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email,
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Bedankt voor uw bericht. We nemen zo snel mogelijk contact met u op.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
```

### Optie 3: Nodemailer met SMTP

Voor custom SMTP servers (bijv. je eigen email server).

## Aanbeveling

Voor snelheid: **FormSubmit** (Optie 1)
Voor productie: **Resend** (Optie 2)
