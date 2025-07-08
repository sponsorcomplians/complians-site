'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// TODO: RE-ENABLE AUTH
// Temporarily bypass useClientSession for development. Always return a dummy session object.
export default function useClientSession() {
  return {
    user: {
      email: 'dev@example.com',
      name: 'Dev User',
      company: 'Dev Company',
      tenant_id: 'dev-tenant-id',
      role: 'Admin',
    },
    is_email_verified: true,
  };
}

export function useClientSession() {
  const [mounted, setMounted] = useState(false);
  const session = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null during SSR and before mounting
  if (!mounted) {
    return {
      data: null,
      status: 'loading' as const,
      mounted: false,
    };
  }

  return {
    ...session,
    mounted: true,
  };
} 