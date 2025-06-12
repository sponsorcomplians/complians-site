import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate simple OTP for testing
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Log OTP to console for testing
    console.log(`🔐 OTP for ${email}: ${otpCode}`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      debug: { otpCode }
    })

  } catch (error) {
    console.error('Send OTP API error:', error)
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  )
}
