'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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

  // if (!session) { /* block or redirect logic */ } // TEMPORARILY DISABLED FOR DEV

  return (
    <div>
      <h1>Auth Test</h1>
      <p>{session ? 'Authenticated' : 'Not authenticated'}</p>
    </div>
  );
}
