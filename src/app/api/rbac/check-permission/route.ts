import { NextRequest, NextResponse } from 'next/server';
import { hasPermission, RolePermissions } from '@/lib/rbac-service';

export async function POST(request: NextRequest) {
  try {
    const { permission } = await request.json();
    
    if (!permission || !(permission in {
      can_manage_users: true,
      can_manage_workers: true,
      can_manage_assessments: true,
      can_create_reports: true,
      can_view_audit_logs: true,
      can_export_data: true,
      can_manage_tenant_settings: true,
      can_view_dashboards: true,
      can_view_analytics: true,
    })) {
      return NextResponse.json(
        { error: 'Invalid permission' },
        { status: 400 }
      );
    }
    
    const hasPermissionResult = await hasPermission(permission as keyof RolePermissions);
    
    return NextResponse.json({
      hasPermission: hasPermissionResult
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    return NextResponse.json(
      { error: 'Failed to check permission' },
      { status: 500 }
    );
  }
} 