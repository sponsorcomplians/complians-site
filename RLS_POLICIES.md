# Row Level Security (RLS) Policies for Multi-Tenant System

This document details the Row Level Security policies implemented to ensure complete data isolation between tenants in the Complians compliance management system.

## Overview

Row Level Security (RLS) policies are database-level security mechanisms that automatically filter data based on the current user's context. In our multi-tenant system, RLS ensures that users can only access data belonging to their tenant (company).

## Policy Structure

### Base Policy Pattern

All policies follow this pattern:
```sql
CREATE POLICY "policy_name" ON table_name
  FOR operation USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );
```

### Policy Operations

Each table has four policies covering all CRUD operations:
- **SELECT**: Read access
- **INSERT**: Create access  
- **UPDATE**: Modify access
- **DELETE**: Remove access

## Table-Specific Policies

### 1. Compliance Workers (`compliance_workers`)

```sql
-- View workers from current tenant
CREATE POLICY "Tenant users can view their own compliance workers" ON public.compliance_workers
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Create workers for current tenant
CREATE POLICY "Tenant users can insert their own compliance workers" ON public.compliance_workers
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Update workers from current tenant
CREATE POLICY "Tenant users can update their own compliance workers" ON public.compliance_workers
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Delete workers from current tenant
CREATE POLICY "Tenant users can delete their own compliance workers" ON public.compliance_workers
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );
```

### 2. Compliance Assessments (`compliance_assessments`)

```sql
-- View assessments from current tenant
CREATE POLICY "Tenant users can view their own compliance assessments" ON public.compliance_assessments
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Create assessments for current tenant
CREATE POLICY "Tenant users can insert their own compliance assessments" ON public.compliance_assessments
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Update assessments from current tenant
CREATE POLICY "Tenant users can update their own compliance assessments" ON public.compliance_assessments
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Delete assessments from current tenant
CREATE POLICY "Tenant users can delete their own compliance assessments" ON public.compliance_assessments
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );
```

### 3. Compliance Reports (`compliance_reports`)

```sql
-- View reports from current tenant
CREATE POLICY "Tenant users can view their own compliance reports" ON public.compliance_reports
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Create reports for current tenant
CREATE POLICY "Tenant users can insert their own compliance reports" ON public.compliance_reports
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Update reports from current tenant
CREATE POLICY "Tenant users can update their own compliance reports" ON public.compliance_reports
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Delete reports from current tenant
CREATE POLICY "Tenant users can delete their own compliance reports" ON public.compliance_reports
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );
```

### 4. Remediation Actions (`remediation_actions`)

```sql
-- View remediation actions from current tenant
CREATE POLICY "Tenant users can view their own remediation actions" ON public.remediation_actions
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Create remediation actions for current tenant
CREATE POLICY "Tenant users can insert their own remediation actions" ON public.remediation_actions
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Update remediation actions from current tenant
CREATE POLICY "Tenant users can update their own remediation actions" ON public.remediation_actions
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Delete remediation actions from current tenant
CREATE POLICY "Tenant users can delete their own remediation actions" ON public.remediation_actions
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );
```

### 5. Alerts (`alerts`)

```sql
-- View alerts from current tenant
CREATE POLICY "Tenant users can view their own alerts" ON public.alerts
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Create alerts for current tenant
CREATE POLICY "Tenant users can insert their own alerts" ON public.alerts
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Update alerts from current tenant
CREATE POLICY "Tenant users can update their own alerts" ON public.alerts
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Delete alerts from current tenant
CREATE POLICY "Tenant users can delete their own alerts" ON public.alerts
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );
```

## Legacy Policies (Removed)

### Old User-Based Policies

The following policies were removed and replaced with tenant-based ones:

```sql
-- OLD (Removed)
CREATE POLICY "Users can view their own compliance workers" ON public.compliance_workers
  FOR SELECT USING (auth.uid() = user_id);

-- NEW (Current)
CREATE POLICY "Tenant users can view their own compliance workers" ON public.compliance_workers
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );
```

## Policy Enforcement

### How RLS Works

1. **Automatic Filtering**: Every query is automatically filtered by tenant
2. **Transparent to Application**: No code changes needed in application layer
3. **Database-Level Security**: Policies enforced at PostgreSQL level
4. **Performance Optimized**: Uses indexes on `tenant_id` columns

### Policy Evaluation

```sql
-- Example: When a user queries compliance_workers
SELECT * FROM compliance_workers;

-- RLS automatically transforms this to:
SELECT * FROM compliance_workers 
WHERE tenant_id = (
  SELECT tenant_id FROM public.users WHERE id = auth.uid()
);
```

