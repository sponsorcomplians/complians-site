'use client';
export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';

export default function TestAuthPage() {
  const { data: session } = useSession();

  return (
    <div>
      <h1>Auth Test</h1>
      <p>{session ? 'Authenticated' : 'Not authenticated'}</p>
    </div>
  );
}
