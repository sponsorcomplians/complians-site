'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentGateProps {
  children: React.ReactNode;
  productId?: string;
  productName?: string;
  fallback?: React.ReactNode;
  requirePayment?: boolean;
}

export default function PaymentGate({ 
  children, 
  productId, 
  productName = 'this product',
  fallback,
  requirePayment = true 
}: PaymentGateProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (status === 'loading') return;

      if (!session?.user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      if (!requirePayment) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      if (!productId) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/purchases/product-access`);
        
        if (!response.ok) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        const data = await response.json();
        const hasPurchased = data.access?.some((purchase: any) => 
          purchase.product_id === productId && purchase.status === 'completed'
        );

        setHasAccess(hasPurchased);
      } catch (error) {
        console.error('Error checking product access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [session, status, productId, requirePayment]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking your access...</p>
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access {productName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push('/auth/signup')}
              className="w-full"
            >
              Sign Up
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/auth/signin')}
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requirePayment && productId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Payment Required</CardTitle>
            <CardDescription>
              Purchase access to {productName} to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push(`/checkout?productId=${productId}`)}
              className="w-full"
            >
              Purchase Access
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return fallback ? <>{fallback}</> : null;
} 