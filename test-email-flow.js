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

async function testEmailFlow() {
  console.log('🧪 Testing complete email verification flow...\n');

  try {
    // Step 1: Check if there are any unverified users
    console.log('1. Checking for unverified users...');
    const { data: unverifiedUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, is_email_verified, email_verification_token, email_verification_expires')
      .eq('is_email_verified', false)
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!unverifiedUsers || unverifiedUsers.length === 0) {
      console.log('ℹ️ No unverified users found');
      console.log('\n📋 To test the email flow:');
      console.log('1. Create a new user account through the signup form');
      console.log('2. Check the console logs for email details');
      console.log('3. Use the verification link or resend button');
      return;
    }

    console.log(`✅ Found ${unverifiedUsers.length} unverified users`);
    
    // Step 2: Test resend verification for the first user
    const testUser = unverifiedUsers[0];
    console.log(`\n2. Testing resend verification for: ${testUser.email}`);
    
    // Simulate resend verification API call
    const resendResponse = await fetch(`${envVars.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testUser.email,
        redirect: '/dashboard'
      })
    });

    const resendData = await resendResponse.json();
    
    if (resendResponse.ok) {
      console.log('✅ Resend verification API call successful');
      console.log('Response:', resendData);
    } else {
      console.log('❌ Resend verification API call failed');
      console.log('Error:', resendData);
    }

    // Step 3: Check if user has verification token
    console.log('\n3. Checking verification token...');
    if (testUser.email_verification_token) {
      console.log('✅ User has verification token');
      console.log('Token expires:', testUser.email_verification_expires);
      
      // Check if token is expired
      const now = new Date();
      const tokenExpiry = new Date(testUser.email_verification_expires);
      if (now > tokenExpiry) {
        console.log('⚠️ Token is expired');
      } else {
        console.log('✅ Token is still valid');
      }
    } else {
      console.log('❌ User has no verification token');
    }

    // Step 4: Test verification API (if token exists)
    if (testUser.email_verification_token) {
      console.log('\n4. Testing verification API...');
      
      const verifyResponse = await fetch(`${envVars.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: testUser.email_verification_token,
          email: testUser.email
        })
      });

      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.ok) {
        console.log('✅ Email verification API call successful');
        console.log('Response:', verifyData);
      } else {
        console.log('❌ Email verification API call failed');
        console.log('Error:', verifyData);
      }
    }

    console.log('\n🎉 Email flow test completed!');
    console.log('\n📋 Summary:');
    console.log('- Resend verification:', resendResponse.ok ? '✅ Working' : '❌ Failed');
    console.log('- Verification token:', testUser.email_verification_token ? '✅ Present' : '❌ Missing');
    console.log('- Email verification:', testUser.email_verification_token ? '✅ Tested' : '⚠️ Skipped');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmailFlow(); 