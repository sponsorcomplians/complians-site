import { NextRequest, NextResponse } from 'next/server'
import { OTPService, checkRateLimit } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otpCode, purpose } = body

    // Validate input
    if (!email || !otpCode || !purpose) {
      return NextResponse.json(
        { success: false, message: 'Email, OTP code, and purpose are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate OTP code format (6 digits)
    const otpRegex = /^\d{6}$/
    if (!otpRegex.test(otpCode)) {
      return NextResponse.json(
        { success: false, message: 'OTP code must be 6 digits' },
        { status: 400 }
      )
    }

    // Validate purpose
    const validPurposes = ['signup', 'login', 'password_reset']
    if (!validPurposes.includes(purpose)) {
      return NextResponse.json(
        { success: false, message: 'Invalid purpose' },
        { status: 400 }
      )
    }

    // Rate limiting - 10 verification attempts per 15 minutes per email
    const rateLimitKey = 'otp_verify_' + email
    if (!checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many verification attempts. Please wait 15 minutes before trying again.' 
        },
        { status: 429 }
      )
    }

    // Get client IP for additional rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    const ipRateLimitKey = 'otp_verify_ip_' + clientIP
    if (!checkRateLimit(ipRateLimitKey, 20, 15 * 60 * 1000)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many requests from this IP. Please try again later.' 
        },
        { status: 429 }
      )
    }

    // Verify OTP
    const result = await OTPService.verifyOTP(email, otpCode, purpose)

    if (result.success) {
      // Log successful verification (for monitoring)
      console.log('OTP verified successfully for ' + email + ' with purpose ' + purpose)
      
      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          email,
          purpose,
          verifiedAt: new Date().toISOString()
        }
      })
    } else {
      // Log failed verification attempt
      console.log('OTP verification failed for ' + email + ': ' + result.message)
      
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Verify OTP API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  )
}
