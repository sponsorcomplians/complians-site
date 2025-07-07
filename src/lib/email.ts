// src/lib/email.ts
// This is a placeholder email service. Replace with your actual email provider (SendGrid, AWS SES, etc.)

import sgMail from '@sendgrid/mail';

const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@sponsorcomplians.co.uk';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendVerificationEmail(email: string, name: string, token: string, redirect?: string) {
  let verificationUrl = `${APP_URL}/auth/verify-email?token=${token}`;
  if (redirect) {
    verificationUrl += `&redirect=${encodeURIComponent(redirect)}`;
  }
  
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

  try {
    if (process.env.SENDGRID_API_KEY) {
      // Send with SendGrid
      const msg = {
        to: email,
        from: FROM_EMAIL,
        subject: subject,
        html: html,
      };
      await sgMail.send(msg);
      console.log('✅ Verification email sent via SendGrid to:', email);
    } else {
      // Fallback to console log for development
      console.log('📧 Sending verification email (development mode):', { 
        to: email, 
        subject, 
        verificationUrl,
        html: html.substring(0, 200) + '...' 
      });
    }
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw error;
  }
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

  try {
    if (process.env.SENDGRID_API_KEY) {
      // Send with SendGrid
      const msg = {
        to: email,
        from: FROM_EMAIL,
        subject: subject,
        html: html,
      };
      await sgMail.send(msg);
      console.log('✅ Password reset email sent via SendGrid to:', email);
    } else {
      // Fallback to console log for development
      console.log('📧 Sending password reset email (development mode):', { 
        to: email, 
        subject, 
        resetUrl,
        html: html.substring(0, 200) + '...' 
      });
    }
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
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

  try {
    if (process.env.SENDGRID_API_KEY) {
      // Send with SendGrid
      const msg = {
        to: email,
        from: FROM_EMAIL,
        subject: subject,
        html: html,
      };
      await sgMail.send(msg);
      console.log('✅ Welcome email sent via SendGrid to:', email);
    } else {
      // Fallback to console log for development
      console.log('📧 Sending welcome email (development mode):', { 
        to: email, 
        subject,
        html: html.substring(0, 200) + '...' 
      });
    }
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    throw error;
  }
}

export async function sendPaymentConfirmationEmail(email: string, name: string, productName: string) {
  const subject = 'Welcome! Your Sponsor Compliance Access is Now Active';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome, ${name}!</h1>
      <p style="color: #666; font-size: 16px;">
        Thank you for your purchase! Your access to <strong>${productName}</strong> is now active and ready to use.
      </p>
      <h2 style="color: #333; font-size: 20px;">What's Next?</h2>
      <ul style="color: #666; font-size: 16px;">
        <li>Start your first compliance assessment</li>
        <li>Upload worker documents for analysis</li>
        <li>Review AI-generated compliance reports</li>
        <li>Access your personalized dashboard</li>
      </ul>
      <div style="margin: 30px 0;">
        <a href="${APP_URL}/master-compliance-dashboard" 
           style="background-color: #10b981; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Start Assessment
        </a>
      </div>
      <p style="color: #666; font-size: 16px;">
        Your compliance journey starts now! Our AI agents are ready to help you maintain full compliance with UK sponsor duties.
      </p>
      <p style="color: #666; font-size: 16px;">
        If you need any assistance, our support team is here to help at <a href="mailto:support@sponsorcomplians.co.uk" style="color: #3b82f6;">support@sponsorcomplians.co.uk</a>
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Best regards,<br>
        The SponsorComplians Team
      </p>
    </div>
  `;

  try {
    if (process.env.SENDGRID_API_KEY) {
      // Send with SendGrid
      const msg = {
        to: email,
        from: FROM_EMAIL,
        subject: subject,
        html: html,
      };
      await sgMail.send(msg);
      console.log('✅ Payment confirmation email sent via SendGrid to:', email);
    } else {
      // Fallback to console log for development
      console.log('📧 Sending payment confirmation email (development mode):', { 
        to: email, 
        subject,
        html: html.substring(0, 200) + '...' 
      });
    }
  } catch (error) {
    console.error('❌ Failed to send payment confirmation email:', error);
    throw error;
  }
}

export async function sendReminderEmail(email: string, name: string, productName: string) {
  const subject = 'Reminder: Start Your Compliance Assessment';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Hi ${name},</h1>
      <p style="color: #666; font-size: 16px;">
        We noticed you haven't started using your <strong>${productName}</strong> access yet. 
        Don't miss out on the benefits of AI-powered compliance management!
      </p>
      <h2 style="color: #333; font-size: 20px;">Why Start Now?</h2>
      <ul style="color: #666; font-size: 16px;">
        <li>Automated compliance checking saves hours of manual work</li>
        <li>AI-powered red flag detection prevents serious breaches</li>
        <li>Professional reports for Home Office compliance</li>
        <li>Real-time monitoring and alerts</li>
      </ul>
      <div style="margin: 30px 0;">
        <a href="${APP_URL}/master-compliance-dashboard" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Start Your Assessment
        </a>
      </div>
      <p style="color: #666; font-size: 16px;">
        It only takes a few minutes to upload your first worker documents and get started. 
        Our AI will do the heavy lifting for you!
      </p>
      <p style="color: #666; font-size: 16px;">
        Need help getting started? <a href="${APP_URL}/contact" style="color: #3b82f6;">Contact our support team</a> for personalized assistance.
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Best regards,<br>
        The SponsorComplians Team
      </p>
    </div>
  `;

  try {
    if (process.env.SENDGRID_API_KEY) {
      // Send with SendGrid
      const msg = {
        to: email,
        from: FROM_EMAIL,
        subject: subject,
        html: html,
      };
      await sgMail.send(msg);
      console.log('✅ Reminder email sent via SendGrid to:', email);
    } else {
      // Fallback to console log for development
      console.log('📧 Sending reminder email (development mode):', { 
        to: email, 
        subject,
        html: html.substring(0, 200) + '...' 
      });
    }
  } catch (error) {
    console.error('❌ Failed to send reminder email:', error);
    throw error;
  }
}