'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './Button'

interface CheckoutButtonProps {
  productSlug: string
  className?: string
  children?: React.ReactNode
}

export default function CheckoutButton({ 
  productSlug, 
  className,
  children = 'Buy Now'
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/checkout?productSlug=${productSlug}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        router.push(data.url)
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to initiate checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleCheckout} 
      isLoading={isLoading}
      disabled={isLoading}
      className={className}
    >
      {children}
    </Button>
  )
}