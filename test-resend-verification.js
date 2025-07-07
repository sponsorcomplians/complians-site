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

async function testResendVerification() {
  console.log('🧪 Testing Resend Verification Function...\n');

  try {
    // Step 1: Find an unverified user
    console.log('1. Looking for unverified users...');
    const { data: unverifiedUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, is_email_verified, email_verification_token, email_verification_expires')
      .eq('is_email_verified', false)
      .limit(1);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!unverifiedUsers || unverifiedUsers.length === 0) {
      console.log('ℹ️ No unverified users found');
      console.log('\n📋 To test resend verification:');
      console.log('1. Create a new user account through signup');
      console.log('2. Or manually create an unverified user in the database');
      console.log('3. Then run this test again');
      return;
    }

    const testUser = unverifiedUsers[0];
    console.log(`✅ Found unverified user: ${testUser.email}`);
    console.log(`   - Current token: ${testUser.email_verification_token ? 'Present' : 'None'}`);
    console.log(`   - Token expires: ${testUser.email_verification_expires || 'N/A'}`);

    // Step 2: Test resend verification API
    console.log('\n2. Testing resend verification API...');
    
    const appUrl = envVars.NEXTAUTH_URL || 'http://localhost:3000';
    const resendResponse = await fetch(`${appUrl}/api/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testUser.email,
        redirect: '/dashboard'
      })
    });

    const resendData = await resendResponse.json();
    
    if (resendResponse.ok) {
      console.log('✅ Resend verification API call successful!');
      console.log('Response:', resendData);
    } else {
      console.log('❌ Resend verification API call failed');
      console.log('Status:', resendResponse.status);
      console.log('Error:', resendData);
      return;
    }

    // Step 3: Verify the user was updated with new token
    console.log('\n3. Verifying user was updated...');
    
    // Wait a moment for the database update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .select('id, email, email_verification_token, email_verification_expires')
      .eq('id', testUser.id)
      .single();

    if (updateError) {
      console.error('❌ Error fetching updated user:', updateError);
      return;
    }

    console.log('✅ User updated successfully');
    console.log(`   - New token: ${updatedUser.email_verification_token ? 'Present' : 'None'}`);
    console.log(`   - New expiry: ${updatedUser.email_verification_expires || 'N/A'}`);
    
    if (updatedUser.email_verification_token && updatedUser.email_verification_token !== testUser.email_verification_token) {
      console.log('✅ New verification token generated');
    } else {
      console.log('⚠️ Token may not have been updated');
    }

    // Step 4: Check if email was sent (console logs)
    console.log('\n4. Email sending status:');
    const hasSendGridKey = envVars.SENDGRID_API_KEY;
    if (hasSendGridKey) {
      console.log('✅ SendGrid configured - email should have been sent');
      console.log('📧 Check your email inbox for the verification email');
    } else {
      console.log('📧 Development mode - email details logged to console');
      console.log('🔍 Check your server logs for email content and verification URL');
    }

    // Step 5: Test verification with new token
    if (updatedUser.email_verification_token) {
      console.log('\n5. Testing verification with new token...');
      
      const verifyResponse = await fetch(`${appUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: updatedUser.email_verification_token,
          email: testUser.email
        })
      });

      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.ok) {
        console.log('✅ Email verification successful!');
        console.log('Response:', verifyData);
      } else {
        console.log('❌ Email verification failed');
        console.log('Error:', verifyData);
      }
    }

    console.log('\n🎉 Resend verification test completed!');
    console.log('\n📋 Summary:');
    console.log('- API call:', resendResponse.ok ? '✅ Working' : '❌ Failed');
    console.log('- Token update:', updatedUser.email_verification_token ? '✅ Success' : '❌ Failed');
    console.log('- Email sending:', hasSendGridKey ? '✅ SendGrid' : '📧 Console mode');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testResendVerification(); 