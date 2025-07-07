-- Function to create tenant during signup (bypasses RLS)
CREATE OR REPLACE FUNCTION create_tenant_for_signup(
  tenant_name TEXT,
  tenant_industry TEXT DEFAULT 'General',
  tenant_max_workers INTEGER DEFAULT 100,
  tenant_subscription_plan TEXT DEFAULT 'Basic'
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  max_workers INTEGER,
  subscription_plan TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Insert tenant with security definer (bypasses RLS)
  INSERT INTO tenants (
    name,
    industry,
    max_workers,
    subscription_plan,
    subscription_status
  ) VALUES (
    tenant_name,
    tenant_industry,
    tenant_max_workers,
    tenant_subscription_plan,
    'active'
  ) RETURNING id, name, max_workers, subscription_plan INTO new_tenant_id, tenant_name, tenant_max_workers, tenant_subscription_plan;
  
  -- Return the created tenant
  RETURN QUERY SELECT new_tenant_id, tenant_name, tenant_max_workers, tenant_subscription_plan;
END;
$$;

-- Function to create tenant during signup (bypasses RLS)
CREATE OR REPLACE FUNCTION create_tenant_during_signup(
  tenant_name TEXT,
  tenant_industry TEXT DEFAULT 'General',
  tenant_max_workers INTEGER DEFAULT 100,
  tenant_subscription_plan TEXT DEFAULT 'Basic'
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  max_workers INTEGER,
  subscription_plan TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Insert tenant with security definer (bypasses RLS)
  INSERT INTO tenants (
    name,
    industry,
    max_workers,
    subscription_plan,
    subscription_status
  ) VALUES (
    tenant_name,
    tenant_industry,
    tenant_max_workers,
    tenant_subscription_plan,
    'active'
  ) RETURNING id, name, max_workers, subscription_plan INTO new_tenant_id, tenant_name, tenant_max_workers, tenant_subscription_plan;
  
  -- Return the created tenant
  RETURN QUERY SELECT new_tenant_id, tenant_name, tenant_max_workers, tenant_subscription_plan;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_tenant_for_signup(TEXT, TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_tenant_for_signup(TEXT, TEXT, INTEGER, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_tenant_during_signup(TEXT, TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_tenant_during_signup(TEXT, TEXT, INTEGER, TEXT) TO anon; 