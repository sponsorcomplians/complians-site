// Test database integration after comprehensive migration
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDatabaseIntegration() {
  console.log('🧪 Testing Database Integration...\n');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing\n');

  try {
    // Test 1: Check if create_tenant_during_signup function exists
    console.log('1. Testing create_tenant_during_signup function...');
    const { data: functionTest, error: functionError } = await supabase
      .rpc('create_tenant_during_signup', {
        tenant_name: 'Test Company Integration',
        tenant_industry: 'Technology',
        tenant_max_workers: 50,
        tenant_subscription_plan: 'Basic'
      });

    if (functionError) {
      console.error('❌ Function test failed:', functionError);
    } else {
      console.log('✅ Function test successful:', functionTest);
    }

    // Test 2: Check users table structure
    console.log('\n2. Testing users table structure...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('❌ Users table test failed:', usersError);
    } else {
      console.log('✅ Users table accessible, columns:', Object.keys(users[0] || {}));
    }

    // Test 3: Check tenants table structure
    console.log('\n3. Testing tenants table structure...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .limit(1);

    if (tenantsError) {
      console.error('❌ Tenants table test failed:', tenantsError);
    } else {
      console.log('✅ Tenants table accessible, columns:', Object.keys(tenants[0] || {}));
    }

    // Test 4: Check user_roles table structure
    console.log('\n4. Testing user_roles table structure...');
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (userRolesError) {
      console.error('❌ User_roles table test failed:', userRolesError);
    } else {
      console.log('✅ User_roles table accessible, columns:', Object.keys(userRoles[0] || {}));
    }

    // Test 5: Check audit_logs table structure
    console.log('\n5. Testing audit_logs table structure...');
    const { data: auditLogs, error: auditLogsError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);

    if (auditLogsError) {
      console.error('❌ Audit_logs table test failed:', auditLogsError);
    } else {
      console.log('✅ Audit_logs table accessible, columns:', Object.keys(auditLogs[0] || {}));
    }

    // Test 6: Check workers table structure
    console.log('\n6. Testing workers table structure...');
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('*')
      .limit(1);

    if (workersError) {
      console.error('❌ Workers table test failed:', workersError);
    } else {
      console.log('✅ Workers table accessible, columns:', Object.keys(workers[0] || {}));
    }

    // Test 7: Check RLS policies
    console.log('\n7. Testing RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'public');

    if (policiesError) {
      console.error('❌ RLS policies test failed:', policiesError);
    } else {
      console.log('✅ RLS policies found:', policies.length);
    }

    console.log('\n🎉 Database integration test completed!');

  } catch (error) {
    console.error('❌ Database integration test failed:', error);
  }
}

// Run the test
testDatabaseIntegration(); 