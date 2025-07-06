import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserRole } from '@/lib/rbac-service';

export async function GET(request: NextRequest) {
  try {
    const role = await getCurrentUserRole();
    
    return NextResponse.json({
      role: role || 'Viewer'
    });
  } catch (error) {
    console.error('Error getting current role:', error);
    return NextResponse.json(
      { error: 'Failed to get current role' },
      { status: 500 }
    );
  }
} 