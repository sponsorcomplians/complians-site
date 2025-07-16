import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only return the API key if DISABLE_AUTH is true (for development)
  if (process.env.DISABLE_AUTH !== 'true') {
    return NextResponse.json(
      { error: 'API key access not allowed in production' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    apiKey: process.env.NEXT_PUBLIC_API_KEY || 'test-public-key-123'
  });
} 