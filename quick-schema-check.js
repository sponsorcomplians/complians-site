import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local file
const envPath = join(__dirname, '.env.local');
let envContent = '';
try {
  envContent = readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Could not read .env.local file');
  process.exit(1);
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');

  try {
    // Check if role column exists in users table
    console.log('1. Checking users table for role column...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, tenant_id')
      .limit(1);

    if (usersError) {
      if (usersError.message.includes('role')) {
        console.log('❌ Role column does NOT exist in users table');
        console.log('Error:', usersError.message);
        console.log('\n📋 SOLUTION: Run the safe migration SQL in Supabase');
        console.log('Copy and paste the contents of safe-role-migration.sql into Supabase SQL Editor');
      } else {
        console.error('❌ Users table error:', usersError);
      }
    } else {
      console.log('✅ Role column EXISTS in users table');
      console.log('Sample user data:', users[0]);
    }

    // Check if user_roles table exists
    console.log('\n2. Checking user_roles table...');
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (userRolesError) {
      console.log('❌ user_roles table does NOT exist');
      console.log('Error:', userRolesError.message);
    } else {
      console.log('✅ user_roles table EXISTS');
      console.log('Sample user_roles data:', userRoles[0]);
    }

    console.log('\n📋 SUMMARY:');
    if (usersError && usersError.message.includes('role')) {
      console.log('❌ Role column missing - Run safe-role-migration.sql in Supabase');
    } else {
      console.log('✅ Schema appears to be correct');
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema(); 