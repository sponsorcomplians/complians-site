// src/lib/email.ts
// This is a placeholder email service. Replace with your actual email provider (SendGrid, AWS SES, etc.)

const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@sponsorcomplians.co.uk';

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${APP_URL}/auth/verify-email?token=${token}`;
  
  const subject = 'Verify your email - SponsorComplians';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome to SponsorComplians, ${name}!</h1>
      <p style="color: #666; font-size: 16px;">
        Thank you for creating an account. Please verify your email address to get started.
      </p>
      <div style="margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link into your browser:
      </p>
      <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
        ${verificationUrl}
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `;

  // TODO: Implement with your email service
  console.log('Sending verification email:', { to: email, subject, html });
  
  // Example with SendGrid (uncomment and configure):
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // const msg = {
  //   to: email,
  //   from: FROM_EMAIL,
  //   subject: subject,
  //   html: html,
  // };
  // await sgMail.send(msg);
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;
  
  const subject = 'Reset your password - SponsorComplians';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Password Reset Request</h1>
      <p style="color: #666; font-size: 16px;">
        Hi ${name},
      </p>
      <p style="color: #666; font-size: 16px;">
        We received a request to reset your password. Click the button below to create a new password.
      </p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link into your browser:
      </p>
      <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
        ${resetUrl}
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  // TODO: Implement with your email service
  console.log('Sending password reset email:', { to: email, subject, html });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const subject = 'Welcome to SponsorComplians!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome aboard, ${name}!</h1>
      <p style="color: #666; font-size: 16px;">
        Thank you for joining SponsorComplians. We're excited to help you streamline your sponsor compliance management.
      </p>
      <h2 style="color: #333; font-size: 20px;">Getting Started</h2>
      <ul style="color: #666; font-size: 16px;">
        <li>Complete your profile information</li>
        <li>Explore our digital compliance tools</li>
        <li>Check out our AI-powered compliance agents</li>
        <li>Set up your first worker profile</li>
      </ul>
      <div style="margin: 30px 0;">
        <a href="${APP_URL}/dashboard" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Go to Dashboard
        </a>
      </div>
      <p style="color: #666; font-size: 16px;">
        If you have any questions, feel free to <a href="${APP_URL}/contact" style="color: #3b82f6;">contact our support team</a>.
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Best regards,<br>
        The SponsorComplians Team
      </p>
    </div>
  `;

  // TODO: Implement with your email service
  console.log('Sending welcome email:', { to: email, subject, html });
}