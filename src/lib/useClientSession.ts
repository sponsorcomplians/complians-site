'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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