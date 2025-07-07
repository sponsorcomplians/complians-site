import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { hasPermission } from '@/lib/rbac-service';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.tenant_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const daysBack = parseInt(searchParams.get('days') || '30');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeTrends = searchParams.get('trends') === 'true';
    const includeBreachBreakdown = searchParams.get('breachBreakdown') === 'true';

    // Check if user has permission to view analytics
    if (!(await hasPermission('can_view_analytics'))) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view analytics' },
        { status: 403 }
      );
    }

    const tenantId = session.user.tenant_id;

    // Get metrics summary
    const { data: summaryData, error: summaryError } = await supabase
      .rpc('get_tenant_metrics_summary', {
        tenant_uuid: tenantId,
        days_back: daysBack
      });

    if (summaryError) {
      console.error('Error getting metrics summary:', summaryError);
      return NextResponse.json(
        { error: 'Failed to get metrics summary' },
        { status: 500 }
      );
    }

    // Get daily metrics
    const metricsStartDate = startDate || new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const metricsEndDate = endDate || new Date().toISOString().split('T')[0];

    const { data: dailyMetrics, error: metricsError } = await supabase
      .rpc('get_tenant_metrics', {
        tenant_uuid: tenantId,
        start_date: metricsStartDate,
        end_date: metricsEndDate
      });

    if (metricsError) {
      console.error('Error getting daily metrics:', metricsError);
      return NextResponse.json(
        { error: 'Failed to get daily metrics' },
        { status: 500 }
      );
    }

    let complianceTrends = null;
    let breachBreakdown = null;

    // Get compliance trends if requested
    if (includeTrends) {
      const { data: trendsData, error: trendsError } = await supabase
        .rpc('get_compliance_trends', {
          tenant_uuid: tenantId,
          days_back: daysBack
        });

      if (!trendsError) {
        complianceTrends = trendsData;
      }
    }

    // Get breach breakdown if requested
    if (includeBreachBreakdown) {
      const { data: breachData, error: breachError } = await supabase
        .rpc('get_breach_breakdown', {
          tenant_uuid: tenantId,
          days_back: daysBack
        });

      if (!breachError) {
        breachBreakdown = breachData;
      }
    }

    // Get current compliance status counts
    const { data: complianceStatus, error: statusError } = await supabase
      .from('compliance_workers')
      .select('compliance_status')
      .eq('tenant_id', tenantId);

    let complianceStatusCounts = {
      compliant: 0,
      breach: 0,
      serious_breach: 0,
      total: 0
    };

    if (!statusError && complianceStatus) {
      complianceStatusCounts = {
        compliant: complianceStatus.filter(w => w.compliance_status === 'COMPLIANT').length,
        breach: complianceStatus.filter(w => w.compliance_status === 'BREACH').length,
        serious_breach: complianceStatus.filter(w => w.compliance_status === 'SERIOUS_BREACH').length,
        total: complianceStatus.length
      };
    }

    // Get recent activity (last 7 days)
    const { data: recentActivity, error: activityError } = await supabase
      .from('tenant_usage_metrics')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    return NextResponse.json({
      summary: summaryData?.[0] || {},
      dailyMetrics: dailyMetrics || [],
      complianceTrends: complianceTrends || [],
      breachBreakdown: breachBreakdown || [],
      complianceStatus: complianceStatusCounts,
      recentActivity: recentActivity || [],
      dateRange: {
        start: metricsStartDate,
        end: metricsEndDate,
        days: daysBack
      }
    });

  } catch (error) {
    console.error('Tenant metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Admin endpoint to get top performing tenants
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!(await hasPermission('can_manage_tenant_settings'))) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { daysBack = 30, limit = 10 } = await request.json();

    const { data: topTenants, error } = await supabase
      .rpc('get_top_performing_tenants', {
        days_back: daysBack,
        limit_count: limit
      });

    if (error) {
      console.error('Error getting top performing tenants:', error);
      return NextResponse.json(
        { error: 'Failed to get top performing tenants' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      topTenants: topTenants || []
    });

  } catch (error) {
    console.error('Top tenants API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 