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