## Security Considerations

### Policy Verification

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'compliance_%';

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename LIKE 'compliance_%'
ORDER BY tablename, cmd;

-- Test policy effectiveness
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM compliance_workers;
```

### Security Testing

```sql
-- Test as different users
SET LOCAL ROLE TO 'authenticated';
SET LOCAL "request.jwt.claim.sub" TO 'user-id-1';
SELECT COUNT(*) FROM compliance_workers;

SET LOCAL "request.jwt.claim.sub" TO 'user-id-2';
SELECT COUNT(*) FROM compliance_workers;
```

## Performance Optimization

### Indexes

Essential indexes for RLS performance:

```sql
-- Primary tenant_id indexes
CREATE INDEX idx_compliance_workers_tenant_id ON public.compliance_workers(tenant_id);
CREATE INDEX idx_compliance_assessments_tenant_id ON public.compliance_assessments(tenant_id);
CREATE INDEX idx_compliance_reports_tenant_id ON public.compliance_reports(tenant_id);
CREATE INDEX idx_remediation_actions_tenant_id ON public.remediation_actions(tenant_id);
CREATE INDEX idx_alerts_tenant_id ON public.alerts(tenant_id);

-- Composite indexes for common queries
CREATE INDEX idx_compliance_workers_tenant_agent ON public.compliance_workers(tenant_id, agent_type);
CREATE INDEX idx_compliance_assessments_tenant_agent ON public.compliance_assessments(tenant_id, agent_type);
```

### Query Optimization

```sql
-- Efficient tenant queries
SELECT * FROM compliance_workers 
WHERE tenant_id = 'tenant-uuid' 
AND agent_type = 'ai-salary-compliance'
ORDER BY created_at DESC;

-- Avoid inefficient queries
-- DON'T: SELECT * FROM compliance_workers WHERE user_id = auth.uid();
-- DO: Let RLS handle tenant filtering automatically
```

## Troubleshooting

### Common Issues

1. **Policy Not Applied**
   ```sql
   -- Check if RLS is enabled
   SELECT rowsecurity FROM pg_tables WHERE tablename = 'compliance_workers';
   
   -- Re-enable if needed
   ALTER TABLE public.compliance_workers ENABLE ROW LEVEL SECURITY;
   ```

2. **Missing Tenant Context**
   ```sql
   -- Check if user has tenant_id
   SELECT id, email, tenant_id FROM users WHERE id = auth.uid();
   
   -- Update if missing
   UPDATE users SET tenant_id = gen_random_uuid() WHERE tenant_id IS NULL;
   ```

3. **Performance Issues**
   ```sql
   -- Check if indexes exist
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'compliance_workers' 
   AND indexname LIKE '%tenant%';
   
   -- Create missing indexes
   CREATE INDEX IF NOT EXISTS idx_compliance_workers_tenant_id 
   ON public.compliance_workers(tenant_id);
   ```

### Debug Commands

```sql
-- Enable policy logging
SET log_statement = 'all';
SET log_min_messages = 'info';

-- Test specific policy
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) 
SELECT * FROM compliance_workers 
WHERE agent_type = 'ai-salary-compliance';

-- Check policy execution
SELECT * FROM pg_stat_user_tables 
WHERE schemaname = 'public' 
AND relname LIKE 'compliance_%';
```

## Maintenance

### Regular Audits

```sql
-- Monthly policy audit
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'compliance_%'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Check for orphaned data
SELECT 
  'compliance_workers' as table_name,
  COUNT(*) as orphaned_count
FROM compliance_workers cw
LEFT JOIN users u ON cw.tenant_id = u.tenant_id
WHERE u.tenant_id IS NULL

UNION ALL

SELECT 
  'compliance_assessments' as table_name,
  COUNT(*) as orphaned_count
FROM compliance_assessments ca
LEFT JOIN users u ON ca.tenant_id = u.tenant_id
WHERE u.tenant_id IS NULL;
```

### Policy Updates

When adding new tables:

1. Add `tenant_id` column
2. Create foreign key constraint
3. Enable RLS
4. Create four policies (SELECT, INSERT, UPDATE, DELETE)
5. Create indexes
6. Test thoroughly

## Conclusion

The RLS policies provide robust, database-level security that ensures complete data isolation between tenants. The policies are:

- **Automatic**: No application code changes required
- **Secure**: Enforced at the database level
- **Performant**: Optimized with proper indexes
- **Maintainable**: Clear, consistent patterns
- **Auditable**: Easy to verify and monitor

This implementation ensures that each company's data remains completely isolated while maintaining optimal performance and security. 