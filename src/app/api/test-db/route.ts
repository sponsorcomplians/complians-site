// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Check if environment variables exist
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase environment variables',
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, created_at')
      .limit(5);
    
    return NextResponse.json({ 
      success: !error, 
      userCount: data?.length || 0,
      users: data || [],
      error: error?.message || null
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    });
  }
}