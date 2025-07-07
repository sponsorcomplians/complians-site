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
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsersColumns() {
  console.log('🔍 Checking users table columns...\n');

  try {
    // Try to select all columns to see what exists
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('❌ Error accessing users table:', usersError);
      
      // Try to get just the basic columns
      console.log('\n🔄 Trying basic columns...');
      const { data: basicUsers, error: basicError } = await supabase
        .from('users')
        .select('id, email')
        .limit(1);

      if (basicError) {
        console.error('❌ Even basic columns failed:', basicError);
      } else {
        console.log('✅ Basic columns work:', Object.keys(basicUsers[0] || {}));
      }
    } else {
      console.log('✅ Users table accessible');
      console.log('Available columns:', Object.keys(users[0] || {}));
      
      // Check for specific columns we need
      const columns = Object.keys(users[0] || {});
      const neededColumns = ['id', 'email', 'role', 'tenant_id', 'full_name', 'company'];
      
      console.log('\n📋 Column Status:');
      neededColumns.forEach(col => {
        const exists = columns.includes(col);
        console.log(`  ${col}: ${exists ? '✅' : '❌'}`);
      });
    }

    // Check user_roles table
    console.log('\n🔍 Checking user_roles table...');
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (userRolesError) {
      console.error('❌ user_roles table error:', userRolesError);
    } else {
      console.log('✅ user_roles table accessible');
      console.log('user_roles columns:', Object.keys(userRoles[0] || {}));
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkUsersColumns(); 