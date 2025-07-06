import { NextRequest, NextResponse } from 'next/server';
import { hasRole, UserRoleType } from '@/lib/rbac-service';

export async function POST(request: NextRequest) {
  try {
    const { minimumRole } = await request.json();
    
    if (!minimumRole || !['Admin', 'Manager', 'Auditor', 'Viewer'].includes(minimumRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    const hasRoleResult = await hasRole(minimumRole as UserRoleType);
    
    return NextResponse.json({
      hasRole: hasRoleResult
    });
  } catch (error) {
    console.error('Error checking role:', error);
    return NextResponse.json(
      { error: 'Failed to check role' },
      { status: 500 }
    );
  }
} 