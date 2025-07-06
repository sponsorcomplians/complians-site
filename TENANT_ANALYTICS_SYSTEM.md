# Tenant Analytics System

## Overview

The Tenant Analytics System provides comprehensive usage metrics and compliance analytics for multi-tenant organizations. It tracks various activities and provides insights through dashboards and reports.

## Database Schema

### tenant_usage_metrics Table

```sql
CREATE TABLE tenant_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  date DATE NOT NULL,
  documents_uploaded INTEGER DEFAULT 0,
  assessments_run INTEGER DEFAULT 0,
  narratives_generated INTEGER DEFAULT 0,
  compliance_reports_generated INTEGER DEFAULT 0,
  workers_added INTEGER DEFAULT 0,
  alerts_created INTEGER DEFAULT 0,
  remediation_actions_created INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, date)
);
```

### Key Features

- **Multi-tenant isolation**: Each tenant only sees their own metrics
- **Daily aggregation**: Metrics are tracked per day for trend analysis
- **Automatic tracking**: Triggers automatically increment metrics on relevant actions
- **Comprehensive coverage**: Tracks all major compliance activities

## Database Functions

### 1. increment_tenant_metric()
Increments a specific metric for a tenant on the current date.

```sql
increment_tenant_metric(tenant_uuid, metric_column, increment_value)
```

### 2. get_tenant_metrics_summary()
Returns aggregated metrics for a date range.

```sql
get_tenant_metrics_summary(tenant_uuid, days_back)
```

### 3. get_tenant_metrics()
Returns daily metrics for a date range with zero-filling for missing dates.

```sql
get_tenant_metrics(tenant_uuid, start_date, end_date)
```

### 4. get_compliance_trends()
Returns compliance status trends over time.

```sql
get_compliance_trends(tenant_uuid, days_back)
```

### 5. get_breach_breakdown()
Returns breach analysis by type.

```sql
get_breach_breakdown(tenant_uuid, days_back)
```

### 6. get_top_performing_tenants()
Returns top performing tenants (admin only).

```sql
get_top_performing_tenants(days_back, limit_count)
```

## API Endpoints

### GET /api/tenant-metrics

Returns comprehensive analytics data for the current tenant.

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 30)
- `startDate` (optional): Custom start date (YYYY-MM-DD)
- `endDate` (optional): Custom end date (YYYY-MM-DD)
- `trends` (optional): Include compliance trends (true/false)
- `breachBreakdown` (optional): Include breach breakdown (true/false)

**Response:**
```json
{
  "summary": {
    "total_documents_uploaded": 150,
    "total_assessments_run": 75,
    "total_narratives_generated": 45,
    "total_compliance_reports_generated": 12,
    "total_workers_added": 25,
    "total_alerts_created": 8,
    "total_remediation_actions_created": 15,
    "avg_daily_documents": 5.0,
    "avg_daily_assessments": 2.5,
    "avg_daily_narratives": 1.5,
    "avg_daily_reports": 0.4
  },
  "dailyMetrics": [...],
  "complianceTrends": [...],
  "breachBreakdown": [...],
  "complianceStatus": {
    "compliant": 85,
    "breach": 12,
    "serious_breach": 3,
    "total": 100
  },
  "recentActivity": [...],
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31",
    "days": 30
  }
}
```

### POST /api/tenant-metrics

Returns top performing tenants (admin only).

**Request Body:**
```json
{
  "daysBack": 30,
  "limit": 10
}
```

**Response:**
```json
{
  "topTenants": [
    {
      "tenant_id": "uuid",
      "company_name": "Company A",
      "total_assessments": 150,
      "total_reports": 25,
      "avg_compliance_score": 92.5,
      "total_workers": 50
    }
  ]
}
```

## TypeScript Types

### TenantUsageMetrics
```typescript
interface TenantUsageMetrics {
  id: string;
  tenant_id: string;
  date: string;
  documents_uploaded: number;
  assessments_run: number;
  narratives_generated: number;
  compliance_reports_generated: number;
  workers_added: number;
  alerts_created: number;
  remediation_actions_created: number;
  created_at: string;
  updated_at: string;
}
```

### TenantMetricsSummary
```typescript
interface TenantMetricsSummary {
  total_documents_uploaded: number;
  total_assessments_run: number;
  total_narratives_generated: number;
  total_compliance_reports_generated: number;
  total_workers_added: number;
  total_alerts_created: number;
  total_remediation_actions_created: number;
  avg_daily_documents: number;
  avg_daily_assessments: number;
  avg_daily_narratives: number;
  avg_daily_reports: number;
}
```

### ComplianceTrends
```typescript
interface ComplianceTrends {
  date: string;
  compliant_count: number;
  breach_count: number;
  serious_breach_count: number;
  total_workers: number;
}
```

### BreachBreakdown
```typescript
interface BreachBreakdown {
  breach_type: string;
  breach_count: number;
  serious_breach_count: number;
  total_count: number;
}
```

## Service Functions

### Tenant Metrics Service

The `tenant-metrics-service.ts` provides helper functions for tracking and retrieving metrics:

