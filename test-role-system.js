import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRoleSystem() {
  console.log('🧪 Testing Role System...\n');

  try {
    // Test 1: Check user_roles table structure
    console.log('1. Testing user_roles table structure...');
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (userRolesError) {
      console.error('❌ User_roles table test failed:', userRolesError);
    } else {
      console.log('✅ User_roles table accessible, columns:', Object.keys(userRoles[0] || {}));
    }

    // Test 2: Check users table role column
    console.log('\n2. Testing users table role column...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, tenant_id')
      .limit(5);

    if (usersError) {
      console.error('❌ Users table test failed:', usersError);
    } else {
      console.log('✅ Users table accessible');
      console.log('Sample users with roles:');
      users.forEach(user => {
        console.log(`  - ${user.email}: ${user.role || 'NULL'} (Tenant: ${user.tenant_id})`);
      });
    }

    // Test 3: Test get_user_role_with_fallback function
    console.log('\n3. Testing get_user_role_with_fallback function...');
    if (users && users.length > 0) {
      const testUser = users[0];
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_role_with_fallback', {
          user_uuid: testUser.id,
          tenant_uuid: testUser.tenant_id
        });

      if (roleError) {
        console.error('❌ get_user_role_with_fallback function failed:', roleError);
      } else {
        console.log(`✅ Function works: User ${testUser.email} has role: ${roleData}`);
      }
    }

    // Test 4: Test ensure_user_role_record function
    console.log('\n4. Testing ensure_user_role_record function...');
    if (users && users.length > 0) {
      const testUser = users[0];
      const { data: ensureData, error: ensureError } = await supabase
        .rpc('ensure_user_role_record', {
          user_uuid: testUser.id,
          tenant_uuid: testUser.tenant_id
        });

      if (ensureError) {
        console.error('❌ ensure_user_role_record function failed:', ensureError);
      } else {
        console.log(`✅ Function works: Ensured role record for user ${testUser.email}: ${ensureData}`);
      }
    }

    // Test 5: Check role consistency
    console.log('\n5. Checking role consistency...');
    const { data: consistencyCheck, error: consistencyError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role as user_role,
        tenant_id,
        user_roles!inner(role as user_role_table_role)
      `)
      .limit(5);

    if (consistencyError) {
      console.error('❌ Consistency check failed:', consistencyError);
    } else {
      console.log('✅ Role consistency check:');
      consistencyCheck.forEach(user => {
        const userRole = user.user_role;
        const tableRole = user.user_roles[0]?.user_role_table_role;
        const isConsistent = userRole === tableRole;
        console.log(`  - ${user.email}: Users.role=${userRole}, user_roles.role=${tableRole} ${isConsistent ? '✅' : '❌'}`);
      });
    }

    // Test 6: Check role constraints
    console.log('\n6. Testing role constraints...');
    const { data: constraintCheck, error: constraintError } = await supabase
      .from('user_roles')
      .select('role')
      .limit(10);

    if (constraintError) {
      console.error('❌ Constraint check failed:', constraintError);
    } else {
      const validRoles = ['Admin', 'Manager', 'Auditor', 'Viewer'];
      const foundRoles = [...new Set(constraintCheck.map(r => r.role))];
      console.log('✅ Valid roles found:', foundRoles);
      
      const invalidRoles = foundRoles.filter(role => !validRoles.includes(role));
      if (invalidRoles.length > 0) {
        console.error('❌ Invalid roles found:', invalidRoles);
      } else {
        console.log('✅ All roles are valid');
      }
    }

    console.log('\n🎉 Role system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRoleSystem(); 