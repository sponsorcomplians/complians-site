import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
})

export function formatAmountForStripe(amount: number): number {
  // Convert pounds to pence (multiply by 100)
  return Math.round(amount * 100)
}