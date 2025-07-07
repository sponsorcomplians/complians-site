-- Final Comprehensive Database Fix V2
-- Run this in Supabase SQL Editor to fix all signup and database issues

-- Step 1: Drop existing functions if they exist (to avoid return type conflicts)
DROP FUNCTION IF EXISTS public.check_rate_limit(timestamp with time zone, text, integer, bigint);
DROP FUNCTION IF EXISTS public.create_tenant_for_signup(text, text, integer, text);
DROP FUNCTION IF EXISTS public.create_tenant_during_signup(text, text, integer, text);

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

-- Step 3: Add tenant_id to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.profiles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
  END IF;
END $$;

-- Step 4: Create audit_logs table with details column
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Add details column to audit_logs if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'audit_logs' AND column_name = 'details') THEN
    ALTER TABLE public.audit_logs ADD COLUMN details JSONB;
  END IF;
END $$;

-- Step 6: Create the check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_current_time TIMESTAMP WITH TIME ZONE,
  p_identifier TEXT,
  p_max_attempts INTEGER,
  p_window_ms BIGINT
)
RETURNS TABLE(
  success BOOLEAN,
  remaining INTEGER,
  reset_time TIMESTAMP WITH TIME ZONE,
  retry_after INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_reset_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start time
  v_window_start := p_current_time - (p_window_ms || ' milliseconds')::INTERVAL;
  
  -- Count attempts in the current window
  SELECT COUNT(*) INTO v_count
  FROM public.audit_logs
  WHERE action = 'rate_limit_check'
    AND details->>'identifier' = p_identifier
    AND created_at >= v_window_start;
  
  -- Calculate reset time
  v_reset_time := v_window_start + (p_window_ms || ' milliseconds')::INTERVAL;
  
  -- Return result
  IF v_count < p_max_attempts THEN
    RETURN QUERY SELECT 
      true as success,
      p_max_attempts - v_count - 1 as remaining,
      v_reset_time as reset_time,
      NULL::INTEGER as retry_after;
  ELSE
    RETURN QUERY SELECT 
      false as success,
      0 as remaining,
      v_reset_time as reset_time,
      EXTRACT(EPOCH FROM (v_reset_time - p_current_time))::INTEGER as retry_after;
  END IF;
END;
$$;

-- Step 7: Create the create_tenant_for_signup function
CREATE OR REPLACE FUNCTION public.create_tenant_for_signup(
  tenant_name TEXT,
  tenant_industry TEXT DEFAULT 'General',
  tenant_max_workers INTEGER DEFAULT 100,
  tenant_subscription_plan TEXT DEFAULT 'basic'
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  industry TEXT,
  subscription_plan TEXT,
  max_workers INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Insert new tenant
  INSERT INTO public.tenants (
    name, 
    industry, 
    max_workers, 
    subscription_plan
  ) VALUES (
    tenant_name,
    tenant_industry,
    tenant_max_workers,
    tenant_subscription_plan
  ) RETURNING id INTO v_tenant_id;
  
  -- Return the created tenant
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.industry,
    t.subscription_plan,
    t.max_workers,
    t.is_active,
    t.created_at
  FROM public.tenants t
  WHERE t.id = v_tenant_id;
END;
$$;

-- Step 8: Create the create_tenant_during_signup function (alternative name)
CREATE OR REPLACE FUNCTION public.create_tenant_during_signup(
  tenant_name TEXT,
  tenant_industry TEXT DEFAULT 'General',
  tenant_max_workers INTEGER DEFAULT 100,
  tenant_subscription_plan TEXT DEFAULT 'basic'
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  industry TEXT,
  subscription_plan TEXT,
  max_workers INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the main function
  RETURN QUERY SELECT * FROM public.create_tenant_for_signup(
    tenant_name,
    tenant_industry,
    tenant_max_workers,
    tenant_subscription_plan
  );
END;
$$;

-- Step 9: Set up RLS policies for tenants table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Service role can create tenants" ON public.tenants;

-- Policy to allow users to read their own tenant
CREATE POLICY "Users can read their own tenant" ON public.tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy to allow service role to create tenants (for signup)
CREATE POLICY "Service role can create tenants" ON public.tenants
  FOR INSERT WITH CHECK (true);

-- Step 10: Set up RLS policies for audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

-- Policy to allow users to read their own audit logs
CREATE POLICY "Users can read their own audit logs" ON public.audit_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    tenant_id IN (
      SELECT tenant_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy to allow service role to insert audit logs
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Step 11: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created_at ON public.audit_logs(action, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_identifier ON public.audit_logs USING GIN ((details->>'identifier'));
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_name ON public.tenants(name);

-- Step 12: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.tenants TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tenant_for_signup TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tenant_during_signup TO authenticated;

-- Step 13: Grant service role permissions
GRANT ALL ON public.tenants TO service_role;
GRANT ALL ON public.audit_logs TO service_role;
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO service_role;
GRANT EXECUTE ON FUNCTION public.create_tenant_for_signup TO service_role;
GRANT EXECUTE ON FUNCTION public.create_tenant_during_signup TO service_role;

-- Step 14: Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'Created/fixed:';
  RAISE NOTICE '- tenants table';
  RAISE NOTICE '- audit_logs table with details column';
  RAISE NOTICE '- tenant_id column in profiles table';
  RAISE NOTICE '- check_rate_limit function';
  RAISE NOTICE '- create_tenant_for_signup function';
  RAISE NOTICE '- create_tenant_during_signup function';
  RAISE NOTICE '- RLS policies';
  RAISE NOTICE '- Indexes and permissions';
END $$; 