import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id)
        break
      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing completed checkout session:', session.id)

    const { userId, userEmail, productId, productName, productType } = session.metadata || {}

    if (!userId || !userEmail || !productId || !productName || !productType) {
      console.error('Missing required metadata in session:', session.id)
      return
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .insert({
        user_id: userId,
        product_id: productId,
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_session_id: session.id,
        amount: session.amount_total || 0,
        currency: session.currency || 'gbp',
        status: 'completed'
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Error creating purchase record:', purchaseError)
      return
    }

    console.log('Purchase record created:', purchase.id)

    // Grant product access
    const { data: access, error: accessError } = await supabaseAdmin
      .from('product_access')
      .insert({
        user_id: userId,
        product_id: productId,
        product_name: productName,
        product_type: productType
      })
      .select()
      .single()

    if (accessError) {
      console.error('Error granting product access:', accessError)
      return
    }

    console.log('Product access granted:', access.id)

    // TODO: Send confirmation email to user
    console.log('Purchase completed for user:', userEmail, 'Product:', productName)

  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
