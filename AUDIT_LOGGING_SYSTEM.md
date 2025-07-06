# Audit Logging System

## Overview

The audit logging system provides comprehensive tracking of all key actions across the UK immigration compliance platform. It ensures accountability, compliance, and security by maintaining detailed logs of user activities, system changes, and data modifications.

## Database Schema

### audit_logs Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  resource_type TEXT,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Fields

- **id**: Unique identifier for each audit log entry
- **tenant_id**: Multi-tenant isolation - links to tenant
- **user_id**: User who performed the action
- **action**: Type of action performed (e.g., 'worker_created', 'document_uploaded')
- **details**: JSON object containing action-specific details
- **ip_address**: Client IP address for security tracking
- **user_agent**: Browser/client information
- **resource_type**: Type of resource affected (e.g., 'compliance_worker', 'document')
- **resource_id**: ID of the specific resource affected
- **old_values**: Previous state (for updates/deletions)
- **new_values**: New state (for creates/updates)
- **timestamp**: When the action occurred

## Tracked Actions

### Worker Management
- `worker_created` - New worker added to system
- `worker_updated` - Worker information modified
- `worker_deleted` - Worker removed from system

### Document Management
- `document_uploaded` - New document uploaded
- `document_deleted` - Document removed
- `document_accessed` - Document viewed/downloaded

### Assessment & Compliance
- `assessment_run` - Compliance assessment executed
- `narrative_generated` - AI narrative created
- `compliance_report_generated` - Report created

### User Management
- `user_role_assigned` - Role assigned to user
- `user_role_changed` - User role modified
- `user_role_removed` - Role removed from user
- `user_created` - New user account created
- `user_deleted` - User account removed

### Authentication & Security
- `login_success` - Successful login
- `login_failed` - Failed login attempt
- `password_changed` - Password updated
- `password_reset` - Password reset requested

### Billing & Subscription
- `subscription_created` - New subscription
- `subscription_updated` - Subscription modified
- `subscription_canceled` - Subscription canceled
- `payment_succeeded` - Payment successful
- `payment_failed` - Payment failed

### System Settings
- `settings_updated` - System settings changed
- `ai_settings_updated` - AI configuration modified

## Automatic Logging

### Database Triggers

The system uses PostgreSQL triggers to automatically log certain actions:

#### Compliance Workers Trigger
```sql
CREATE TRIGGER audit_compliance_workers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON compliance_workers
  FOR EACH ROW EXECUTE FUNCTION audit_compliance_workers();
```

#### User Roles Trigger
```sql
CREATE TRIGGER audit_user_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_user_roles();
```

### API-Level Logging

Manual audit logging is implemented in API endpoints for actions not covered by triggers:

```typescript
// Example: Logging document upload
await logAuditEvent(
  'document_uploaded',
  {
    document_name: fileName,
    document_type: fileType,
    file_size: fileSize
  },
  'document',
  fileName,
  undefined,
  undefined,
  headersList
);
```

## Security & Privacy

### Row Level Security (RLS)

All audit logs are protected by RLS policies:

```sql
-- Admins can view all audit logs for their tenant
CREATE POLICY "Admins can view all audit logs for their tenant" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.id = auth.uid()
      AND u.tenant_id = audit_logs.tenant_id
      AND ur.role = 'Admin'
    )
  );
```

### Data Retention

- **Default retention**: 365 days
- **Configurable**: 30 days to 10 years
- **Automatic cleanup**: Scheduled job removes old logs
- **Export capability**: Admins can export logs before deletion

### Sensitive Data Handling

- **PII protection**: Personal data is hashed or anonymized
- **Password logging**: Never logged in plain text
- **Financial data**: Only transaction IDs, not amounts
- **IP addresses**: Stored for security but not exposed in UI

## API Endpoints

### GET /api/audit-logs

Fetch audit logs with filtering and pagination.

**Query Parameters:**
- `action` - Filter by action type
- `user_id` - Filter by user ID
- `start_date` - Filter by start date (ISO format)
- `end_date` - Filter by end date (ISO format)
- `limit` - Number of records to return (1-1000)
- `offset` - Pagination offset
- `summary=true` - Return summary instead of logs
- `days=30` - Days for summary (when summary=true)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "user_id": "uuid",
      "action": "worker_created",
      "details": {
        "worker_name": "John Doe",
        "job_title": "Software Engineer"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "resource_type": "compliance_worker",
      "resource_id": "worker-uuid",
      "timestamp": "2024-01-15T10:30:00Z",
      "user_email": "admin@company.com",
      "user_name": "Admin User"
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 150
  }
}
```

### POST /api/audit-logs

Manage audit logs (admin only).

**Actions:**
- `clean_old_logs` - Remove logs older than specified days

**Request:**
```json
{
  "action": "clean_old_logs",
  "days_to_keep": 365
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cleaned 150 old audit logs",
  "deleted_count": 150
}
```

## Service Functions

### Audit Service (`src/lib/audit-service.ts`)

#### Core Functions

```typescript
// Log any audit event
logAuditEvent(action, details, resourceType?, resourceId?, oldValues?, newValues?, headers?)

// Log specific events
logDocumentUpload(documentName, documentType, fileSize, headers?)
logAssessmentRun(assessmentType, workerId, result, headers?)
logNarrativeGeneration(workerName, narrativeLength, headers?)
logLoginSuccess(email, headers?)
logLoginFailure(email, reason, headers?)
logPasswordChange(userId, headers?)
logSettingsUpdate(settingsType, oldValues, newValues, headers?)
logSubscriptionEvent(action, planName, billingCycle, headers?)
logPaymentEvent(action, amount, currency, headers?)

