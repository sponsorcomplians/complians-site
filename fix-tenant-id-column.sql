-- Fix tenant_id column issue
-- Run this in Supabase SQL Editor

-- Step 1: Check if profiles table exists and show its current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Create tenants table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  subscription_plan TEXT DEFAULT 'basic',
  max_workers INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add tenant_id column to profiles table (with error handling)
DO $$ 
BEGIN
  -- Check if the column already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'tenant_id' 
    AND table_schema = 'public'
  ) THEN
    -- Add the column
    ALTER TABLE public.profiles ADD COLUMN tenant_id UUID;
    
    -- Add the foreign key constraint
    ALTER TABLE public.profiles 
    ADD CONSTRAINT fk_profiles_tenant_id 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);
    
    RAISE NOTICE 'Successfully added tenant_id column to profiles table';
  ELSE
    RAISE NOTICE 'tenant_id column already exists in profiles table';
  END IF;
END $$;

-- Step 4: Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 5: Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create the missing functions
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_current_time TIMESTAMP WITH TIME ZONE,
  p_identifier TEXT,
  p_max_attempts INTEGER,
  p_window_ms BIGINT
)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM public.audit_logs
  WHERE action = 'rate_limit_check'
  AND details->>'identifier' = p_identifier
  AND created_at >= p_current_time - (p_window_ms || ' milliseconds')::INTERVAL;
  
  RETURN attempt_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_tenant_for_signup(
  tenant_name TEXT,
  tenant_industry TEXT,
  tenant_subscription_plan TEXT,
  tenant_max_workers INTEGER
)
RETURNS UUID AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  INSERT INTO public.tenants (name, industry, subscription_plan, max_workers)
  VALUES (tenant_name, tenant_industry, tenant_subscription_plan, tenant_max_workers)
  RETURNING id INTO new_tenant_id;
  
  INSERT INTO public.audit_logs (action, resource_type, resource_id, details)
  VALUES ('tenant_created', 'tenant', new_tenant_id, 
          jsonb_build_object('name', tenant_name, 'industry', tenant_industry));
  
  RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Enable RLS and create policies
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all tenants" ON public.tenants
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all audit logs" ON public.audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Step 8: Grant permissions
GRANT ALL ON public.tenants TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Step 9: Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_name ON public.tenants(name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);

-- Step 10: Final verification
SELECT 'Database setup completed successfully!' as status; 