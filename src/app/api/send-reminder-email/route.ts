import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { supabaseAdmin } from '@/lib/supabase';
import { sendReminderEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, productName } = await request.json();

    if (!userId || !productName) {
      return NextResponse.json(
        { error: 'User ID and product name are required' },
        { status: 400 }
      );
    }

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has uploaded any documents in the last 24 hours
    const { data: recentUploads, error: uploadsError } = await supabaseAdmin
      .from('compliance_workers')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (uploadsError) {
      console.error('Error checking recent uploads:', uploadsError);
      return NextResponse.json(
        { error: 'Failed to check recent uploads' },
        { status: 500 }
      );
    }

    // If user has uploaded documents recently, don't send reminder
    if (recentUploads && recentUploads.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'User has uploaded documents recently, no reminder needed'
      });
    }

    // Send reminder email
    await sendReminderEmail(
      user.email,
      user.full_name || 'Valued Customer',
      productName
    );

    return NextResponse.json({
      success: true,
      message: 'Reminder email sent successfully'
    });

  } catch (error) {
    console.error('Error sending reminder email:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder email' },
      { status: 500 }
    );
  }
} 