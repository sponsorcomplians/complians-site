-- Fix tenant_id column issue - Minimal Script
-- Run this in Supabase SQL Editor

-- Step 1: Check current profiles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

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

-- Step 3: Add tenant_id column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Step 4: Create audit_logs table with details column
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

-- Step 5: Create check_rate_limit function
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

-- Step 6: Create create_tenant_for_signup function
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

-- Step 7: Create create_tenant_during_signup function (alias)
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

-- Step 8: Verify the changes
SELECT 'tenants table' as table_name, COUNT(*) as row_count FROM public.tenants
UNION ALL
SELECT 'profiles table columns' as table_name, COUNT(*) as row_count 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
UNION ALL
SELECT 'audit_logs table' as table_name, COUNT(*) as row_count FROM public.audit_logs;

-- Step 9: Show profiles table structure after changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position; 