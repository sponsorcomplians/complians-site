import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'no-reply@yourdomain.com'; // Set your verified sender

export async function POST(req: NextRequest) {
  try {
    if (!resend) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }
    const { to, subject, html, text } = await req.json();
    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send email using Resend
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (data.error) {
      return NextResponse.json({ error: data.error.message || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 