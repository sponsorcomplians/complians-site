// src/app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the token with Supabase
    // This assumes you're using Supabase Auth magic links or OTP
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      type: 'signup',
      token,
      email,
    });

    if (error) {
      console.error('Verification error:', error);
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update user as verified if needed
    if (data.user) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        data.user.id,
        { email_confirmed_at: new Date().toISOString() }
      );

      if (updateError) {
        console.error('Update error:', updateError);
      }
    }

    return NextResponse.json(
      { 
        message: 'Email verified successfully',
        user: data.user 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}