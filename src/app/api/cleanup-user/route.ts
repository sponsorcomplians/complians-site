import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('🗑️ Cleaning up user record for:', normalizedEmail);
    
    // First, get the current user record to log what we're deleting
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
    
    console.log('✅ Found user to delete:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      company: user.company,
      created_at: user.created_at
    });
    
    // Delete the user record
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('email', normalizedEmail);
      
    if (deleteError) {
      console.error('❌ Failed to delete user:', deleteError);
      return NextResponse.json(
        { 
          error: 'Failed to delete user',
          details: deleteError.message
        },
        { status: 500 }
      );
    }
    
    console.log('✅ User deleted successfully');
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        company: user.company
      }
    });
    
  } catch (error) {
    console.error('Cleanup user error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cleanup user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 