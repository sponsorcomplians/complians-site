-- Comprehensive Database Fix Script
-- This script fixes all missing functions, columns, and RLS policies

-- 1. Add missing columns to audit_logs table
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS details JSONB,
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- 2. Add missing tenant_id columns to main tables
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- 3. Create missing functions

-- Rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_current_time TIMESTAMP WITH TIME ZONE,
  p_identifier TEXT,
  p_max_attempts INTEGER,
  p_window_ms BIGINT
) RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count attempts within the time window
  SELECT COUNT(*) INTO attempt_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND created_at >= p_current_time - (p_window_ms || ' milliseconds')::INTERVAL;
  
  -- If under limit, insert new attempt and return true
  IF attempt_count < p_max_attempts THEN
    INSERT INTO rate_limits (identifier, created_at)
    VALUES (p_identifier, p_current_time);
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenant creation function for signup
CREATE OR REPLACE FUNCTION create_tenant_for_signup(
  tenant_name TEXT,
  tenant_industry TEXT,
  tenant_max_workers INTEGER,
  tenant_subscription_plan TEXT
) RETURNS UUID AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Insert new tenant
  INSERT INTO tenants (name, industry, max_workers, subscription_plan, created_at, updated_at)
  VALUES (tenant_name, tenant_industry, tenant_max_workers, tenant_subscription_plan, NOW(), NOW())
  RETURNING id INTO new_tenant_id;
  
  RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative tenant creation function (in case the name varies)
CREATE OR REPLACE FUNCTION create_tenant_during_signup(
  tenant_name TEXT,
  tenant_industry TEXT,
  tenant_max_workers INTEGER,
  tenant_subscription_plan TEXT
) RETURNS UUID AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Insert new tenant
  INSERT INTO tenants (name, industry, max_workers, subscription_plan, created_at, updated_at)
  VALUES (tenant_name, tenant_industry, tenant_max_workers, tenant_subscription_plan, NOW(), NOW())
  RETURNING id INTO new_tenant_id;
  
  RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS on all tables
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for tenant isolation

-- Workers table policies
DROP POLICY IF EXISTS "Users can view workers in their tenant" ON workers;
CREATE POLICY "Users can view workers in their tenant" ON workers
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can insert workers in their tenant" ON workers;
CREATE POLICY "Users can insert workers in their tenant" ON workers
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can update workers in their tenant" ON workers;
CREATE POLICY "Users can update workers in their tenant" ON workers
  FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can delete workers in their tenant" ON workers;
CREATE POLICY "Users can delete workers in their tenant" ON workers
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Assessments table policies
DROP POLICY IF EXISTS "Users can view assessments in their tenant" ON assessments;
CREATE POLICY "Users can view assessments in their tenant" ON assessments
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can insert assessments in their tenant" ON assessments;
CREATE POLICY "Users can insert assessments in their tenant" ON assessments
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can update assessments in their tenant" ON assessments;
CREATE POLICY "Users can update assessments in their tenant" ON assessments
  FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can delete assessments in their tenant" ON assessments;
CREATE POLICY "Users can delete assessments in their tenant" ON assessments
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Reports table policies
DROP POLICY IF EXISTS "Users can view reports in their tenant" ON reports;
CREATE POLICY "Users can view reports in their tenant" ON reports
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can insert reports in their tenant" ON reports;
CREATE POLICY "Users can insert reports in their tenant" ON reports
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can update reports in their tenant" ON reports;
CREATE POLICY "Users can update reports in their tenant" ON reports
  FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can delete reports in their tenant" ON reports;
CREATE POLICY "Users can delete reports in their tenant" ON reports
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON profiles;
CREATE POLICY "Users can view profiles in their tenant" ON profiles
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can insert profiles in their tenant" ON profiles;
CREATE POLICY "Users can insert profiles in their tenant" ON profiles
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can update profiles in their tenant" ON profiles;
CREATE POLICY "Users can update profiles in their tenant" ON profiles
  FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can delete profiles in their tenant" ON profiles;
CREATE POLICY "Users can delete profiles in their tenant" ON profiles
  FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Audit logs table policies
DROP POLICY IF EXISTS "Users can view audit logs in their tenant" ON audit_logs;
CREATE POLICY "Users can view audit logs in their tenant" ON audit_logs
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

