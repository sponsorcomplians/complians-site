# Multi-Tenant Data Isolation Implementation

This document outlines the implementation of multi-tenant data isolation in the Complians compliance management system.

## Overview

The system now supports complete data isolation between companies/tenants, ensuring that each organization can only access their own compliance data, workers, assessments, reports, and related information.

## Database Schema Changes

### New Tables and Columns

1. **Users Table Enhancement**
   - Added `tenant_id UUID` column
   - Each company gets a unique `tenant_id`
   - Users from the same company share the same `tenant_id`

2. **Compliance Tables Enhancement**
   - Added `tenant_id UUID` to all compliance tables:
     - `compliance_workers`
     - `compliance_assessments`
     - `compliance_reports`
     - `remediation_actions`
     - `alerts`

### Foreign Key Constraints

All compliance tables now have foreign key constraints linking to the users table via `tenant_id`:

```sql
ALTER TABLE public.compliance_workers 
ADD CONSTRAINT fk_compliance_workers_tenant 
FOREIGN KEY (tenant_id) REFERENCES public.users(tenant_id) ON DELETE CASCADE;
```

## Row Level Security (RLS) Policies

### New Multi-Tenant Policies

All compliance tables now use tenant-based RLS policies instead of user-based ones:

```sql
CREATE POLICY "Tenant users can view their own compliance workers" ON public.compliance_workers
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );
```

### Policy Coverage

- **SELECT**: Users can only view data from their tenant
- **INSERT**: Users can only insert data for their tenant
- **UPDATE**: Users can only update data from their tenant
- **DELETE**: Users can only delete data from their tenant

## Authentication & Session Management

### Session Enhancement

The NextAuth session now includes tenant information:

```typescript
interface Session {
  user: {
    id: string;
    tenant_id: string;
    company: string;
    email: string;
    name: string;
  }
}
```

### JWT Token Enhancement

JWT tokens now include tenant context:

```typescript
interface JWT {
  id?: string;
  tenant_id?: string;
  company?: string;
}
```

## API Layer Changes

### Multi-Tenant Service

Created `src/lib/multi-tenant-service.ts` with helper functions:

- `getTenantContext()`: Get current user's tenant information
- `createTenantQuery()`: Create tenant-filtered Supabase queries
- `getTenantComplianceWorkers()`: Get workers for current tenant
- `createTenantComplianceWorker()`: Create worker for current tenant
- And similar functions for assessments, reports, remediation actions, and alerts

### API Route Updates

All API routes now use the multi-tenant service:

```typescript
// Before
const { data } = await supabase
  .from('compliance_workers')
  .select('*')
  .eq('user_id', session.user.id);

// After
const workers = await getTenantComplianceWorkers();
```

## TypeScript Type Updates

### New Interfaces

Added comprehensive type definitions in `src/types/database.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  company: string;
  phone?: string | null;
  tenant_id: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplianceWorker {
  id: string;
  user_id: string;
  tenant_id: string;
  agent_type: string;
  name: string;
  // ... other fields
}
```

## Migration Process

### Running the Migration

1. **Execute the migration script**:
   ```bash
   psql -d your_database -f multi-tenant-migration.sql
   ```

2. **Verify the migration**:
   ```sql
   -- Check that tenant_id columns exist
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'compliance_workers' 
   AND column_name = 'tenant_id';
   
   -- Check that RLS policies are in place
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename LIKE 'compliance_%';
   ```

### Data Migration

The migration script automatically:

1. Adds `tenant_id` columns to all tables
2. Generates unique `tenant_id` values for each company
3. Updates existing data to use the appropriate `tenant_id`
4. Creates foreign key constraints
5. Updates RLS policies
6. Creates necessary indexes

## Security Benefits

### Data Isolation

- **Complete Separation**: Each company's data is completely isolated
- **No Cross-Tenant Access**: Users cannot access data from other companies
- **Automatic Filtering**: All queries automatically filter by tenant
- **Database-Level Security**: RLS policies enforce isolation at the database level

### Access Control

- **Session-Based**: Tenant context is derived from authenticated session
- **Automatic**: No manual tenant specification required
- **Consistent**: All API endpoints use the same tenant isolation logic

## Usage Examples

### Frontend Components

Components automatically get tenant-filtered data:

```typescript
// In a React component
const { data: workers } = await fetch('/api/workers');
// Workers are automatically filtered for the current tenant
```

### API Development

When creating new API endpoints:

```typescript
import { getTenantComplianceWorkers } from '@/lib/multi-tenant-service';

export async function GET() {
  const workers = await getTenantComplianceWorkers();
  return NextResponse.json({ data: workers });
}
```

### Database Queries

For direct database access:

```typescript
const tenantContext = await getTenantContext();
const { data } = await supabase
  .from('compliance_workers')
  .select('*')
  .eq('tenant_id', tenantContext.tenant_id);
```

## Testing Multi-Tenant Isolation

### Test Scenarios

1. **User Registration**: Verify new users get appropriate `tenant_id`
2. **Data Creation**: Ensure new data is associated with correct tenant
3. **Data Access**: Verify users can only see their tenant's data
4. **Cross-Tenant Access**: Confirm users cannot access other tenants' data

### Test Commands

```sql
-- Test tenant isolation
SELECT 
  u.company,
  u.tenant_id,
  COUNT(cw.id) as worker_count
FROM users u
LEFT JOIN compliance_workers cw ON u.tenant_id = cw.tenant_id
GROUP BY u.company, u.tenant_id;

-- Verify RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename LIKE 'compliance_%';
```

## Monitoring and Maintenance

### Key Metrics

- **Tenant Count**: Number of unique tenants
- **Data Distribution**: Data volume per tenant
- **Access Patterns**: API usage per tenant
- **Performance**: Query performance with tenant filtering

### Maintenance Tasks

1. **Regular Audits**: Verify tenant isolation is working
2. **Performance Monitoring**: Watch for slow queries with tenant filters
3. **Index Maintenance**: Ensure tenant_id indexes are optimized
4. **Policy Reviews**: Regularly review RLS policies

## Troubleshooting

### Common Issues

1. **Missing Tenant Context**: Check if user session includes tenant_id
2. **RLS Policy Errors**: Verify policies are correctly applied
3. **Performance Issues**: Check if tenant_id indexes exist
4. **Data Leakage**: Audit queries to ensure tenant filtering

### Debug Commands

```sql
-- Check current user's tenant
SELECT tenant_id, company FROM users WHERE id = auth.uid();

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'compliance_%';

-- Check policy effectiveness
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM compliance_workers 
WHERE tenant_id = 'some-tenant-id';
```

## Future Enhancements

### Potential Improvements

1. **Tenant Management UI**: Admin interface for tenant management
2. **Tenant Analytics**: Cross-tenant analytics (aggregated)
3. **Tenant Customization**: Per-tenant configuration options
4. **Tenant Migration**: Tools for moving data between tenants

### Scalability Considerations

1. **Database Partitioning**: Partition tables by tenant_id for large datasets
2. **Caching Strategy**: Tenant-aware caching
3. **Connection Pooling**: Tenant-aware connection management
4. **Backup Strategy**: Per-tenant backup options

## Conclusion

The multi-tenant implementation provides robust data isolation while maintaining the existing functionality. All compliance data is now automatically filtered by tenant, ensuring complete separation between companies while preserving the user experience.

The implementation is backward-compatible and requires no changes to existing frontend components, as the tenant filtering happens automatically at the API and database levels. 