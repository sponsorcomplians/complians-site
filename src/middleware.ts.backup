// src/middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const pathname = req.nextUrl.pathname
        
        // Define protected routes
        const protectedRoutes = ['/dashboard', '/profile', '/workers', '/reports']
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
        
        // Allow if not a protected route or if authenticated
        return !isProtectedRoute || !!token
      }
    },
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}