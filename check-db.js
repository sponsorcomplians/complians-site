// check-db.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database for tenant and user...');
  console.log('=====================================');
  
  // Check for tenant with name 'IANS'
  console.log('\n1. Checking for tenant with name "IANS"...');
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('name', 'IANS')
    .single();
    
  if (tenantError) {
    console.log('❌ Tenant "IANS" not found:', tenantError.message);
  } else {
    console.log('✅ Tenant "IANS" found:', {
      id: tenant.id,
      name: tenant.name,
      industry: tenant.industry,
      max_workers: tenant.max_workers,
      subscription_plan: tenant.subscription_plan,
      created_at: tenant.created_at
    });
  }
  
  // Check for user with email containing 'ian@sponsorcomplians.com'
  console.log('\n2. Checking for user with email containing "ian@sponsorcomplians.com"...');
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .ilike('email', '%ian@sponsorcomplians.com%');
    
  if (userError) {
    console.log('❌ Error querying users:', userError.message);
  } else if (users.length === 0) {
    console.log('❌ No users found with email containing "ian@sponsorcomplians.com"');
  } else {
    console.log(`✅ Found ${users.length} user(s):`);
    users.forEach((user, index) => {
      console.log(`   User ${index + 1}:`, {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        company: user.company,
        tenant_id: user.tenant_id,
        role: user.role,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at
      });
    });
  }
  
  // Also check for exact email match
  console.log('\n3. Checking for exact email match "ian@sponsorcomplians.com"...');
  const { data: exactUser, error: exactError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'ian@sponsorcomplians.com')
    .single();
    
  if (exactError) {
    console.log('❌ Exact email match not found:', exactError.message);
  } else {
    console.log('✅ Exact email match found:', {
      id: exactUser.id,
      email: exactUser.email,
      full_name: exactUser.full_name,
      company: exactUser.company,
      tenant_id: exactUser.tenant_id,
      role: exactUser.role,
      is_email_verified: exactUser.is_email_verified,
      created_at: exactUser.created_at
    });
  }
  
  console.log('\n=====================================');
  console.log('🔍 Analysis:');
  
  if (!tenant) {
    console.log('❌ Tenant "IANS" does not exist');
  } else {
    console.log('✅ Tenant "IANS" exists');
  }
  
  if (users.length === 0) {
    console.log('❌ No users found with similar email');
  } else {
    console.log(`✅ Found ${users.length} user(s) with similar email`);
  }
  
  if (!exactUser) {
    console.log('❌ No exact email match found');
  } else {
    console.log('✅ Exact email match found');
  }
}

checkDatabase().catch(console.error); 