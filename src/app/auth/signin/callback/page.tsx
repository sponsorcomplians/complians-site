// src/app/auth/signin/callback/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ClientOnly from '@/components/ClientOnly';

export default function CallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect to dashboard or home after successful authentication
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      // Redirect to signin if not authenticated
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Handle loading state
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Processing...</h2>
          <p className="text-gray-600">Please wait while we complete your sign in.</p>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Processing...</h2>
          <p className="text-gray-600">Please wait while we complete your sign in.</p>
        </div>
      </div>
    </ClientOnly>
  );
}