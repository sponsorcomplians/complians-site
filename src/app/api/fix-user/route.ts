import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('🔧 Fixing user record for:', normalizedEmail);
    
    // First, get the current user record
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single();
      
    if (fetchError || !user) {
      console.log('❌ User not found:', fetchError?.message);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Found user:', {
      id: user.id,
      email: user.email,
      has_password: !!user.password,
      has_password_hash: !!user.password_hash,
      is_email_verified: user.is_email_verified
    });
    
    // Prepare update data
    const updateData: any = {};
    
    // Fix email verification if needed
    if (!user.is_email_verified) {
      updateData.is_email_verified = true;
      console.log('🔧 Setting email as verified');
    }
    
    // Note: The database uses password_hash field, not password
    // The NextAuth config has been updated to handle both fields
    console.log('🔧 Database uses password_hash field - NextAuth config updated to handle this');
    
    // Update the user record
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('email', normalizedEmail)
      .select('*')
      .single();
      
    if (updateError) {
      console.error('❌ Failed to update user:', updateError);
      return NextResponse.json(
        { 
          error: 'Failed to update user',
          details: updateError.message
        },
        { status: 500 }
      );
    }
    
    console.log('✅ User updated successfully:', {
      id: updatedUser.id,
      email: updatedUser.email,
      is_email_verified: updatedUser.is_email_verified,
      has_password: !!updatedUser.password
    });
    
    return NextResponse.json({
      success: true,
      message: 'User record fixed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        is_email_verified: updatedUser.is_email_verified,
        company: updatedUser.company
      }
    });
    
  } catch (error) {
    console.error('Fix user error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fix user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 