DROP POLICY IF EXISTS "Users can insert audit logs in their tenant" ON audit_logs;
CREATE POLICY "Users can insert audit logs in their tenant" ON audit_logs
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workers_tenant_id ON workers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reports_tenant_id ON reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION create_tenant_for_signup TO authenticated;
GRANT EXECUTE ON FUNCTION create_tenant_during_signup TO authenticated;

-- 8. Create rate_limits table if it doesn't exist
CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(identifier, created_at)
);

-- 9. Create indexes for rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_created_at ON rate_limits(identifier, created_at);

-- 10. Grant permissions on rate_limits table
GRANT SELECT, INSERT ON rate_limits TO authenticated;

-- 11. Update existing records to have tenant_id (if any exist)
-- This is a safety measure in case there are existing records
UPDATE workers SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
UPDATE assessments SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
UPDATE reports SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
UPDATE profiles SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
UPDATE audit_logs SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;

-- 12. Make tenant_id NOT NULL after setting default values
ALTER TABLE workers ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE assessments ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE reports ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN tenant_id SET NOT NULL;

-- 13. Create function to set current tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_uuid::TEXT, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_tenant_context TO authenticated;

-- 14. Create function to get current tenant context
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_current_tenant_id TO authenticated;

-- 15. Create trigger to automatically set tenant_id on insert
CREATE OR REPLACE FUNCTION set_tenant_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := get_current_tenant_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for each table
DROP TRIGGER IF EXISTS set_tenant_id_workers ON workers;
CREATE TRIGGER set_tenant_id_workers
  BEFORE INSERT ON workers
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_on_insert();

DROP TRIGGER IF EXISTS set_tenant_id_assessments ON assessments;
CREATE TRIGGER set_tenant_id_assessments
  BEFORE INSERT ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_on_insert();

DROP TRIGGER IF EXISTS set_tenant_id_reports ON reports;
CREATE TRIGGER set_tenant_id_reports
  BEFORE INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_on_insert();

DROP TRIGGER IF EXISTS set_tenant_id_profiles ON profiles;
CREATE TRIGGER set_tenant_id_profiles
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_on_insert();

DROP TRIGGER IF EXISTS set_tenant_id_audit_logs ON audit_logs;
CREATE TRIGGER set_tenant_id_audit_logs
  BEFORE INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_tenant_id_on_insert();

-- 16. Create function to clean up old rate limit entries
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS VOID AS $$
BEGIN
  DELETE FROM rate_limits 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Create a scheduled job to clean up old rate limits (if using pg_cron)
-- SELECT cron.schedule('cleanup-rate-limits', '0 2 * * *', 'SELECT cleanup_old_rate_limits();');

-- 18. Create function to get tenant statistics
CREATE OR REPLACE FUNCTION get_tenant_stats(tenant_uuid UUID)
RETURNS TABLE(
  total_workers INTEGER,
  total_assessments INTEGER,
  total_reports INTEGER,
  total_audit_logs INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM workers WHERE tenant_id = tenant_uuid),
    (SELECT COUNT(*) FROM assessments WHERE tenant_id = tenant_uuid),
    (SELECT COUNT(*) FROM reports WHERE tenant_id = tenant_uuid),
    (SELECT COUNT(*) FROM audit_logs WHERE tenant_id = tenant_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_tenant_stats TO authenticated;

-- 19. Create function to validate tenant access
CREATE OR REPLACE FUNCTION validate_tenant_access(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM tenants 
    WHERE id = tenant_uuid 
    AND id = get_current_tenant_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION validate_tenant_access TO authenticated;

-- 20. Final verification queries
-- These will help verify the setup is working correctly
-- SELECT 'Workers table' as table_name, COUNT(*) as total_records FROM workers
-- UNION ALL
-- SELECT 'Assessments table', COUNT(*) FROM assessments
-- UNION ALL
-- SELECT 'Reports table', COUNT(*) FROM reports
-- UNION ALL
-- SELECT 'Profiles table', COUNT(*) FROM profiles
-- UNION ALL
-- SELECT 'Audit logs table', COUNT(*) FROM audit_logs;

-- SELECT 'Functions created successfully' as status; 