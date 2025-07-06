import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-config';
import {
  TenantUsageMetrics,
  TenantMetricsSummary,
  ComplianceTrends,
  BreachBreakdown,
  TopPerformingTenant
} from '@/types/database';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Increment a specific metric for the current tenant
 */
export async function incrementTenantMetric(
  metricColumn: 'documents_uploaded' | 'assessments_run' | 'narratives_generated' | 
                'compliance_reports_generated' | 'workers_added' | 'alerts_created' | 
                'remediation_actions_created',
  incrementValue: number = 1
): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenant_id) {
      throw new Error('No tenant context');
    }

    const { error } = await supabase
      .rpc('increment_tenant_metric', {
        tenant_uuid: session.user.tenant_id,
        metric_column: metricColumn,
        increment_value: incrementValue
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error incrementing tenant metric:', error);
    throw error;
  }
}

/**
 * Get tenant metrics summary for a date range
 */
export async function getTenantMetricsSummary(daysBack: number = 30): Promise<TenantMetricsSummary | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenant_id) {
      throw new Error('No tenant context');
    }

    const { data, error } = await supabase
      .rpc('get_tenant_metrics_summary', {
        tenant_uuid: session.user.tenant_id,
        days_back: daysBack
      });

    if (error) {
      throw error;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error getting tenant metrics summary:', error);
    throw error;
  }
}

/**
 * Get daily metrics for a date range
 */
export async function getTenantDailyMetrics(
  startDate: string,
  endDate: string
): Promise<TenantUsageMetrics[]> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenant_id) {
      throw new Error('No tenant context');
    }

    const { data, error } = await supabase
      .rpc('get_tenant_metrics', {
        tenant_uuid: session.user.tenant_id,
        start_date: startDate,
        end_date: endDate
      });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting daily metrics:', error);
    throw error;
  }
}

/**
 * Get compliance trends for a date range
 */
export async function getComplianceTrends(daysBack: number = 30): Promise<ComplianceTrends[]> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenant_id) {
      throw new Error('No tenant context');
    }

    const { data, error } = await supabase
      .rpc('get_compliance_trends', {
        tenant_uuid: session.user.tenant_id,
        days_back: daysBack
      });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting compliance trends:', error);
    throw error;
  }
}

/**
 * Get breach breakdown by type
 */
export async function getBreachBreakdown(daysBack: number = 30): Promise<BreachBreakdown[]> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenant_id) {
      throw new Error('No tenant context');
    }

    const { data, error } = await supabase
      .rpc('get_breach_breakdown', {
        tenant_uuid: session.user.tenant_id,
        days_back: daysBack
      });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting breach breakdown:', error);
    throw error;
  }
}

/**
 * Get current compliance status counts
 */
export async function getComplianceStatusCounts(): Promise<{
  compliant: number;
  breach: number;
  serious_breach: number;
  total: number;
}> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenant_id) {
      throw new Error('No tenant context');
    }

    const { data, error } = await supabase
      .from('compliance_workers')
      .select('compliance_status')
      .eq('tenant_id', session.user.tenant_id);

    if (error) {
      throw error;
    }

    const counts = {
      compliant: 0,
      breach: 0,
      serious_breach: 0,
      total: 0
    };

    if (data) {
      counts.compliant = data.filter(w => w.compliance_status === 'COMPLIANT').length;
      counts.breach = data.filter(w => w.compliance_status === 'BREACH').length;
      counts.serious_breach = data.filter(w => w.compliance_status === 'SERIOUS_BREACH').length;
      counts.total = data.length;
    }

    return counts;
  } catch (error) {
    console.error('Error getting compliance status counts:', error);
    throw error;
  }
}

/**
 * Get recent activity metrics
 */
export async function getRecentActivityMetrics(daysBack: number = 7): Promise<TenantUsageMetrics[]> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenant_id) {
      throw new Error('No tenant context');
    }

    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tenant_usage_metrics')
      .select('*')
      .eq('tenant_id', session.user.tenant_id)
      .gte('date', startDate)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting recent activity:', error);
    throw error;
  }
}

/**
 * Get top performing tenants (admin only)
 */
export async function getTopPerformingTenants(
  daysBack: number = 30,
  limit: number = 10
): Promise<TopPerformingTenant[]> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new Error('No session context');
    }

    const { data, error } = await supabase
      .rpc('get_top_performing_tenants', {
        days_back: daysBack,
        limit_count: limit
      });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting top performing tenants:', error);
    throw error;
  }
}

/**
 * Track document upload
 */
export async function trackDocumentUpload(): Promise<void> {
  await incrementTenantMetric('documents_uploaded');
}

/**
 * Track assessment run
 */
export async function trackAssessmentRun(): Promise<void> {
  await incrementTenantMetric('assessments_run');
}

/**
 * Track narrative generation
 */
export async function trackNarrativeGeneration(): Promise<void> {
  await incrementTenantMetric('narratives_generated');
}

/**
 * Track compliance report generation
 */
export async function trackComplianceReportGeneration(): Promise<void> {
  await incrementTenantMetric('compliance_reports_generated');
}

/**
 * Track worker addition
 */
export async function trackWorkerAddition(): Promise<void> {
  await incrementTenantMetric('workers_added');
}

/**
 * Track alert creation
 */
export async function trackAlertCreation(): Promise<void> {
  await incrementTenantMetric('alerts_created');
}

/**
 * Track remediation action creation
 */
export async function trackRemediationActionCreation(): Promise<void> {
  await incrementTenantMetric('remediation_actions_created');
}

/**
 * Get comprehensive analytics data for a tenant
 */
export async function getTenantAnalyticsData(daysBack: number = 30): Promise<{
  summary: TenantMetricsSummary | null;
  dailyMetrics: TenantUsageMetrics[];
  complianceTrends: ComplianceTrends[];
  breachBreakdown: BreachBreakdown[];
  complianceStatus: {
    compliant: number;
    breach: number;
    serious_breach: number;
    total: number;
  };
  recentActivity: TenantUsageMetrics[];
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
}> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenant_id) {
      throw new Error('No tenant context');
    }

    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    const [
      summary,
      dailyMetrics,
      complianceTrends,
      breachBreakdown,
      complianceStatus,
      recentActivity
    ] = await Promise.all([
      getTenantMetricsSummary(daysBack),
      getTenantDailyMetrics(startDate, endDate),
      getComplianceTrends(daysBack),
      getBreachBreakdown(daysBack),
      getComplianceStatusCounts(),
      getRecentActivityMetrics(7)
    ]);

    return {
      summary,
      dailyMetrics,
      complianceTrends,
      breachBreakdown,
      complianceStatus,
      recentActivity,
      dateRange: {
        start: startDate,
        end: endDate,
        days: daysBack
      }
    };
  } catch (error) {
    console.error('Error getting tenant analytics data:', error);
    throw error;
  }
} 