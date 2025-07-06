// src/app/auth/verify-email/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Mail, Loader2, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      setStatus('verifying');
      verifyEmail();
    } else if (email) {
      setStatus('pending');
      setMessage('Please check your email for a verification link.');
    } else {
      setStatus('error');
      setMessage('No verification token or email provided');
    }
  }, [token, email]);

  const verifyEmail = async () => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification');
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent successfully! Please check your inbox.');
      } else {
        setMessage(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setMessage('An error occurred while resending the verification email');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'pending':
        return (
          <>
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-gray-600">
                We've sent a verification link to <strong>{email}</strong>
              </p>
            </div>
            
            <Alert className="border-blue-200 bg-blue-50 text-blue-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please check your email and click the verification link to activate your account.
              </AlertDescription>
            </Alert>

            <div className="mt-6 space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Didn't receive the email? Check your spam folder or try resending.
              </p>
              
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </Button>
            </div>
          </>
        );

      case 'verifying':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying your email...
            </h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Email verified!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to sign in...</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verification failed
            </h2>
            <Alert className="border-red-200 bg-red-50 text-red-800 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">
          Email Verification
        </CardTitle>
        <CardDescription className="text-center">
          {status === 'pending' && 'Complete your account setup'}
          {status === 'verifying' && 'Verifying your email address'}
          {status === 'success' && 'Your account is now active'}
          {status === 'error' && 'We couldn\'t verify your email address'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {getStatusContent()}
      </CardContent>
      
      <CardFooter>
        {status === 'error' && (
          <div className="w-full space-y-2">
            <Link href="/auth/signup" className="block">
              <Button variant="outline" className="w-full">
                Try signing up again
              </Button>
            </Link>
            <Link href="/auth/signin" className="block">
              <Button className="w-full">
                Go to sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
        
        {status === 'success' && (
          <div className="w-full">
            <Link href="/auth/signin" className="block">
              <Button className="w-full">
                Go to sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
              <p className="mt-2 text-gray-600">Loading verification...</p>
            </div>
          </CardContent>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}