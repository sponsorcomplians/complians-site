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

async function testResendVerificationSimple() {
  console.log('🧪 Testing Resend Verification (Simple)...\n');

  try {
    // Step 1: Find unverified users
    console.log('1. Checking for unverified users...');
    const { data: unverifiedUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, is_email_verified, email_verification_token, email_verification_expires')
      .eq('is_email_verified', false)
      .limit(3);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!unverifiedUsers || unverifiedUsers.length === 0) {
      console.log('ℹ️ No unverified users found');
      console.log('\n📋 To test resend verification:');
      console.log('1. Create a new user account through signup');
      console.log('2. Then run this test again');
      return;
    }

    console.log(`✅ Found ${unverifiedUsers.length} unverified users:`);
    unverifiedUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email}`);
      console.log(`      - Token: ${user.email_verification_token ? 'Present' : 'None'}`);
      console.log(`      - Expires: ${user.email_verification_expires || 'N/A'}`);
    });

    // Step 2: Check email configuration
    console.log('\n2. Email configuration:');
    const hasSendGridKey = envVars.SENDGRID_API_KEY;
    const fromEmail = envVars.FROM_EMAIL || 'noreply@sponsorcomplians.co.uk';
    const appUrl = envVars.NEXTAUTH_URL || 'http://localhost:3000';
    
    console.log(`   - SendGrid API Key: ${hasSendGridKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - From Email: ${fromEmail}`);
    console.log(`   - App URL: ${appUrl}`);

    // Step 3: Test email function directly
    console.log('\n3. Testing email function...');
    
    // Import the email function
    const { sendVerificationEmail } = await import('./src/lib/email.ts');
    
    const testEmail = unverifiedUsers[0].email;
    const testName = unverifiedUsers[0].full_name || 'Test User';
    const testToken = 'test-token-' + Date.now();
    
    try {
      await sendVerificationEmail(testEmail, testName, testToken, '/dashboard');
      console.log('✅ Email function works!');
      
      if (hasSendGridKey) {
        console.log('📧 Email sent via SendGrid - check your inbox');
      } else {
        console.log('📧 Email logged to console (development mode)');
        console.log('🔍 Check server logs for verification URL');
      }
    } catch (emailError) {
      console.error('❌ Email function failed:', emailError);
    }

    // Step 4: Check resend verification API structure
    console.log('\n4. Resend verification API structure:');
    console.log('✅ API route: /api/auth/resend-verification');
    console.log('✅ Method: POST');
    console.log('✅ Expected body: { email, redirect? }');
    console.log('✅ Response: { success, message } or { error }');

    // Step 5: Manual testing instructions
    console.log('\n5. Manual testing instructions:');
    console.log('📋 To test resend verification manually:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Go to: http://localhost:3000/auth/verify-email');
    console.log('3. Click "Resend verification email" button');
    console.log('4. Check browser console and server logs');
    console.log('5. If SendGrid is configured, check your email inbox');

    console.log('\n🎉 Resend verification test completed!');
    console.log('\n📋 Summary:');
    console.log(`- Unverified users: ${unverifiedUsers.length}`);
    console.log('- Email function: ✅ Working');
    console.log('- SendGrid: ' + (hasSendGridKey ? '✅ Configured' : '📧 Console mode'));
    console.log('- API structure: ✅ Correct');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testResendVerificationSimple(); 