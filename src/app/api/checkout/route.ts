import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No session', session })
    }

    // Test 2: Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: 'Missing SUPABASE_URL' })
    }

    // Test 3: Try importing Stripe
    try {
      const { stripe } = await import('@/lib/stripe')
      return NextResponse.json({ 
        success: true, 
        message: 'All checks passed',
        user: session.user.email 
      })
    } catch (importError: any) {
      return NextResponse.json({ 
        error: 'Stripe import failed', 
        details: importError?.message || 'Unknown import error'
      })
    }

  } catch (error: any) {
    return NextResponse.json({
      error: 'Caught error',
      details: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace'
    })
  }
}
