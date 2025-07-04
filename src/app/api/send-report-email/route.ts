import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, text } = await req.json();
    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use Supabase email (if configured)
    if (supabase.functions) {
      // If you have a Supabase Edge Function for email, call it here
      // For now, just return a success (simulate)
      return NextResponse.json({ success: true });
    }

    // If using SendGrid or another service, implement here
    // For now, just return a success (simulate)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 