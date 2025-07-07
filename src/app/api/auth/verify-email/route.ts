// src/app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with the verification token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email_verification_token', token)
      .eq('email', email?.toLowerCase())
      .single();

    if (userError || !user) {
      console.error('User not found or invalid token:', userError);
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const tokenExpiry = new Date(user.email_verification_expires);
    
    if (now > tokenExpiry) {
      console.error('Token expired for user:', user.email);
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.is_email_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Update user as verified and clear the token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_email_verified: true,
        email_verification_token: null,
        email_verification_expires: null
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user verification status:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    // Also update Supabase Auth user if it exists
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id);
      if (authUser && !authError) {
        await supabase.auth.admin.updateUserById(user.id, {
          email_confirm: true
        });
      }
    } catch (authError) {
      console.warn('Could not update Supabase Auth user:', authError);
      // Continue anyway as the main user is verified
    }

    console.log('Email verified successfully for user:', user.email);

    return NextResponse.json(
      { 
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          is_email_verified: true
        }
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