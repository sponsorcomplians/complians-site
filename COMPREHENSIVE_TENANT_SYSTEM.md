# Comprehensive Multi-Tenant System Documentation

## Overview

This document describes the comprehensive multi-tenant system implemented for the Complians compliance platform. The system provides complete data isolation between companies (tenants) while maintaining security, performance, and scalability.

## Architecture

### Core Components

1. **Tenants Table**: Central table managing all tenant information
2. **Tenant Isolation**: Row Level Security (RLS) policies enforcing data separation
3. **Multi-Tenant Service**: TypeScript service for tenant-aware operations
4. **Audit Logging**: Comprehensive audit trail for all operations
5. **Automatic Tenant Assignment**: Triggers and functions for seamless tenant management

## Database Schema

### Tenants Table
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  max_workers INTEGER DEFAULT 100,
  subscription_plan TEXT DEFAULT 'Basic',
  settings JSONB DEFAULT '{}',
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Multi-Tenant Tables
All compliance-related tables include a `tenant_id` column:

- `users` - User accounts with tenant association
- `compliance_workers` - Worker compliance data
- `compliance_assessments` - Assessment results
- `compliance_reports` - Generated reports
- `remediation_actions` - Remediation tracking
- `alerts` - System alerts and notifications
- `documents` - Document management
- `training_records` - Training compliance
- `notes` - Notes and comments
- `audit_logs` - Audit trail
- `workers` - Worker profiles (if exists)

## Row Level Security (RLS) Policies

### Policy Structure
All tables have comprehensive RLS policies that:
1. Filter data by `tenant_id`
2. Allow users to only access their tenant's data
3. Automatically assign `tenant_id` on insert
4. Provide admin access for system operations

### Example Policy
```sql
CREATE POLICY "Tenant users can view their compliance workers" ON compliance_workers
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );
```

## Multi-Tenant Service

### Core Functions

#### Tenant Context Management
```typescript
// Get current user's tenant context
const tenantContext = await getTenantContext();

// Get full tenant information
const tenant = await getCurrentTenant();
```

#### Data Retrieval
```typescript
// Get tenant-specific data
const workers = await getTenantComplianceWorkers();
const assessments = await getTenantComplianceAssessments();
const reports = await getTenantComplianceReports();
const documents = await getTenantDocuments();
const training = await getTenantTrainingRecords();
const notes = await getTenantNotes();
```

#### Data Creation
```typescript
// Create tenant-specific records
const worker = await createTenantComplianceWorker(workerData);
const assessment = await createTenantComplianceAssessment(assessmentData);
const document = await createTenantDocument(documentData);
const note = await createTenantNote(noteData);
```

#### Statistics and Monitoring
```typescript
// Get tenant statistics
const stats = await getTenantStats();

// Get audit logs
const auditLogs = await getTenantAuditLogs(100);

// Check permissions
const hasPermission = await checkTenantPermission(resourceTenantId);
```

## User Authentication Flow

### Signup Process
1. User provides email, password, full name, and company
2. System checks if tenant (company) already exists
3. If tenant exists, assigns user to existing tenant
4. If tenant doesn't exist, creates new tenant
5. Creates user account with `tenant_id` association
6. Returns user and tenant information

### Session Management
- NextAuth session includes `tenant_id` and `company`
- All API routes use tenant context for data filtering
- RLS policies enforce tenant isolation at database level

## API Routes

### Updated Routes
All API routes now use the multi-tenant service:

```typescript
// Example: Workers API
export async function GET() {
  try {
    const workers = await getTenantComplianceWorkers();
    return NextResponse.json(workers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### New Routes
- `/api/tenants` - Tenant management (admin only)
- `/api/documents` - Document management
- `/api/training` - Training records
- `/api/notes` - Notes management
- `/api/audit-logs` - Audit trail access

## Database Functions

### Helper Functions
```sql
-- Get current user's tenant ID
SELECT get_current_user_tenant_id();

