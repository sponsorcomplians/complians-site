-- Add tenant_id to all main tables for multi-tenant isolation
-- Run this in Supabase SQL Editor

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

-- Step 3: Add tenant_id to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Step 4: Add tenant_id to workers table
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Step 5: Add tenant_id to assessments table
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Step 6: Add tenant_id to reports table
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Step 7: Create audit_logs table with details column if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Create check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_current_time TIMESTAMP WITH TIME ZONE,
  p_identifier TEXT,
  p_max_attempts INTEGER,
  p_window_ms BIGINT
) RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM public.audit_logs
  WHERE action = 'rate_limit_check'
    AND details->>'identifier' = p_identifier
    AND created_at > (p_current_time - (p_window_ms || ' milliseconds')::INTERVAL);
  
  RETURN attempt_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create create_tenant_for_signup function
CREATE OR REPLACE FUNCTION public.create_tenant_for_signup(
  tenant_name TEXT,
  tenant_industry TEXT DEFAULT 'General',
  tenant_max_workers INTEGER DEFAULT 100,
  tenant_subscription_plan TEXT DEFAULT 'basic'
) RETURNS UUID AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  INSERT INTO public.tenants (name, industry, max_workers, subscription_plan)
  VALUES (tenant_name, tenant_industry, tenant_max_workers, tenant_subscription_plan)
  RETURNING id INTO new_tenant_id;
  
  RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create create_tenant_during_signup function (alias)
CREATE OR REPLACE FUNCTION public.create_tenant_during_signup(
  tenant_name TEXT,
  tenant_industry TEXT DEFAULT 'General',
  tenant_max_workers INTEGER DEFAULT 100,
  tenant_subscription_plan TEXT DEFAULT 'basic'
) RETURNS UUID AS $$
BEGIN
  RETURN public.create_tenant_for_signup(tenant_name, tenant_industry, tenant_max_workers, tenant_subscription_plan);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Add RLS policies for multi-tenant isolation
-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for tenants table
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Create policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Create policies for workers table
DROP POLICY IF EXISTS "Users can view workers in their tenant" ON public.workers;
CREATE POLICY "Users can view workers in their tenant" ON public.workers
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert workers in their tenant" ON public.workers;
CREATE POLICY "Users can insert workers in their tenant" ON public.workers
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update workers in their tenant" ON public.workers;
CREATE POLICY "Users can update workers in their tenant" ON public.workers
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete workers in their tenant" ON public.workers;
CREATE POLICY "Users can delete workers in their tenant" ON public.workers
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Create policies for assessments table
DROP POLICY IF EXISTS "Users can view assessments in their tenant" ON public.assessments;
CREATE POLICY "Users can view assessments in their tenant" ON public.assessments
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert assessments in their tenant" ON public.assessments;
CREATE POLICY "Users can insert assessments in their tenant" ON public.assessments
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update assessments in their tenant" ON public.assessments;
CREATE POLICY "Users can update assessments in their tenant" ON public.assessments
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete assessments in their tenant" ON public.assessments;
CREATE POLICY "Users can delete assessments in their tenant" ON public.assessments
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Create policies for reports table
DROP POLICY IF EXISTS "Users can view reports in their tenant" ON public.reports;
CREATE POLICY "Users can view reports in their tenant" ON public.reports
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert reports in their tenant" ON public.reports;
CREATE POLICY "Users can insert reports in their tenant" ON public.reports
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update reports in their tenant" ON public.reports;
CREATE POLICY "Users can update reports in their tenant" ON public.reports
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete reports in their tenant" ON public.reports;
CREATE POLICY "Users can delete reports in their tenant" ON public.reports
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Create policies for audit_logs table
DROP POLICY IF EXISTS "Users can view audit logs in their tenant" ON public.audit_logs;
CREATE POLICY "Users can view audit logs in their tenant" ON public.audit_logs
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert audit logs in their tenant" ON public.audit_logs;
CREATE POLICY "Users can insert audit logs in their tenant" ON public.audit_logs
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Step 12: Verify the changes
SELECT 'tenants table' as table_name, COUNT(*) as row_count FROM public.tenants
UNION ALL
SELECT 'profiles table columns' as table_name, COUNT(*) as row_count 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
UNION ALL
SELECT 'workers table columns' as table_name, COUNT(*) as row_count 
FROM information_schema.columns 
WHERE table_name = 'workers' AND table_schema = 'public'
UNION ALL
SELECT 'assessments table columns' as table_name, COUNT(*) as row_count 
FROM information_schema.columns 
WHERE table_name = 'assessments' AND table_schema = 'public'
UNION ALL
SELECT 'reports table columns' as table_name, COUNT(*) as row_count 
FROM information_schema.columns 
WHERE table_name = 'reports' AND table_schema = 'public'
UNION ALL
SELECT 'audit_logs table' as table_name, COUNT(*) as row_count FROM public.audit_logs;

-- Step 13: Show final table structures
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'workers', 'assessments', 'reports', 'audit_logs')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position; 