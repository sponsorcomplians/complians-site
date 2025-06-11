'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Package } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function CheckoutSuccess() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Get session_id from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const sessionIdParam = urlParams.get('session_id')
    
    if (sessionIdParam) {
      setSessionId(sessionIdParam)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#263976] mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your purchase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your payment has been processed successfully and you now have access to your product.
          </p>

          {/* Session ID */}
          {sessionId && (
            <div className="bg-gray-100 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600">
                <strong>Order ID:</strong> {sessionId.slice(0, 20)}...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#263976] hover:bg-[#1a2557] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#263976]"
            >
              <Package className="h-5 w-5 mr-2" />
              Go to Dashboard
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>

            <Link
              href="/ai-agents"
              className="w-full flex items-center justify-center px-6 py-3 border border-[#263976] text-base font-medium rounded-md text-[#263976] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#263976]"
            >
              Browse More Products
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Access your product from the dashboard</li>
              <li>• Download any available resources</li>
              <li>• Check your email for receipt and instructions</li>
            </ul>
          </div>

          {/* Support */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact our{' '}
              <Link href="/contact" className="text-[#00c3ff] hover:text-[#0099cc]">
                support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
