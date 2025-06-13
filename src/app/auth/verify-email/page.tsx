// src/app/auth/verify-email/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    setStatus('verifying');
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?verified=true');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed. The link may be expired.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification.');
    }
  };

  const resendVerification = async () => {
    if (!email) return;

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.error || 'Failed to send verification email.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'pending' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Verify your email
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We've sent a verification email to
              </p>
              <p className="font-medium text-gray-900">{email}</p>
              <p className="mt-4 text-sm text-gray-600">
                Please check your inbox and click the verification link to activate your account.
              </p>
              
              <div className="mt-8 space-y-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the email?
                </p>
                <button
                  onClick={resendVerification}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Resend verification email
                </button>
              </div>
            </>
          )}

          {status === 'verifying' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Verifying your email...
              </h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Email verified!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Redirecting to sign in...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Verification failed
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              
              <div className="mt-8 space-y-4">
                <button
                  onClick={resendVerification}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Resend verification email
                </button>
                <p className="text-sm text-gray-600">
                  or
                </p>
                <Link
                  href="/auth/signin"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Go to sign in
                </Link>
              </div>
            </>
          )}
        </div>

        {message && status === 'pending' && (
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-800">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}