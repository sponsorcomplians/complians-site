import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    hasPublicApiKey: !!process.env.NEXT_PUBLIC_API_KEY,
    publicApiKeyLength: process.env.NEXT_PUBLIC_API_KEY?.length || 0,
    publicApiKeyEnd: process.env.NEXT_PUBLIC_API_KEY?.slice(-4) || 'none',
    hasSecretKey: !!process.env.API_SECRET_KEY,
    secretKeyLength: process.env.API_SECRET_KEY?.length || 0,
    disableAuth: process.env.DISABLE_AUTH,
    nodeEnv: process.env.NODE_ENV
  });
} 