-- Get current user's tenant information
SELECT * FROM get_current_user_tenant();
```

### Triggers
- Automatic `tenant_id` assignment on insert
- Audit logging for all operations
- Updated timestamp management

## Security Features

### Data Isolation
- Complete tenant separation at database level
- RLS policies prevent cross-tenant data access
- API-level tenant filtering as additional security layer

### Audit Trail
- All CRUD operations logged
- User action tracking
- IP address and user agent logging
- Tenant-specific audit logs

### Permission System
- Role-based access control
- Tenant-specific permissions
- Admin override capabilities

## Performance Optimizations

### Indexes
```sql
-- Tenant-specific indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_compliance_workers_tenant_id ON compliance_workers(tenant_id);

-- Composite indexes for common queries
CREATE INDEX idx_compliance_workers_tenant_agent ON compliance_workers(tenant_id, agent_type);
```

### Query Optimization
- Tenant filtering at database level
- Efficient composite indexes
- Optimized RLS policies

## Migration Process

### Step 1: Run Migration Script
```bash
# Execute the comprehensive migration
psql -d your_database -f comprehensive-tenant-migration.sql
```

### Step 2: Verify Migration
```sql
-- Check tenant creation
SELECT * FROM tenants;

-- Verify data migration
SELECT COUNT(*) FROM users WHERE tenant_id IS NOT NULL;
SELECT COUNT(*) FROM compliance_workers WHERE tenant_id IS NOT NULL;
```

### Step 3: Test Tenant Isolation
```sql
-- Test as different users
-- Verify data separation
```

## Monitoring and Maintenance

### Health Checks
```sql
-- Check tenant statistics
SELECT 
  t.name,
  COUNT(u.id) as user_count,
  COUNT(cw.id) as worker_count
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
LEFT JOIN compliance_workers cw ON t.id = cw.tenant_id
GROUP BY t.id, t.name;
```

### Audit Monitoring
```sql
-- Monitor audit logs
SELECT 
  tenant_id,
  action,
  COUNT(*) as action_count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY tenant_id, action
ORDER BY action_count DESC;
```

## Troubleshooting

### Common Issues

#### 1. Missing Tenant Context
**Error**: "No tenant context available"
**Solution**: Ensure user has valid session with tenant_id

#### 2. RLS Policy Violations
**Error**: "new row violates row-level security policy"
**Solution**: Check tenant_id assignment and RLS policies

#### 3. Performance Issues
**Symptoms**: Slow queries
**Solution**: Verify indexes are created and RLS policies are optimized

### Debug Queries
```sql
-- Check user tenant association
SELECT u.email, u.tenant_id, t.name as tenant_name
FROM users u
JOIN tenants t ON u.tenant_id = t.id
WHERE u.id = auth.uid();

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename LIKE '%compliance%';
```

## Best Practices

### Development
1. Always use multi-tenant service functions
2. Test with multiple tenants
3. Verify RLS policies work correctly
4. Use audit logging for debugging

### Production
1. Monitor tenant statistics regularly
2. Review audit logs for anomalies
3. Optimize queries for large tenants
4. Implement tenant-specific rate limiting

### Security
1. Never bypass tenant filtering
2. Validate tenant permissions
3. Log all admin operations
4. Regular security audits

## Future Enhancements

### Planned Features
1. **Tenant Analytics**: Advanced reporting per tenant
2. **Custom Branding**: Tenant-specific UI customization
3. **API Rate Limiting**: Per-tenant rate limits
4. **Data Export**: Tenant-specific data export
5. **Backup/Restore**: Per-tenant backup capabilities

### Scalability Considerations
1. **Sharding**: Database sharding for large tenants
2. **Caching**: Tenant-specific caching strategies
3. **CDN**: Tenant-specific content delivery
4. **Microservices**: Tenant-aware service architecture

## Conclusion

The comprehensive multi-tenant system provides:
- Complete data isolation between companies
- Scalable architecture for growth
- Comprehensive audit trail
- Security at multiple levels
- Performance optimization
- Easy maintenance and monitoring

This system ensures that each company's data remains completely separate while providing a unified platform experience. 