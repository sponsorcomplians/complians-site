import { NextRequest, NextResponse } from 'next/server'
import { OTPService, checkRateLimit } from '@/lib/enhanced_auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, purpose } = body

    // Validate input
    if (!email || !purpose) {
      return NextResponse.json(
        { success: false, message: 'Email and purpose are required' },
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

    // Validate purpose
    const validPurposes = ['signup', 'login', 'password_reset']
    if (!validPurposes.includes(purpose)) {
      return NextResponse.json(
        { success: false, message: 'Invalid purpose' },
        { status: 400 }
      )
    }

    // Rate limiting - 5 attempts per 15 minutes per email
    const rateLimitKey = 'otp_send_' + email
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many OTP requests. Please wait 15 minutes before trying again.' 
        },
        { status: 429 }
      )
    }

    // Get client IP for additional rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    const ipRateLimitKey = 'otp_send_ip_' + clientIP
    if (!checkRateLimit(ipRateLimitKey, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many requests from this IP. Please try again later.' 
        },
        { status: 429 }
      )
    }

    // Send OTP
    const result = await OTPService.sendOTP(email, purpose as 'signup' | 'login' | 'password_reset')

    if (result.success) {
      // Log successful OTP send (for monitoring)
      console.log('OTP sent successfully to ' + email + ' for ' + purpose)
      
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully. Please check your email.',
        // Don't include the actual OTP code in production
        ...(process.env.NODE_ENV === 'development' && { 
          debug: 'Check console for OTP code in development mode' 
        })
      })
    } else {
      console.error('Failed to send OTP to ' + email + ':', result.message)
      
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Send OTP API error:', error)
    
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
