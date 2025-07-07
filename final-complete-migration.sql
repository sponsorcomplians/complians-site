-- FINAL COMPLETE DATABASE MIGRATION
-- This script fixes all schema issues and creates missing tables
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FIX: Update create_tenant_during_signup function to use correct column names
CREATE OR REPLACE FUNCTION public.create_tenant_during_signup(
  tenant_industry text,
  tenant_max_workers int,
  tenant_name text,
  tenant_subscription_plan text
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  new_tenant_id uuid;
BEGIN
  -- Insert tenant and return the created tenant data
  INSERT INTO tenants (name, industry, max_workers, subscription_plan, created_at, updated_at)
  VALUES (tenant_name, tenant_industry, tenant_max_workers, tenant_subscription_plan, NOW(), NOW())
  RETURNING id INTO new_tenant_id;
  
  -- Return the created tenant information
  RETURN json_build_object(
    'success', true,
    'id', new_tenant_id,
    'name', tenant_name,
    'industry', tenant_industry,
    'max_workers', tenant_max_workers,
    'subscription_plan', tenant_subscription_plan
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return error information
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- 2. CREATE: Missing user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager', 'Auditor', 'Viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- 3. CREATE: SW002 table for compliance forms
CREATE TABLE IF NOT EXISTS public.sw002 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  section_1 JSONB,
  section_2 JSONB,
  section_3 JSONB,
  section_4 JSONB,
  section_5 JSONB,
  compliance_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ENSURE: Users table has all required columns
DO $$ 
BEGIN
  -- Add missing columns to users table if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
    ALTER TABLE users ADD COLUMN password_hash TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company') THEN
    ALTER TABLE users ADD COLUMN company TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE users ADD COLUMN phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'Viewer';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verification_token') THEN
    ALTER TABLE users ADD COLUMN email_verification_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verification_expires') THEN
    ALTER TABLE users ADD COLUMN email_verification_expires TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_reset_token') THEN
    ALTER TABLE users ADD COLUMN password_reset_token TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_reset_expires') THEN
    ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'login_attempts') THEN
    ALTER TABLE users ADD COLUMN login_attempts INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'locked_until') THEN
    ALTER TABLE users ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
    ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- 5. ENSURE: Tenants table has all required columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'is_active') THEN
    ALTER TABLE tenants ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 6. ENSURE: Workers table has all required columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'compliance_status') THEN
    ALTER TABLE workers ADD COLUMN compliance_status TEXT DEFAULT 'PENDING';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'compliance_score') THEN
    ALTER TABLE workers ADD COLUMN compliance_score INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'last_compliance_check') THEN
    ALTER TABLE workers ADD COLUMN last_compliance_check TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'visa_status') THEN
    ALTER TABLE workers ADD COLUMN visa_status TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'visa_expiry') THEN
    ALTER TABLE workers ADD COLUMN visa_expiry DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'is_active') THEN
    ALTER TABLE workers ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'role') THEN
    ALTER TABLE workers ADD COLUMN role TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'department') THEN
    ALTER TABLE workers ADD COLUMN department TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'start_date') THEN
    ALTER TABLE workers ADD COLUMN start_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'cos_number') THEN
    ALTER TABLE workers ADD COLUMN cos_number TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'passport_expiry') THEN
    ALTER TABLE workers ADD COLUMN passport_expiry DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'salary') THEN
    ALTER TABLE workers ADD COLUMN salary DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'address') THEN
    ALTER TABLE workers ADD COLUMN address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workers' AND column_name = 'created_by') THEN
    ALTER TABLE workers ADD COLUMN created_by UUID REFERENCES users(id);
  END IF;
END $$;

-- 7. CREATE: Missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON users(password_hash);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

CREATE INDEX IF NOT EXISTS idx_sw002_worker_id ON sw002(worker_id);
CREATE INDEX IF NOT EXISTS idx_sw002_tenant_id ON sw002(tenant_id);

CREATE INDEX IF NOT EXISTS idx_workers_tenant_id ON workers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workers_compliance_status ON workers(compliance_status);
CREATE INDEX IF NOT EXISTS idx_workers_created_by ON workers(created_by);

CREATE INDEX IF NOT EXISTS idx_tenants_name ON tenants(name);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);

-- 8. ENABLE: Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sw002 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 9. CREATE: RLS Policies for tenant isolation

