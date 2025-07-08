'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Loader2 } from 'lucide-react'

interface CheckoutButtonProps {
  productId: string
  productName: string
  price: string
  className?: string
}

export default function CheckoutButton({ 
  productId, 
  productName, 
  price, 
  className = '' 
}: CheckoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // TODO: RE-ENABLE AUTH
  // Temporarily bypass all session and auth checks for development
  const session = {
    user: {
      email: 'dev@example.com',
      name: 'Dev User',
      company: 'Dev Company',
      tenant_id: 'dev-tenant-id',
      role: 'Admin',
      id: 'dev-user-id',
    },
    is_email_verified: true,
  };
  const status = 'authenticated';

  const handleCheckout = async () => {
    // Check if user is authenticated
    if (!session) {
      // TEMPORARILY DISABLED FOR DEV
      // router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href))
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        setError(data.message || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const defaultClassName = "w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#263976] hover:bg-[#1a2557] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#263976] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={className || defaultClassName}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5 mr-2" />
            Buy Now - {price}
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      {!session && (
        <p className="text-sm text-gray-600 text-center">
          You'll be asked to sign in before checkout
        </p>
      )}
    </div>
  )
}
