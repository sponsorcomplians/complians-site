import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getAuditLogs, getAuditSummary } from '@/lib/audit-service';
import { hasPermission } from '@/lib/rbac-service';
import { AuditLogFilters } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.tenant_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin permission
    if (!(await hasPermission('can_manage_tenant_settings'))) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view audit logs' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters: AuditLogFilters = {
      action: searchParams.get('action') || undefined,
      user_id: searchParams.get('user_id') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };

    // Validate limit and offset
    if (filters.limit && (filters.limit < 1 || filters.limit > 1000)) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 1000' },
        { status: 400 }
      );
    }

    if (filters.offset && filters.offset < 0) {
      return NextResponse.json(
        { error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    // Check if summary is requested
    const summary = searchParams.get('summary');
    if (summary === 'true') {
      const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30;
      const auditSummary = await getAuditSummary(undefined, days);
      
      return NextResponse.json({
        success: true,
        data: auditSummary
      });
    }

    // Get audit logs
    const auditLogs = await getAuditLogs(filters);

    return NextResponse.json({
      success: true,
      data: auditLogs.logs,
      pagination: {
        limit: filters.limit || 100,
        offset: filters.offset || 0,
        total: auditLogs.total
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.tenant_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin permission
    if (!(await hasPermission('can_manage_tenant_settings'))) {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage audit logs' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, days_to_keep } = body;

    if (action === 'clean_old_logs') {
      const daysToKeep = days_to_keep || 365;
      
      if (daysToKeep < 30 || daysToKeep > 3650) {
        return NextResponse.json(
          { error: 'Days to keep must be between 30 and 3650' },
          { status: 400 }
        );
      }

      // Import the clean function
      const { cleanupOldAuditLogs } = await import('@/lib/audit-service');
      const result = await cleanupOldAuditLogs(daysToKeep);

      return NextResponse.json({
        success: true,
        message: `Cleaned ${result.deleted} old audit logs`,
        deleted_count: result.deleted
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error managing audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to manage audit logs' },
      { status: 500 }
    );
  }
} 