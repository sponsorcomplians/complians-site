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
    
    // Debug logging
    console.log('=== CHECKOUT DEBUG ===')
    console.log('CheckoutButton clicked with productSlug:', productSlug)

    try {
      const apiUrl = `/api/checkout?productSlug=${productSlug}`
      console.log('Calling API URL:', apiUrl)
      
      const response = await fetch(apiUrl)
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        console.log('Response not ok, throwing error:', data.error)
        throw new Error(data.error || 'Checkout failed')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        console.log('Success! Redirecting to Stripe URL:', data.url)
        window.location.href = data.url
      } else {
        console.log('No URL in response, throwing error')
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error('=== CHECKOUT ERROR ===', error)
      alert(`Failed to initiate checkout: ${error?.message || 'Unknown error'}`)
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