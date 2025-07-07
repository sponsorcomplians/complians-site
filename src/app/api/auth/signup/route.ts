// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';
import { logAuditEvent } from '@/lib/audit-service';
import { headers } from 'next/headers';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit-service';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const headersList = await headers();
  
  try {
    const { email, password, fullName, company, phone, redirect } = await request.json();

    // Rate limiting check
    const clientIP = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                    headersList.get('x-real-ip') || 
                    'unknown';
    const rateLimitIdentifier = `signup:${clientIP}`;
    
    const rateLimitResult = await checkRateLimit(
      rateLimitIdentifier,
      RATE_LIMITS.SIGNUP.maxAttempts,
      RATE_LIMITS.SIGNUP.windowMs
    );

    if (!rateLimitResult.success) {
      // Log rate limit exceeded
      try {
        await logAuditEvent(
          'signup_failed',
          {
            email: email || 'unknown',
            reason: 'Rate limit exceeded',
            client_ip: clientIP,
            retry_after: rateLimitResult.retryAfter
          },
          'user',
          email || 'unknown',
          undefined,
          undefined,
          headersList
        );
      } catch (auditError) {
        console.warn('Failed to log rate limit exceeded:', auditError);
      }

      return NextResponse.json(
        { 
          error: 'Too many signup attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.SIGNUP.maxAttempts.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
          }
        }
      );
    }

    // Validate required fields
    if (!email || !password || !fullName || !company) {
      // Log failed signup attempt
      try {
        await logAuditEvent(
          'signup_failed',
          {
            email: email || 'unknown',
            reason: 'Missing required fields',
            fields_missing: {
              email: !email,
              password: !password,
              fullName: !fullName,
              company: !company
            }
          },
          'user',
          email || 'unknown',
          undefined,
          undefined,
          headersList
        );
      } catch (auditError) {
        console.warn('Failed to log signup failure:', auditError);
      }

      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Checking if user exists:', normalizedEmail);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();
    console.log('Existing user found:', existingUser);

    if (existingUser) {
      console.log('Email check:', normalizedEmail, 'exists:', !!existingUser);
      // Log failed signup attempt
      try {
        await logAuditEvent(
          'signup_failed',
          {
            email: normalizedEmail,
            reason: 'User already exists'
          },
          'user',
          normalizedEmail,
          undefined,
          undefined,
          headersList
        );
      } catch (auditError) {
        console.warn('Failed to log signup failure:', auditError);
      }

      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if tenant (company) already exists
    console.log('Checking if company exists:', company);
    let { data: existingTenant } = await supabase
      .from('tenants')
      .select('id, name, max_workers, subscription_plan')
      .eq('name', company)
      .single();
    console.log('Company check:', company, 'exists:', !!existingTenant);

    let tenantId: string;
    let isFirstUser = false;

    if (existingTenant) {
      console.log('Company name already exists, using existing tenant');
      // Use existing tenant
      tenantId = existingTenant.id;
      console.log(`Using existing tenant: ${existingTenant.name} (ID: ${tenantId})`);
    } else {
      console.log('Company name does not exist, creating new tenant');
      // Create new tenant - bypass RLS for signup
      console.log('Attempting to create new tenant:', company);
      
      try {
        // Temporarily disable RLS for tenant creation
        const { data: newTenant, error: tenantError } = await supabase
          .rpc('create_tenant_during_signup', {
            tenant_name: company,
            tenant_industry: 'General',
            tenant_max_workers: 100,
            tenant_subscription_plan: 'Basic'
          });

        if (tenantError) {
          console.error('TENANT CREATION ERROR:', {
            message: tenantError.message,
            code: tenantError.code,
            details: tenantError.details,
            hint: tenantError.hint,
            stack: new Error().stack
          });
          
          // Log failed signup attempt
          try {
            await logAuditEvent(
              'signup_failed',
              {
                email: normalizedEmail,
                reason: 'Failed to create tenant',
                tenant_error: tenantError.message,
                tenant_error_details: tenantError.details,
                tenant_error_code: tenantError.code,
                tenant_error_hint: tenantError.hint
              },
              'user',
              normalizedEmail,
              undefined,
              undefined,
              headersList
            );
          } catch (auditError) {
            console.warn('Failed to log signup failure:', auditError);
          }

          return NextResponse.json(
            { 
              error: `Failed to create tenant: ${tenantError.message}`,
              code: tenantError.code,
              details: tenantError.details
            },
            { status: 500 }
          );
        }

        tenantId = newTenant.id;
        isFirstUser = true;
        console.log(`Created new tenant: ${newTenant.name} (ID: ${tenantId})`);
        
      } catch (error) {
        console.error('TENANT CREATION EXCEPTION:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: error instanceof Error ? (error as any).code : undefined,
          meta: error instanceof Error ? (error as any).meta : undefined,
          stack: error instanceof Error ? error.stack : undefined
        });
        
        // Log failed signup attempt
        try {
          await logAuditEvent(
            'signup_failed',
            {
              email: normalizedEmail,
              reason: 'Tenant creation exception',
              error: error instanceof Error ? error.message : 'Unknown error',
              error_code: error instanceof Error ? (error as any).code : undefined
            },
            'user',
            normalizedEmail,
            undefined,
            undefined,
            headersList
          );
        } catch (auditError) {
          console.warn('Failed to log signup failure:', auditError);
        }

        return NextResponse.json(
          { 
            error: `Failed to create tenant: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: error instanceof Error ? (error as any).code : undefined
          },
          { status: 500 }
        );
      }
    }

    // Determine user role - first user in a tenant becomes Admin, others become Viewer
    const defaultRole = isFirstUser ? 'Admin' : 'Viewer';
    console.log('Creating user with role:', defaultRole, 'for tenant:', tenantId);

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Create user with tenant_id
    console.log('Creating new user with tenant ID:', tenantId);
    
    let user: any;
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: uuidv4(),
          email: normalizedEmail,
          password: hashedPassword,
          full_name: fullName,
          company,
          phone: phone || null,
          tenant_id: tenantId,
          role: defaultRole,
          is_email_verified: false,
          email_verification_token: verificationToken,
          email_verification_expires: verificationExpires.toISOString()
        })
        .select('id, email, full_name, company, tenant_id, role, is_email_verified, created_at')
        .single();

      if (userError) {
        console.error('USER CREATION ERROR:', {
          message: userError.message,
          code: userError.code,
          details: userError.details,
          hint: userError.hint,
          stack: new Error().stack
        });
        
        // Log failed signup attempt
        try {
          await logAuditEvent(
            'signup_failed',
            {
              email: normalizedEmail,
              reason: 'Failed to create user',
              user_error: userError.message,
              user_error_details: userError.details,
              user_error_code: userError.code,
              user_error_hint: userError.hint,
              tenant_id: tenantId,
              role: defaultRole
            },
            'user',
            normalizedEmail,
            undefined,
            undefined,
            headersList
          );
        } catch (auditError) {
          console.warn('Failed to log signup failure:', auditError);
        }

        return NextResponse.json(
          { 
            error: `Failed to create user: ${userError.message}`,
            code: userError.code,
            details: userError.details
          },
          { status: 500 }
        );
      }

      user = userData;
      console.log(`Created new user: ${user.email} (ID: ${user.id})`);
      
    } catch (error) {
      console.error('USER CREATION EXCEPTION:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof Error ? (error as any).code : undefined,
        meta: error instanceof Error ? (error as any).meta : undefined,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Log failed signup attempt
      try {
        await logAuditEvent(
          'signup_failed',
          {
            email: normalizedEmail,
            reason: 'User creation exception',
            error: error instanceof Error ? error.message : 'Unknown error',
            error_code: error instanceof Error ? (error as any).code : undefined
          },
          'user',
          normalizedEmail,
          undefined,
          undefined,
          headersList
        );
      } catch (auditError) {
        console.warn('Failed to log signup failure:', auditError);
      }

      return NextResponse.json(
        { 
          error: `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: error instanceof Error ? (error as any).code : undefined
        },
        { status: 500 }
      );
    }

    console.log(`User created successfully: ${user.email} (Tenant: ${tenantId}, Role: ${defaultRole})`);

    // Create user_roles record
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        tenant_id: tenantId,
        role: defaultRole
      });

    if (roleError) {
      console.error('Error creating user role:', roleError);
      // Continue anyway as the trigger should handle this
    }

    // Create Auth user (if using Supabase Auth)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        company,
        tenant_id: tenantId,
        role: defaultRole
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      // Continue anyway as we have the user in our custom table
    }

    // Send verification email with redirect parameter if provided
    try {
      await sendVerificationEmail(user.email, user.full_name, verificationToken, redirect);
      console.log('Verification email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway as user can request verification email later
    }

    // Log successful signup
    try {
      await logAuditEvent(
        'signup_success',
        {
          email: user.email,
          full_name: user.full_name,
          company: user.company,
          tenant_id: user.tenant_id,
          role: defaultRole,
          is_first_user: isFirstUser
        },
        'user',
        user.id,
        undefined,
        {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          company: user.company,
          tenant_id: user.tenant_id,
          role: defaultRole,
          is_email_verified: false
        },
        headersList
      );
    } catch (auditError) {
      console.warn('Failed to log signup success:', auditError);
    }

    console.log('Signup completed successfully, returning response');
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        company: user.company,
        tenant_id: user.tenant_id,
        role: user.role,
        is_email_verified: user.is_email_verified
      },
      tenant: {
        id: tenantId,
        name: company
      },
      role: defaultRole,
      isFirstUser
    });

  } catch (error) {
    console.error('Signup error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      email: 'unknown',
      timestamp: new Date().toISOString()
    });
    
    // Log failed signup attempt
    try {
      await logAuditEvent(
        'signup_failed',
        {
          email: 'unknown',
          reason: 'Internal server error',
          error: error instanceof Error ? error.message : 'Unknown error',
          error_stack: error instanceof Error ? error.stack : undefined
        },
        'user',
        'unknown',
        undefined,
        undefined,
        headersList
      );
    } catch (auditError) {
      console.warn('Failed to log signup failure:', auditError);
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred during signup'
      },
      { status: 500 }
    );
  }
}

// Placeholder function - implement with your email service
async function sendWelcomeEmail(email: string, name: string) {
  // TODO: Implement with your email service (SendGrid, AWS SES, etc.)
  console.log('Sending welcome email to:', email);
}