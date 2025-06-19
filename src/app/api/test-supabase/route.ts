export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Test Supabase: Environment check', {
      hasUrl: !!url,
      hasKey: !!key,
      urlValue: url || 'NOT SET',
    });
    
    if (!url || !key) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        hasUrl: !!url,
        hasKey: !!key 
      });
    }
    
    // Try to create client
    console.log('Test Supabase: Creating client...');
    const supabase = createClient(url, key);
    
    // Try a simple query
    console.log('Test Supabase: Testing query...');
    const { data, error } = await supabase.from('workers').select('count');
    
    if (error) {
      console.log('Test Supabase: Query error:', error);
      return NextResponse.json({ 
        status: 'Connected but query failed',
        error: error.message,
        hint: error.hint,
        code: error.code
      });
    }
    
    return NextResponse.json({ 
      status: 'Success',
      message: 'Supabase connection working'
    });
    
  } catch (error) {
    console.error('Test Supabase: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Failed to connect',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
