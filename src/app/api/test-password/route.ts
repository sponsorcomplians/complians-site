// src/app/api/test-password/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Fetch the test user
    const { data: user, error } = await supabase
      .from('users')
      .select('email, password_hash')
      .eq('email', 'test@example.com')
      .single();
    
    if (error || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Test if password123 matches the hash
    const testPassword = 'password123';
    const isValid = await bcrypt.compare(testPassword, user.password_hash || '');
    
    return NextResponse.json({ 
      success: true,
      email: user.email,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash?.length || 0,
      passwordHashStart: user.password_hash?.substring(0, 10) || 'none',
      testPasswordMatches: isValid
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    });
  }
}