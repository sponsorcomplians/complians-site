'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Product definitions
const PRODUCTS = {
  'ai-qualification-compliance': {
    id: 'ai-qualification-compliance',
    name: 'AI Qualification Compliance Agent',
    description: 'Advanced AI-powered qualification verification and compliance checking',
    price: 199.99,
    originalPrice: 299.99,
    features: [
      'Document upload and AI analysis',
      'Expert-level qualification assessment',
      'Red flag detection for serious breaches',
      'Professional paragraph reports',
      'Dashboard with analytics'
    ]
  },
  'ai-salary-compliance': {
    id: 'ai-salary-compliance',
    name: 'AI Salary Compliance Agent',
    description: 'Comprehensive salary compliance analysis with payslip verification',
    price: 179.99,
    originalPrice: 249.99,
    features: [
      'Payslip analysis and verification',
      'National Minimum Wage checking',
      'Home Office threshold monitoring',
      'Underpayment detection',
      'Professional assessment reports'
    ]
  },
  'ai-right-to-work-compliance': {
    id: 'ai-right-to-work-compliance',
    name: 'AI Right to Work Agent',
    description: 'Automated right to work checking and verification',
    price: 159.99,
    features: [
      'Right to work verification',
      'Home Office status checking',
      'Visa expiry monitoring',
      'Automated compliance alerts',
      'RTW documentation management'
    ]
  }
};

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

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId && PRODUCTS[productId as keyof typeof PRODUCTS]) {
      setSelectedProduct(PRODUCTS[productId as keyof typeof PRODUCTS]);
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    if (!selectedProduct || !session?.user) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return null; // Will redirect to signin
  }

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Product Not Found</CardTitle>
            <CardDescription>
              The selected product could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/ai-agents')} className="w-full">
              Browse AI Agents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
          <p className="text-gray-600">You're just one step away from accessing {selectedProduct.name}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  £{selectedProduct.price}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    £{selectedProduct.originalPrice}
                  </span>
                )}
                {selectedProduct.originalPrice && (
                  <Badge className="bg-green-100 text-green-800">
                    Save £{(selectedProduct.originalPrice - selectedProduct.price).toFixed(2)}
                  </Badge>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">What's included:</h4>
                <ul className="space-y-1">
                  {selectedProduct.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Secure payment powered by Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50 text-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">£{selectedProduct.price}</span>
                </div>
                {selectedProduct.originalPrice && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Savings:</span>
                    <span className="font-medium text-green-600">
                      -£{(selectedProduct.originalPrice - selectedProduct.price).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-bold text-blue-600">£{selectedProduct.price}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>• Secure payment processing</p>
                <p>• Instant access after payment</p>
                <p>• 30-day money-back guarantee</p>
                <p>• 24/7 customer support</p>
              </div>
            </CardContent>
            <CardContent>
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay £{selectedProduct.price}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
} 