import { supabase, supabaseAdmin } from './supabase'
import crypto from 'crypto'

// OTP Service for generating and verifying codes
export class OTPService {
  // Generate a 6-digit OTP code
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Send OTP via email (using Supabase Auth)
  static async sendOTP(email: string, purpose: 'signup' | 'login' | 'password_reset'): Promise<{ success: boolean; message: string }> {
    try {
      // Generate OTP code
      const otpCode = this.generateOTP()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

      // Store OTP in database
      const { error: insertError } = await supabaseAdmin
        .from('otp_verifications')
        .insert({
          email,
          otp_code: otpCode,
          purpose,
          expires_at: expiresAt.toISOString(),
          verified: false
        })

      if (insertError) {
        console.error('Error storing OTP:', insertError)
        return { success: false, message: 'Failed to generate OTP' }
      }

      // Send email using Supabase Auth (for now, we'll log it - you can integrate with email service later)
      console.log('OTP for ' + email + ': ' + otpCode)
      
      // In production, you would send this via email service like:
      // await sendEmailTemplate(email, 'otp-verification', { otpCode, purpose })

      return { success: true, message: 'OTP sent successfully' }

    } catch (error) {
      console.error('Error sending OTP:', error)
      return { success: false, message: 'Failed to send OTP' }
    }
  }

  // Verify OTP code
  static async verifyOTP(email: string, otpCode: string, purpose: 'signup' | 'login' | 'password_reset'): Promise<{ success: boolean; message: string }> {
    try {
      // Find valid OTP
      const { data: otpRecord, error: fetchError } = await supabaseAdmin
        .from('otp_verifications')
        .select('*')
        .eq('email', email)
        .eq('otp_code', otpCode)
        .eq('purpose', purpose)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError || !otpRecord) {
        return { success: false, message: 'Invalid or expired OTP code' }
      }

      // Mark OTP as verified
      const { error: updateError } = await supabaseAdmin
        .from('otp_verifications')
        .update({ verified: true })
        .eq('id', otpRecord.id)

      if (updateError) {
        console.error('Error updating OTP:', updateError)
        return { success: false, message: 'Failed to verify OTP' }
      }

      return { success: true, message: 'OTP verified successfully' }

    } catch (error) {
      console.error('Error verifying OTP:', error)
      return { success: false, message: 'Failed to verify OTP' }
    }
  }
}

// User management functions
export async function getUserProfile(email: string) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

export async function createUserProfile(userData: {
  email: string
  full_name?: string
  company_name?: string
  phone?: string
  job_title?: string
  company_size?: string
  industry?: string
}) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        email: userData.email,
        full_name: userData.full_name,
        company_name: userData.company_name,
        phone: userData.phone,
        job_title: userData.job_title,
        company_size: userData.company_size,
        industry: userData.industry,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return { success: false, message: 'Failed to create profile' }
    }

    return { success: true, profile }
  } catch (error) {
    console.error('Error in createUserProfile:', error)
    return { success: false, message: 'Failed to create profile' }
  }
}

export async function updateUserProfile(email: string, updates: any) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('email', email)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return { success: false, message: 'Failed to update profile' }
    }

    return { success: true, profile }
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return { success: false, message: 'Failed to update profile' }
  }
}

export async function getUserPurchases(email: string) {
  try {
    const profile = await getUserProfile(email)
    if (!profile) return []

    const { data: purchases, error } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user purchases:', error)
      return []
    }

    return purchases || []
  } catch (error) {
    console.error('Error in getUserPurchases:', error)
    return []
  }
}

export async function getUserProductAccess(email: string) {
  try {
    const profile = await getUserProfile(email)
    if (!profile) return []

    const { data: access, error } = await supabaseAdmin
      .from('product_access')
      .select('*')
      .eq('user_id', profile.id)
      .order('access_granted_at', { ascending: false })

    if (error) {
      console.error('Error fetching user product access:', error)
      return []
    }

    return access || []
  } catch (error) {
    console.error('Error in getUserProductAccess:', error)
    return []
  }
}

// Authentication helper functions
export async function authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: any; message: string }> {
  try {
    // For now, we'll use a simple check - in production you'd hash passwords
    // This is a placeholder for your actual authentication logic
    const profile = await getUserProfile(email)
    
    if (!profile) {
      return { success: false, message: 'User not found' }
    }

    // In production, you would verify the password hash here
    // For now, we'll just return success if user exists
    return { success: true, user: profile, message: 'Authentication successful' }
  } catch (error) {
    console.error('Error authenticating user:', error)
    return { success: false, message: 'Authentication failed' }
  }
}

// Rate limiting helper (simple in-memory store - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) {
    return false
  }

  record.count++
  return true
}

// Additional helper functions
export async function getCurrentUser(email: string) {
  try {
    const profile = await getUserProfile(email)
    return profile
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function userHasPurchasedProduct(userEmail: string, productId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(userEmail)
    if (!profile) return false

    const { data: purchase, error } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('user_id', profile.id)
      .eq('product_id', productId)
      .eq('status', 'completed')
      .single()

    return !error && !!purchase
  } catch (error) {
    console.error('Error checking user purchase:', error)
    return false
  }
}
