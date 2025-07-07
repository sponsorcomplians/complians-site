import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Running database debug queries...');
    
    const results = {
      tenant: null as any,
      users: [] as any[],
      exactUser: null as any,
      analysis: {
        tenantExists: false,
        usersFound: 0,
        exactUserExists: false
      }
    };
    
    // Check for tenant with name 'IANS'
    console.log('1. Checking for tenant with name "IANS"...');
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('name', 'IANS')
      .single();
      
    if (tenantError) {
      console.log('❌ Tenant "IANS" not found:', tenantError.message);
      results.analysis.tenantExists = false;
    } else {
      console.log('✅ Tenant "IANS" found:', tenant);
      results.tenant = tenant;
      results.analysis.tenantExists = true;
    }
    
    // Check for user with email containing 'ian@sponsorcomplians.com'
    console.log('2. Checking for user with email containing "ian@sponsorcomplians.com"...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .ilike('email', '%ian@sponsorcomplians.com%');
      
    if (userError) {
      console.log('❌ Error querying users:', userError.message);
      results.analysis.usersFound = 0;
    } else {
      console.log(`✅ Found ${users.length} user(s) with similar email`);
      results.users = users || [];
      results.analysis.usersFound = users.length;
    }
    
    // Also check for exact email match
    console.log('3. Checking for exact email match "ian@sponsorcomplians.com"...');
    const { data: exactUser, error: exactError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'ian@sponsorcomplians.com')
      .single();
      
    if (exactError) {
      console.log('❌ Exact email match not found:', exactError.message);
      results.analysis.exactUserExists = false;
    } else {
      console.log('✅ Exact email match found:', exactUser);
      results.exactUser = exactUser;
      results.analysis.exactUserExists = true;
    }
    
    // Analysis
    console.log('\n=====================================');
    console.log('🔍 Analysis:');
    
    if (!results.tenant) {
      console.log('❌ Tenant "IANS" does not exist');
    } else {
      console.log('✅ Tenant "IANS" exists');
    }
    
    if (results.users.length === 0) {
      console.log('❌ No users found with similar email');
    } else {
      console.log(`✅ Found ${results.users.length} user(s) with similar email`);
    }
    
    if (!results.exactUser) {
      console.log('❌ No exact email match found');
    } else {
      console.log('✅ Exact email match found');
    }
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug DB error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run debug queries',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 