// Retrieve logs
getAuditLogs(filters: AuditLogFilters): Promise<AuditLog[]>
getAuditSummary(days: number): Promise<AuditSummary[]>

// Maintenance
cleanOldAuditLogs(daysToKeep: number): Promise<number>
```

#### Utility Functions

```typescript
// Extract client information
getClientIP(headersList?: Headers): string | null
getUserAgent(headersList?: Headers): string | null
```

## React Components

### AuditLogsDashboard

Comprehensive dashboard for viewing and managing audit logs.

**Features:**
- **Real-time filtering** by action, user, date range
- **Activity summary** with charts and statistics
- **Export functionality** (CSV format)
- **Pagination** for large datasets
- **Admin-only access** with role-based permissions
- **Clean old logs** functionality

**Tabs:**
1. **Audit Logs** - Detailed log entries with filtering
2. **Summary** - Activity overview and statistics

## Database Functions

### PostgreSQL Functions

```sql
-- Log audit event
log_audit_event(tenant_id, user_id, action, details, ip_address, user_agent, resource_type, resource_id, old_values, new_values)

-- Get tenant audit logs with filtering
get_tenant_audit_logs(tenant_id, limit, offset, action_filter, user_id_filter, start_date, end_date)

-- Get audit summary
get_audit_summary(tenant_id, days)

-- Clean old logs
clean_old_audit_logs(days_to_keep)

-- Specific logging functions
log_document_upload(tenant_id, user_id, document_name, document_type, file_size, ip_address, user_agent)
log_assessment_run(tenant_id, user_id, assessment_type, worker_id, result, ip_address, user_agent)
log_narrative_generation(tenant_id, user_id, worker_name, narrative_length, ip_address, user_agent)
```

## Integration Points

### Existing Systems

1. **Multi-tenant Service** - Tenant isolation for all logs
2. **RBAC Service** - Permission checking for log access
3. **Stripe Billing** - Payment and subscription events
4. **Worker Management** - Automatic worker CRUD logging
5. **Narrative Generation** - AI usage tracking
6. **User Management** - Role and permission changes

### API Routes Updated

- `/api/workers` - Worker creation logging
- `/api/generate-narrative` - Narrative generation logging
- `/api/auth/*` - Authentication event logging
- `/api/billing/*` - Billing event logging

## Monitoring & Analytics

### Audit Summary

Monthly summary of activities:
- **Most common actions** - Identify usage patterns
- **User activity levels** - Track user engagement
- **System usage trends** - Monitor platform adoption
- **Security events** - Track failed logins, suspicious activity

### Alerts & Notifications

- **Failed login attempts** - Multiple failures from same IP
- **Unusual activity** - High volume of actions
- **Admin actions** - Critical system changes
- **Data exports** - Large log exports

## Compliance & Legal

### UK Immigration Compliance

- **Sponsor duties** - Track compliance activities
- **Document management** - Audit trail for required documents
- **Worker records** - Complete history of worker management
- **Reporting obligations** - Track required reports

### Data Protection (GDPR)

- **Right to be forgotten** - Log deletion capabilities
- **Data access** - Export user's audit trail
- **Consent tracking** - User consent changes
- **Data retention** - Configurable retention periods

### Security Standards

- **ISO 27001** - Information security management
- **SOC 2** - Security, availability, processing integrity
- **GDPR** - Data protection and privacy
- **UK Data Protection Act** - Local compliance

## Performance Considerations

### Indexing Strategy

```sql
-- Primary indexes for performance
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_tenant_timestamp ON audit_logs(tenant_id, timestamp DESC);
```

### Optimization

- **Partitioning** - By date for large datasets
- **Archiving** - Move old logs to cold storage
- **Compression** - Compress old log data
- **Caching** - Cache frequently accessed summaries

## Deployment & Maintenance

### Database Migration

```bash
# Run audit logs migration
psql -d your_database -f audit-logs-migration.sql
```

### Environment Variables

```env
# No additional environment variables required
# Uses existing Supabase configuration
```

### Monitoring

- **Log volume** - Monitor daily log creation
- **Storage usage** - Track database growth
- **Query performance** - Monitor slow queries
- **Error rates** - Track logging failures

### Backup Strategy

- **Daily backups** - Include audit logs
- **Point-in-time recovery** - Restore to specific timestamp
- **Cross-region replication** - Disaster recovery
- **Encrypted backups** - Secure storage

## Troubleshooting

### Common Issues

1. **High log volume**
   - Implement log rotation
   - Adjust retention periods
   - Use partitioning

2. **Performance issues**
   - Add missing indexes
   - Optimize queries
   - Implement caching

3. **Permission errors**
   - Check RLS policies
   - Verify user roles
   - Review tenant isolation

4. **Missing logs**
   - Check trigger functions
   - Verify API logging
   - Review error handling

### Debug Tools

```typescript
// Check audit logging
const logs = await getAuditLogs({ action: 'worker_created' });
console.log('Recent worker creations:', logs);

// Test audit event
await logAuditEvent('test_action', { test: true });
```

## Future Enhancements

### Planned Features

1. **Real-time alerts** - WebSocket notifications
2. **Advanced analytics** - Machine learning insights
3. **Custom dashboards** - Tenant-specific views
4. **Integration APIs** - Third-party logging
5. **Compliance reporting** - Automated reports
6. **Forensic analysis** - Advanced investigation tools

### Scalability Improvements

1. **Event streaming** - Kafka/RabbitMQ integration
2. **Distributed logging** - Multi-region support
3. **Search optimization** - Elasticsearch integration
4. **Real-time processing** - Stream processing
5. **Auto-scaling** - Cloud-native deployment 