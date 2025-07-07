// Simple email test
console.log('🧪 Testing email functionality...\n');

// Check if SendGrid API key is set
const hasSendGridKey = process.env.SENDGRID_API_KEY;
console.log('SENDGRID_API_KEY configured:', hasSendGridKey ? '✅' : '❌');

// Check other email-related environment variables
const fromEmail = process.env.FROM_EMAIL || 'noreply@sponsorcomplians.co.uk';
const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

console.log('FROM_EMAIL:', fromEmail);
console.log('APP_URL:', appUrl);

console.log('\n📋 Email Configuration Status:');
console.log('- SendGrid API Key:', hasSendGridKey ? '✅ Set' : '❌ Missing');
console.log('- From Email:', fromEmail);
console.log('- App URL:', appUrl);

if (!hasSendGridKey) {
  console.log('\n⚠️ To enable real email sending:');
  console.log('1. Sign up for SendGrid (https://sendgrid.com)');
  console.log('2. Get your API key from SendGrid dashboard');
  console.log('3. Add SENDGRID_API_KEY=your_api_key to your .env.local file');
  console.log('4. Verify your sender domain in SendGrid');
  console.log('\n📧 For now, emails will be logged to console only');
} else {
  console.log('\n✅ Email should work! Try the resend verification button again.');
}

console.log('\n🔍 To test the resend verification:');
console.log('1. Go to your app and try the "Resend Email" button');
console.log('2. Check the browser console and server logs for email details');
console.log('3. If SendGrid is configured, check your email inbox'); 