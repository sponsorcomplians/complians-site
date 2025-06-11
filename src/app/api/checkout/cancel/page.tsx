'use client'

import Link from 'next/link'
import { XCircle, ArrowLeft, ShoppingBag, HelpCircle } from 'lucide-react'

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>

          {/* Cancel Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Your payment was cancelled. No charges have been made to your account.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/ai-agents"
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#263976] hover:bg-[#1a2557] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#263976]"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="w-full flex items-center justify-center px-6 py-3 border border-[#263976] text-base font-medium rounded-md text-[#263976] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#263976]"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <HelpCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-sm font-medium text-yellow-900">Need Help?</h3>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              If you experienced any issues during checkout, we're here to help.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center text-sm font-medium text-yellow-600 hover:text-yellow-500"
            >
              Contact Support
            </Link>
          </div>

          {/* Common Issues */}
          <div className="mt-6 text-left">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Common reasons for cancellation:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Payment method declined</li>
              <li>• Browser or connection issues</li>
              <li>• Changed mind about purchase</li>
              <li>• Need more information about the product</li>
            </ul>
          </div>

          {/* Support */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Questions about our products?{' '}
              <Link href="/contact" className="text-[#00c3ff] hover:text-[#0099cc]">
                Get in touch
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
