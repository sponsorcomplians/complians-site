import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'PDF generation moved to client-side' }, 
    { status: 501 }
  );
} 