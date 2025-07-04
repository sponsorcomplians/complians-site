import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, workerName } = await req.json();
    
    // For now, return success (add Resend later)
    console.log('Email request:', { to, subject, workerName });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email functionality not configured. Use mailto link instead.' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 