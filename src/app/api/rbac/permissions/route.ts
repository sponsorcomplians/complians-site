import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserPermissions } from '@/lib/rbac-service';

export async function GET(request: NextRequest) {
  try {
    const permissions = await getCurrentUserPermissions();
    
    if (!permissions) {
      return NextResponse.json(
        { error: 'No permissions found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      permissions
    });
  } catch (error) {
    console.error('Error getting permissions:', error);
    return NextResponse.json(
      { error: 'Failed to get permissions' },
      { status: 500 }
    );
  }
} 