#### Tracking Functions
- `trackDocumentUpload()`: Track document uploads
- `trackAssessmentRun()`: Track assessment runs
- `trackNarrativeGeneration()`: Track narrative generation
- `trackComplianceReportGeneration()`: Track report generation
- `trackWorkerAddition()`: Track worker additions
- `trackAlertCreation()`: Track alert creation
- `trackRemediationActionCreation()`: Track remediation actions

#### Retrieval Functions
- `getTenantMetricsSummary()`: Get aggregated metrics
- `getTenantDailyMetrics()`: Get daily metrics
- `getComplianceTrends()`: Get compliance trends
- `getBreachBreakdown()`: Get breach analysis
- `getComplianceStatusCounts()`: Get current compliance status
- `getRecentActivityMetrics()`: Get recent activity
- `getTopPerformingTenants()`: Get top tenants (admin)

## React Components

### TenantAnalyticsDashboard

A comprehensive dashboard component that displays:

1. **Key Metrics Cards**
   - Total assessments run
   - Reports generated
   - Workers added
   - Compliance rate

2. **Usage Trends Chart**
   - Daily activity visualization
   - Interactive charts

3. **Compliance Status Breakdown**
   - Compliant vs breach counts
   - Risk level indicators

4. **Activity Summary**
   - Documents uploaded
   - Narratives generated
   - Alerts created
   - Remediation actions

5. **Compliance Trends**
   - Historical compliance data
   - Trend visualization

6. **Breach Analysis**
   - Breakdown by breach type
   - Serious vs regular breaches

7. **Recent Activity**
   - Last 7 days activity
   - Daily summaries

### Features
- **Role-based access**: Only users with `can_view_analytics` permission can access
- **Time range selection**: 7, 30, or 90 days
- **Data export**: CSV export functionality
- **Real-time refresh**: Manual refresh capability
- **Responsive design**: Works on mobile and desktop

## Usage Examples

### Tracking Metrics in API Routes

```typescript
import { trackAssessmentRun } from '@/lib/tenant-metrics-service';

export async function POST(request: NextRequest) {
  // ... existing logic ...
  
  // Track the assessment run
  await trackAssessmentRun();
  
  // ... rest of logic ...
}
```

### Using Analytics in Components

```typescript
import { getTenantAnalyticsData } from '@/lib/tenant-metrics-service';

const analyticsData = await getTenantAnalyticsData(30);
console.log('Compliance rate:', analyticsData.complianceStatus);
```

### Accessing Analytics Dashboard

```typescript
import { CanViewAnalytics } from '@/components/RoleBasedAccess';

<CanViewAnalytics>
  <Link href="/analytics">View Analytics</Link>
</CanViewAnalytics>
```

## Security & Permissions

### Row Level Security (RLS)

The `tenant_usage_metrics` table has RLS enabled with policies:

1. **Select Policy**: Users can only view their own tenant's metrics
2. **Insert Policy**: System can insert metrics (for triggers)
3. **Update Policy**: System can update metrics

### Role-Based Access

- **Admin**: Full access to all analytics
- **Manager**: Full access to tenant analytics
- **Auditor**: View access to tenant analytics
- **Viewer**: No access to analytics

### Permission Check

```typescript
import { hasPermission } from '@/lib/rbac-service';

if (!(await hasPermission('can_view_analytics'))) {
  return NextResponse.json(
    { error: 'Insufficient permissions' },
    { status: 403 }
  );
}
```

## Automatic Tracking

The system automatically tracks metrics through database triggers:

1. **Worker Addition**: Triggered on `compliance_workers` insert
2. **Assessment Run**: Triggered on `compliance_assessments` insert
3. **Report Generation**: Triggered on `compliance_reports` insert
4. **Alert Creation**: Triggered on `alerts` insert
5. **Remediation Action**: Triggered on `remediation_actions` insert

## Performance Considerations

1. **Indexing**: Proper indexes on `tenant_id` and `date` columns
2. **Aggregation**: Summary functions for efficient data retrieval
3. **Caching**: Consider implementing Redis caching for frequently accessed data
4. **Partitioning**: For large datasets, consider table partitioning by date

## Monitoring & Maintenance

### Regular Tasks
1. **Data Cleanup**: Archive old metrics data
2. **Performance Monitoring**: Monitor query performance
3. **Storage Monitoring**: Track table growth
4. **Backup Verification**: Ensure metrics data is backed up

### Troubleshooting

1. **Missing Metrics**: Check if triggers are enabled
2. **Permission Errors**: Verify RLS policies
3. **Performance Issues**: Check indexes and query optimization
4. **Data Inconsistencies**: Validate trigger logic

## Future Enhancements

1. **Real-time Analytics**: WebSocket updates for live data
2. **Advanced Visualizations**: More chart types and interactive features
3. **Predictive Analytics**: ML-based trend prediction
4. **Custom Dashboards**: User-configurable dashboard layouts
5. **Export Formats**: PDF reports, Excel exports
6. **Alerting**: Automated alerts based on metrics thresholds
7. **Benchmarking**: Compare performance against industry standards 