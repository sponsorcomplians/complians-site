import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import Stripe from 'stripe'
import { getUserProfile } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Product catalog
const PRODUCTS = {
  'ai-qualification-compliance': {
    name: 'AI Qualification Compliance Agent',
    price: 29900, // £299.00 in pence
    currency: 'gbp',
    type: 'ai_agent'
  },
  'ai-salary-compliance': {
    name: 'AI Salary Compliance Agent', 
    price: 39900, // £399.00 in pence
    currency: 'gbp',
    type: 'ai_agent'
  },
  'digital-compliance-toolkit': {
    name: 'Digital Compliance Toolkit',
    price: 14900, // £149.00 in pence
    currency: 'gbp',
    type: 'digital_tool'
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId } = body

    if (!productId || !PRODUCTS[productId as keyof typeof PRODUCTS]) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const product = PRODUCTS[productId as keyof typeof PRODUCTS]
    const userProfile = await getUserProfile(session.user.email)

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      )
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: 'Access to ' + product.name + ' for compliance management',
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.NEXT_PUBLIC_APP_URL + '/checkout/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.NEXT_PUBLIC_APP_URL + '/checkout/cancel',
      customer_email: session.user.email,
      metadata: {
        userId: userProfile.id,
        userEmail: session.user.email,
        productId: productId,
        productName: product.name,
        productType: product.type,
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create checkout session' },
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
