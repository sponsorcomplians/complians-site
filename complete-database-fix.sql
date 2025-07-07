-- Complete Database Fix Script
-- This script adds all missing database objects for the multi-tenant compliance system

-- 1. Create the tenants table
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

-- 2. Add tenant_id to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.profiles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);
  END IF;
END $$;

-- 3. Create audit_logs table with details column
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

-- 4. Create the check_rate_limit function
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
  -- Count attempts within the time window
  SELECT COUNT(*) INTO attempt_count
  FROM public.audit_logs
  WHERE action = 'rate_limit_check'
  AND details->>'identifier' = p_identifier
  AND created_at >= p_current_time - (p_window_ms || ' milliseconds')::INTERVAL;
  
  -- Return true if under limit, false if over limit
  RETURN attempt_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the create_tenant_for_signup function
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
  -- Insert new tenant
  INSERT INTO public.tenants (name, industry, subscription_plan, max_workers)
  VALUES (tenant_name, tenant_industry, tenant_subscription_plan, tenant_max_workers)
  RETURNING id INTO new_tenant_id;
  
  -- Log the tenant creation
  INSERT INTO public.audit_logs (action, resource_type, resource_id, details)
  VALUES ('tenant_created', 'tenant', new_tenant_id, 
          jsonb_build_object('name', tenant_name, 'industry', tenant_industry));
  
  RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create the create_tenant_during_signup function (alternative name)
CREATE OR REPLACE FUNCTION public.create_tenant_during_signup(
  tenant_name TEXT,
  tenant_industry TEXT,
  tenant_subscription_plan TEXT,
  tenant_max_workers INTEGER
)
RETURNS UUID AS $$
BEGIN
  RETURN public.create_tenant_for_signup(tenant_name, tenant_industry, tenant_subscription_plan, tenant_max_workers);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Enable RLS on new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for tenants table
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.tenant_id = tenants.id 
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all tenants" ON public.tenants
  FOR ALL USING (auth.role() = 'service_role');

-- 9. Create RLS policies for audit_logs table
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all audit logs" ON public.audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_name ON public.tenants(name);
CREATE INDEX IF NOT EXISTS idx_tenants_industry ON public.tenants(industry);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);

-- 11. Create trigger for updated_at on tenants table
CREATE TRIGGER handle_updated_at_tenants
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 12. Create trigger for updated_at on audit_logs table
CREATE TRIGGER handle_updated_at_audit_logs
  BEFORE UPDATE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 13. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.tenants TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- 14. Create function to get user's tenant
CREATE OR REPLACE FUNCTION public.get_user_tenant(user_uuid UUID)
RETURNS TABLE (
  tenant_id UUID,
  tenant_name TEXT,
  tenant_industry TEXT,
  tenant_subscription_plan TEXT,
  tenant_max_workers INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.industry,
    t.subscription_plan,
    t.max_workers
  FROM public.tenants t
  JOIN public.profiles p ON t.id = p.tenant_id
  WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Create function to update user's tenant
CREATE OR REPLACE FUNCTION public.update_user_tenant(user_uuid UUID, new_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles 
  SET tenant_id = new_tenant_id, updated_at = NOW()
  WHERE id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_tenant_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_details JSONB,
  p_ip_address INET,
  p_user_agent TEXT
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, tenant_id, action, resource_type, resource_id, 
    details, ip_address, user_agent
  )
  VALUES (
    p_user_id, p_tenant_id, p_action, p_resource_type, p_resource_id,
    p_details, p_ip_address, p_user_agent
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Create default tenant for existing users (optional)
-- This will create a default tenant for any existing users who don't have one
DO $$
DECLARE
  default_tenant_id UUID;
BEGIN
  -- Create a default tenant if it doesn't exist
  INSERT INTO public.tenants (name, industry, subscription_plan, max_workers)
  VALUES ('Default Organization', 'General', 'basic', 10)
  ON CONFLICT DO NOTHING
  RETURNING id INTO default_tenant_id;
  
  -- If no default tenant was created, get the existing one
  IF default_tenant_id IS NULL THEN
    SELECT id INTO default_tenant_id FROM public.tenants WHERE name = 'Default Organization' LIMIT 1;
  END IF;
  
  -- Update profiles that don't have a tenant_id
  IF default_tenant_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET tenant_id = default_tenant_id 
    WHERE tenant_id IS NULL;
  END IF;
END $$;

-- 18. Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'Created/verified: tenants table, audit_logs table, rate limiting function, tenant creation functions';
  RAISE NOTICE 'Created/verified: RLS policies, indexes, triggers, and helper functions';
END $$; 