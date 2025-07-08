'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface SessionWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// TODO: RE-ENABLE AUTH
// Temporarily bypass SessionWrapper for development. Always render children directly.
export default function SessionWrapper({ children, fallback }: SessionWrapperProps) {
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
    return <>{children}</>;
  }

  const { status } = useSession();

  if (status === 'loading') {
    return fallback || (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // if (!session) { /* block or redirect logic */ } // TEMPORARILY DISABLED FOR DEV

  return <>{children}</>;
} 