'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

// TODO: RE-ENABLE AUTH
// Temporarily bypass AuthProvider for development. Always render children directly.
export function AuthProvider({ children }: AuthProviderProps) {
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
    return <>{children}</>;
  }
  return <SessionProvider>{children}</SessionProvider>;
}

