// src/app/auth/signin/callback/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// TODO: RE-ENABLE AUTH
// Temporarily bypass all session and auth checks for development
const session = {
  user: {
    email: 'dev@example.com',
    name: 'Dev User',
    company: 'Dev Company',
    tenant_id: 'dev-tenant-id',
    role: 'Admin',
  },
  is_email_verified: true,
};
const status = 'authenticated';

export default function CallbackPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Processing...</h2>
        <p className="text-gray-600">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}