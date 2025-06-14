// src/app/api/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Create session or return success
    return NextResponse.json(
      { 
        message: 'OTP verified successfully',
        user: data.user,
        session: data.session
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}