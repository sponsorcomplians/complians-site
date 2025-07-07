import { sendVerificationEmail } from './src/lib/email.ts';

async function testEmail() {
  console.log('🧪 Testing email functionality...\n');

  try {
    const testEmail = 'test@example.com';
    const testName = 'Test User';
    const testToken = 'test-token-123';
    
    console.log('Sending test verification email...');
    await sendVerificationEmail(testEmail, testName, testToken);
    
    console.log('\n✅ Email test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. If you have SENDGRID_API_KEY set, check your email');
    console.log('2. If not, check the console logs above for the email content');
    console.log('3. Add SENDGRID_API_KEY to your .env.local file for real emails');
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmail(); 