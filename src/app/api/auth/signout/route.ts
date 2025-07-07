// src/app/api/auth/signout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Clear the session cookie
  const response = NextResponse.json({ success: true });
  
  // Clear NextAuth session cookies
  response.cookies.set('next-auth.session-token', '', { maxAge: 0 });
  response.cookies.set('next-auth.csrf-token', '', { maxAge: 0 });
  
  // Also clear secure cookie versions
  response.cookies.set('__Secure-next-auth.session-token', '', { maxAge: 0 });
  response.cookies.set('__Host-next-auth.csrf-token', '', { maxAge: 0 });
  
  return response;
}

export async function GET(request: NextRequest) {
  // Redirect to sign-in page after sign out
  return NextResponse.redirect(new URL('/auth/signin', request.url));
}