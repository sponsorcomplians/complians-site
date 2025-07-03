'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ClientOnly from '@/components/ClientOnly';

export default function TestAuthPage() {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading') {
    return (
      <div>
        <h1>Auth Test</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ClientOnly fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <div>
        <h1>Auth Test</h1>
        <p>{session ? 'Authenticated' : 'Not authenticated'}</p>
      </div>
    </ClientOnly>
  );
}
