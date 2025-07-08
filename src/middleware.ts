import { withAuth } from "next-auth/middleware"
import { NextResponse, NextRequest } from "next/server"

// === TEMPORARY BYPASS FOR DEVELOPMENT ===
// This will allow access to all pages without authentication.
// Remove or comment this block to restore auth protection.
export default function middleware(req: NextRequest) {
  return NextResponse.next();
}

// --- Original middleware below (commented out) ---
/*
export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname
    
    // Define protected routes that require authentication
    const protectedRoutes = [
      '/dashboard',
      '/master-compliance-dashboard',
      '/workers',
      '/reports',
      '/profile',
      '/analytics',
      '/billing',
      '/audit-logs',
      '/admin'
    ]
    
    // Define AI agent routes that require payment
    const aiAgentRoutes = [
      '/ai-qualification-compliance',
      '/ai-salary-compliance',
      '/ai-right-to-work-compliance',
      '/ai-skills-experience-compliance',
      '/ai-document-compliance',
      '/ai-record-keeping-compliance',
      '/ai-recruitment-practices-compliance',
      '/ai-reporting-duties-compliance',
      '/ai-genuine-vacancies-compliance',
      '/ai-third-party-labour-compliance',
      '/ai-migrant-contact-maintenance-compliance',
      '/ai-migrant-tracking-compliance',
      '/ai-immigration-status-monitoring-compliance',
      '/ai-paragraph-c7-26-compliance',
      '/ai-contracted-hours-compliance'
    ]
    
    // Check if current route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAiAgentRoute = aiAgentRoutes.some(route => pathname.startsWith(route))
    
    // If it's an AI agent route, redirect to checkout if not authenticated
    if (isAiAgentRoute && !req.nextauth.token) {
      const signupUrl = new URL('/auth/signup', req.url)
      signupUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(signupUrl)
    }
    
    // For other protected routes, just check authentication
    if (isProtectedRoute && !req.nextauth.token) {
      const signinUrl = new URL('/auth/signin', req.url)
      signinUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(signinUrl)
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Allow all requests to pass through, we'll handle redirects in the middleware function
        return true
      }
    },
  }
)
*/

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|auth|checkout|success|cancel).*)',
  ],
} 