'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

export default function TestAuthPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <div>
      <h1>Auth Test</h1>
      <p>{session ? 'Authenticated' : 'Not authenticated'}</p>
    </div>
  );
}
