// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  
  // In Next.js 15, headers() returns a Promise
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
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
      const session = event.data.object as Stripe.Checkout.Session
      
      // Create purchase record
      const { error } = await supabaseAdmin
        .from('purchases')
        .insert({
          user_id: session.metadata?.userId,
          product_id: session.metadata?.productId,
          stripe_session_id: session.id,
          amount: session.amount_total,
          status: 'completed',
          created_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Error creating purchase:', error)
        return NextResponse.json(
          { error: 'Failed to create purchase' },
          { status: 500 }
        )
      }
      break

    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', event.data.object)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}