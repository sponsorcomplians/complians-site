import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          await handleSuccessfulPayment(session)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(paymentIntent)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const { userId, productId } = session.metadata || {}

  if (!userId || !productId) {
    console.error('Missing metadata in checkout session:', session.id)
    return
  }

  try {
    // Update purchase status to completed
    const { error: updateError } = await supabaseAdmin
      .from('purchases')
      .update({
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', session.id)
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (updateError) {
      console.error('Error updating purchase:', updateError)
      return
    }

    console.log(`Purchase completed for user ${userId}, product ${productId}`)

    // TODO: Send confirmation email to user
    // TODO: Trigger any post-purchase workflows

  } catch (error) {
    console.error('Error handling successful payment:', error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Additional handling for payment intent success if needed
  console.log(`Payment intent succeeded: ${paymentIntent.id}`)
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Update purchase status to failed
  try {
    const { error } = await supabaseAdmin
      .from('purchases')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating failed payment:', error)
    }

    console.log(`Payment failed: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