-- Users policies
DROP POLICY IF EXISTS "Users can view own tenant users" ON users;
CREATE POLICY "Users can view own tenant users" ON users
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own tenant users" ON users;
CREATE POLICY "Users can insert own tenant users" ON users
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own tenant users" ON users;
CREATE POLICY "Users can update own tenant users" ON users
  FOR UPDATE USING (tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

-- User roles policies
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid() OR tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;
CREATE POLICY "Users can insert own roles" ON user_roles
  FOR INSERT WITH CHECK (user_id = auth.uid() OR tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

-- SW002 policies
DROP POLICY IF EXISTS "Users can view own tenant sw002" ON sw002;
CREATE POLICY "Users can view own tenant sw002" ON sw002
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own tenant sw002" ON sw002;
CREATE POLICY "Users can insert own tenant sw002" ON sw002
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own tenant sw002" ON sw002;
CREATE POLICY "Users can update own tenant sw002" ON sw002
  FOR UPDATE USING (tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

-- Tenants policies
DROP POLICY IF EXISTS "Users can view own tenant" ON tenants;
CREATE POLICY "Users can view own tenant" ON tenants
  FOR SELECT USING (id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert tenants" ON tenants;
CREATE POLICY "Users can insert tenants" ON tenants
  FOR INSERT WITH CHECK (true);

-- Workers policies
DROP POLICY IF EXISTS "Users can view own tenant workers" ON workers;
CREATE POLICY "Users can view own tenant workers" ON workers
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own tenant workers" ON workers;
CREATE POLICY "Users can insert own tenant workers" ON workers
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own tenant workers" ON workers;
CREATE POLICY "Users can update own tenant workers" ON workers
  FOR UPDATE USING (tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete own tenant workers" ON workers;
CREATE POLICY "Users can delete own tenant workers" ON workers
  FOR DELETE USING (tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

-- Audit logs policies
DROP POLICY IF EXISTS "Users can view own tenant audit logs" ON audit_logs;
CREATE POLICY "Users can view own tenant audit logs" ON audit_logs
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM user_roles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert audit logs" ON audit_logs;
CREATE POLICY "Users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- 10. CREATE: Functions for SW002 operations
CREATE OR REPLACE FUNCTION get_sw002_data(p_worker_id UUID)
RETURNS TABLE (
  id UUID,
  worker_id UUID,
  tenant_id UUID,
  section_1 JSONB,
  section_2 JSONB,
  section_3 JSONB,
  section_4 JSONB,
  section_5 JSONB,
  compliance_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.worker_id,
    s.tenant_id,
    s.section_1,
    s.section_2,
    s.section_3,
    s.section_4,
    s.section_5,
    s.compliance_notes,
    s.created_at,
    s.updated_at
  FROM sw002 s
  WHERE s.worker_id = p_worker_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_sw002_record(p_worker_id UUID)
RETURNS UUID AS $$
DECLARE
  new_record_id UUID;
  worker_tenant_id UUID;
BEGIN
  -- Get worker's tenant_id
  SELECT tenant_id INTO worker_tenant_id
  FROM workers
  WHERE id = p_worker_id;
  
  -- Create new SW002 record
  INSERT INTO sw002 (worker_id, tenant_id, section_1, section_2, section_3, section_4, section_5)
  VALUES (p_worker_id, worker_tenant_id, '{}', '{}', '{}', '{}', '{}')
  RETURNING id INTO new_record_id;
  
  RETURN new_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. CREATE: Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. CREATE: Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at 
  BEFORE UPDATE ON user_roles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sw002_updated_at ON sw002;
CREATE TRIGGER update_sw002_updated_at 
  BEFORE UPDATE ON sw002 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at 
  BEFORE UPDATE ON tenants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workers_updated_at ON workers;
CREATE TRIGGER update_workers_updated_at 
  BEFORE UPDATE ON workers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. GRANT: Permissions
GRANT EXECUTE ON FUNCTION public.create_tenant_during_signup TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sw002_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_sw002_record TO authenticated;

-- 14. COMMENTS: Documentation
COMMENT ON TABLE public.users IS 'User accounts with tenant-based access control';
COMMENT ON TABLE public.user_roles IS 'User role assignments within tenants';
COMMENT ON TABLE public.sw002 IS 'SW002 compliance forms for workers';
COMMENT ON TABLE public.tenants IS 'Multi-tenant organizations';
COMMENT ON TABLE public.workers IS 'Worker records with compliance tracking';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for all system actions';

COMMENT ON FUNCTION public.create_tenant_during_signup IS 'Creates a new tenant during user signup process. Bypasses RLS for tenant creation.';
COMMENT ON FUNCTION public.get_sw002_data IS 'Retrieves SW002 form data for a specific worker';
COMMENT ON FUNCTION public.create_sw002_record IS 'Creates a new SW002 record for a worker';

-- Migration completed successfully
SELECT 'FINAL COMPLETE MIGRATION SUCCESSFULLY APPLIED' as status; 