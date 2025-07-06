import { NextRequest, NextResponse } from 'next/server';
import { 
  getTenantUsersWithRoles, 
  assignUserRole, 
  removeUserRole,
  UserRoleType 
} from '@/lib/rbac-service';

export async function GET(request: NextRequest) {
  try {
    const users = await getTenantUsersWithRoles();
    
    return NextResponse.json({
      users
    });
  } catch (error) {
    console.error('Error getting tenant users:', error);
    return NextResponse.json(
      { error: 'Failed to get tenant users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json();
    
    if (!userId || !role || !['Admin', 'Manager', 'Auditor', 'Viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid user ID or role' },
        { status: 400 }
      );
    }
    
    await assignUserRole(userId, role as UserRoleType);
    
    return NextResponse.json({
      success: true,
      message: 'Role assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    await removeUserRole(userId);
    
    return NextResponse.json({
      success: true,
      message: 'Role removed successfully'
    });
  } catch (error) {
    console.error('Error removing role:', error);
    return NextResponse.json(
      { error: 'Failed to remove role' },
      { status: 500 }
    );
  }
} 