import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Naam, e-mail en bericht zijn verplicht' },
        { status: 400 }
      );
    }

    // In production, you would send this to an email service like:
    // - Resend (https://resend.com)
    // - SendGrid
    // - Nodemailer with SMTP
    // - AWS SES
    // - Or use a form service like Formspree, FormSubmit, etc.

    // For now, we'll log it and return success
    // TODO: Replace with actual email sending service
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      message,
      timestamp: new Date().toISOString(),
    });

    // Example with FormSubmit (free service):
    // You can use: https://formsubmit.co/your-email@thiasbv.com
    // Or implement a proper email service

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
