// src/app/api/check-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
    NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL || 'not set',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    actualUrl: process.env.NEXTAUTH_URL,
  });
}