'use client';

import { useSession } from 'next-auth/react';

export const dynamic = 'force-dynamic';

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Auth Page</h1>
      {status === 'loading' ? (
        <p>Loading session...</p>
      ) : session ? (
        <div>
          <p>Signed in as: <strong>{session.user?.email}</strong></p>
        </div>
      ) : (
        <p>Not signed in</p>
      )}
    </main>
  );
}
