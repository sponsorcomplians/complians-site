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

// Read the migration SQL file
const migrationPath = join(__dirname, 'safe-role-migration.sql');
let migrationSQL = '';
try {
  migrationSQL = readFileSync(migrationPath, 'utf8');
} catch (error) {
  console.error('❌ Could not read safe-role-migration.sql file');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 Running role migration via Supabase API...\n');

  try {
    // Execute the migration SQL
    console.log('Executing migration SQL...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try alternative approach - execute SQL directly
      console.log('\n🔄 Trying alternative approach...');
      
      // Split the SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', {
              sql: statement + ';'
            });
            
            if (stmtError) {
              console.log(`⚠️ Statement ${i + 1} had an issue:`, stmtError.message);
            } else {
              console.log(`✅ Statement ${i + 1} executed successfully`);
            }
          } catch (stmtError) {
            console.log(`⚠️ Statement ${i + 1} failed:`, stmtError.message);
          }
        }
      }
    } else {
      console.log('✅ Migration executed successfully!');
    }

    // Verify the migration worked
    console.log('\n🔍 Verifying migration...');
    await verifyMigration();

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

async function verifyMigration() {
  try {
    // Check if role column exists
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, tenant_id')
      .limit(1);

    if (usersError) {
      console.log('❌ Role column still missing:', usersError.message);
    } else {
      console.log('✅ Role column now exists in users table');
    }

    // Check if user_roles table exists
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (userRolesError) {
      console.log('❌ user_roles table still missing:', userRolesError.message);
    } else {
      console.log('✅ user_roles table now exists');
    }

    if (!usersError && !userRolesError) {
      console.log('\n🎉 Migration verification successful!');
      console.log('The role system is now properly configured.');
    } else {
      console.log('\n⚠️ Some parts of the migration may need manual attention.');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

runMigration(); 