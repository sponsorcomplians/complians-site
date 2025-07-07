// debug-auth.js
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

async function debugAuth() {
  const email = 'ian@sponsorcomplians.com';
  
  console.log('🔍 Debugging authentication for:', email);
  console.log('=====================================');
  
  // Check if user exists in custom users table
  console.log('\n1. Checking custom users table...');
  const { data: customUser, error: customError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
    
  if (customError) {
    console.log('❌ Custom user not found:', customError.message);
  } else {
    console.log('✅ Custom user found:', {
      id: customUser.id,
      email: customUser.email,
      full_name: customUser.full_name,
      is_email_verified: customUser.is_email_verified,
      created_at: customUser.created_at
    });
  }
  
  // Check if user exists in Supabase Auth
  console.log('\n2. Checking Supabase Auth...');
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email);
  
  if (authError) {
    console.log('❌ Auth user not found:', authError.message);
  } else {
    console.log('✅ Auth user found:', {
      id: authUser.user.id,
      email: authUser.user.email,
      email_confirmed_at: authUser.user.email_confirmed_at,
      created_at: authUser.user.created_at
    });
  }
  
  // Check user_roles table
  console.log('\n3. Checking user_roles table...');
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', customUser?.id || 'not-found');
    
  if (rolesError) {
    console.log('❌ User roles not found:', rolesError.message);
  } else {
    console.log('✅ User roles found:', userRoles);
  }
  
  console.log('\n=====================================');
  console.log('🔍 Analysis:');
  
  if (!customUser) {
    console.log('❌ User does not exist in custom users table');
    console.log('💡 This explains the 409 error during signup');
  } else if (!authUser) {
    console.log('❌ User exists in custom table but not in Supabase Auth');
    console.log('💡 This explains the signin failure - NextAuth checks custom table');
  } else if (!customUser.is_email_verified) {
    console.log('❌ User exists but email is not verified');
    console.log('💡 This explains the signin failure - email verification required');
  } else {
    console.log('✅ User exists and should be able to signin');
    console.log('💡 Check password or other authentication issues');
  }
}

debugAuth().catch(console.error); 