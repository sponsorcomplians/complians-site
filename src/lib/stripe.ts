import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
})

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100) // Convert to pence
}

export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100 // Convert from pence to pounds
}

