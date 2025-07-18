import { NextResponse } from 'next/server';

// Simple endpoint to test authentication configuration
export async function GET() {
  const authStatus = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      DISABLE_AUTH: process.env.DISABLE_AUTH || 'not set',
    },
    apiKeys: {
      hasPublicKey: !!process.env.NEXT_PUBLIC_API_KEY,
      hasSecretKey: !!process.env.API_SECRET_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    },
    recommendations: [] as string[]
  };

  // Add recommendations based on configuration
  if (process.env.DISABLE_AUTH !== 'true' && !process.env.NEXT_PUBLIC_API_KEY && !process.env.API_SECRET_KEY) {
    authStatus.recommendations.push('Set DISABLE_AUTH=true in Vercel environment variables for testing');
    authStatus.recommendations.push('OR set NEXT_PUBLIC_API_KEY and API_SECRET_KEY for production');
  }

  if (!process.env.OPENAI_API_KEY) {
    authStatus.recommendations.push('Set OPENAI_API_KEY in Vercel environment variables');
  }

  return NextResponse.json(authStatus, { status: 200 });
}

export async function POST() {
  // Test POST endpoint to check if 403 is related to CSRF or method issues
  return NextResponse.json({
    message: 'POST request successful',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}