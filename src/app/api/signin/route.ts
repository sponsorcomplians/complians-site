// src/app/api/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Redirect to the NextAuth signin page
  return NextResponse.redirect(new URL('/api/auth/signin', request.url));
}