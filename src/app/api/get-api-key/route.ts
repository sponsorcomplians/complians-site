import { NextResponse } from 'next/server';

export async function GET() {
  // In production, if DISABLE_AUTH is true, allow test key usage
  if (process.env.DISABLE_AUTH === 'true') {
    return NextResponse.json({
      apiKey: process.env.NEXT_PUBLIC_API_KEY || 'test-public-key-123'
    });
  }
  
  // In production without DISABLE_AUTH, return the configured public key if available
  if (process.env.NEXT_PUBLIC_API_KEY) {
    return NextResponse.json({
      apiKey: process.env.NEXT_PUBLIC_API_KEY
    });
  }
  
  // If no configuration is available, return an error but with helpful information
  return NextResponse.json(
    { 
      error: 'API key not configured',
      message: 'Please set DISABLE_AUTH=true or configure NEXT_PUBLIC_API_KEY in environment variables',
      helpUrl: '/api/check-config'
    },
    { status: 403 }
  );
} 