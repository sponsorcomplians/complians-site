// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { sendPaymentConfirmationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

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
      
      try {
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

        // Send confirmation email
        if (session.customer_email && session.metadata?.productName) {
          try {
            await sendPaymentConfirmationEmail(
              session.customer_email,
              session.metadata?.userName || 'Valued Customer',
              session.metadata.productName
            )
            console.log('Payment confirmation email sent to:', session.customer_email)
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError)
            // Don't fail the webhook for email errors
          }
        }

        console.log('Payment completed successfully for session:', session.id)
      } catch (error) {
        console.error('Error processing checkout session:', error)
        return NextResponse.json(
          { error: 'Failed to process payment' },
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