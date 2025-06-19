'use client';
import { useSession } from 'next-auth/react';

export default function TestAuthPage() {
  const { data: session } = useSession();

  return (
    <div>
      <h1>Test Auth Page</h1>
      <p>Session user: {session?.user?.email || 'No session'}</p>
    </div>
  );
}

import { useSession, signIn, signOut } from 'next-auth/react'

export default function TestAuthPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading session...</div>
  }

  if (session) {
    return (
      <div>
        <h1>Welcome, {session.user?.name || session.user?.email}!</h1>
        <p>You are signed in.</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    )
  }

  return (
    <div>
      <h1>You are not signed in.</h1>
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  )
}
