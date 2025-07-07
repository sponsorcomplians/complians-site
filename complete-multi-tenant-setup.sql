-- Complete Multi-Tenant Setup with RLS Policies
-- Run this in Supabase SQL Editor to fix all multi-tenant issues

-- Step 1: Check current table structures
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('workers', 'assessments', 'reports', 'profiles', 'audit_logs')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Step 2: Create tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  industry TEXT DEFAULT 'General',
  subscription_plan TEXT DEFAULT 'basic',
  max_workers INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add tenant_id to all main tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Step 4: Create audit_logs table with details column
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can access their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Users can access their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can access their own workers" ON public.workers;
DROP POLICY IF EXISTS "Users can access their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can access their own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can access their own audit logs" ON public.audit_logs;

-- Step 7: Create RLS policies for multi-tenant isolation

-- Tenants policy - users can only see their own tenant
CREATE POLICY "Users can access their own tenant" ON public.tenants
FOR ALL USING (
  id IN (
    SELECT tenant_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Profiles policy - users can only see profiles in their tenant
CREATE POLICY "Users can access their own profile" ON public.profiles
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Workers policy - users can only access workers in their tenant
CREATE POLICY "Users can access their own workers" ON public.workers
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Assessments policy - users can only access assessments in their tenant
CREATE POLICY "Users can access their own assessments" ON public.assessments
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Reports policy - users can only access reports in their tenant
CREATE POLICY "Users can access their own reports" ON public.reports
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Audit logs policy - users can only access audit logs in their tenant
CREATE POLICY "Users can access their own audit logs" ON public.audit_logs
FOR ALL USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Step 8: Create missing database functions

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.check_rate_limit(timestamp with time zone, text, integer, bigint);
DROP FUNCTION IF EXISTS public.create_tenant_for_signup(text, text, integer, text);
DROP FUNCTION IF EXISTS public.create_tenant_during_signup(text, text, integer, text);

-- Create check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_current_time timestamp with time zone,
  p_identifier text,
  p_max_attempts integer,
  p_window_ms bigint
) RETURNS boolean AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- Count attempts within the time window
  SELECT COUNT(*) INTO attempt_count
  FROM public.audit_logs
  WHERE action = 'rate_limit_check'
    AND resource_type = p_identifier
    AND created_at >= p_current_time - (p_window_ms || ' milliseconds')::interval;
  
  -- Return true if under limit, false if over limit
  RETURN attempt_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create create_tenant_for_signup function
CREATE OR REPLACE FUNCTION public.create_tenant_for_signup(
  tenant_name text,
  tenant_industry text DEFAULT 'General',
  tenant_max_workers integer DEFAULT 100,
  tenant_subscription_plan text DEFAULT 'basic'
) RETURNS uuid AS $$
DECLARE
  new_tenant_id uuid;
BEGIN
  -- Insert new tenant
  INSERT INTO public.tenants (name, industry, max_workers, subscription_plan)
  VALUES (tenant_name, tenant_industry, tenant_max_workers, tenant_subscription_plan)
  RETURNING id INTO new_tenant_id;
  
  RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create create_tenant_during_signup function (alias)
CREATE OR REPLACE FUNCTION public.create_tenant_during_signup(
  tenant_name text,
  tenant_industry text DEFAULT 'General',
  tenant_max_workers integer DEFAULT 100,
  tenant_subscription_plan text DEFAULT 'basic'
) RETURNS uuid AS $$
BEGIN
  RETURN public.create_tenant_for_signup(tenant_name, tenant_industry, tenant_max_workers, tenant_subscription_plan);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workers_tenant_id ON public.workers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON public.assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reports_tenant_id ON public.reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Step 10: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.tenants TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.workers TO authenticated;
GRANT ALL ON public.assessments TO authenticated;
GRANT ALL ON public.reports TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;

-- Step 11: Verify setup
SELECT 'Database setup completed successfully' as status; 