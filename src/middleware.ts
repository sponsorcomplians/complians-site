import { NextResponse } from 'next/server'

export function middleware(request: any) {
  // Redirect any auth pages to dashboard
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/master-compliance-dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
} 