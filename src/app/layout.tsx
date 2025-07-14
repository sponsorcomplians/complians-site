// At the very top of the root layout, before any imports
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args) {
    if (args[0]?.toString?.().includes('Objects are not valid')) {
      console.log('🔴 FOUND IT! Object being rendered:');
      // Log the entire error with stack trace
      console.log(args);
      // Get the current React fiber
      const fiber = (window as any)._lastRenderedFiber;
      if (fiber) {
        console.log('Component:', fiber.elementType?.name);
        console.log('Props:', fiber.memoizedProps);
      }
      debugger; // PAUSE HERE
    }
    return originalError.apply(this, args);
  };
}

import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import { MobileLayout } from '@/components/MobileLayout'

export const metadata = {
  title: 'UK Sponsor Compliance System',
  description: 'HR SaaS for Sponsor Licence Compliance',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ComplianceAI',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0070f3',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true' && typeof window !== 'undefined') {
    console.warn('⚠️ AUTHENTICATION DISABLED - DEVELOPMENT ONLY ⚠️');
  }

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ServiceWorkerRegistration />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}