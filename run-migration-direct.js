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

async function runMigration() {
  console.log('🚀 Running role migration directly...\n');

  try {
    // Step 1: Check current state
    console.log('1. Checking current schema...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, tenant_id')
      .limit(1);

    if (usersError && usersError.message.includes('role')) {
      console.log('❌ Role column missing - will add it');
    } else {
      console.log('✅ Role column already exists');
    }

    // Step 2: Try to create user_roles table by inserting a test record
    console.log('\n2. Creating user_roles table...');
    const testUserId = crypto.randomUUID();
    const testTenantId = crypto.randomUUID();
    
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .insert({
        id: crypto.randomUUID(),
        user_id: testUserId,
        tenant_id: testTenantId,
        role: 'Viewer'
      })
      .select('*');

    if (userRolesError) {
      console.log('❌ user_roles table missing - will create it');
    } else {
      console.log('✅ user_roles table exists');
      // Clean up test record
      await supabase.from('user_roles').delete().eq('id', userRoles[0].id);
    }

    // Step 3: Since we can't directly execute DDL via the client,
    // we'll provide the exact SQL to run manually
    console.log('\n📋 MANUAL ACTION REQUIRED:');
    console.log('Please run the following SQL in your Supabase SQL Editor:');
    console.log('\n' + '='.repeat(60));
    console.log('-- Copy and paste this into Supabase SQL Editor:');
    console.log('='.repeat(60));
    
    const migrationSQL = `
-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Viewer';

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager', 'Auditor', 'Viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles in their tenant" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.tenant_id = user_roles.tenant_id
      AND ur.role = 'Admin'
    )
  );
`;

    console.log(migrationSQL);
    console.log('='.repeat(60));
    console.log('\nAfter running the SQL above, run this verification script:');
    console.log('node quick-schema-check.js');

  } catch (error) {
    console.error('❌ Migration check failed:', error);
  }
}

runMigration(); 