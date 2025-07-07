-- Fix tenant creation function with correct column name
-- First, let's check what column actually exists and fix accordingly

-- Drop the existing function
DROP FUNCTION IF EXISTS public.create_tenant_during_signup(text, int, text, text);

-- Create the function with the correct column name (industry, not tenant_industry)
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
  -- Using 'industry' column (not 'tenant_industry')
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_tenant_during_signup TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tenant_during_signup TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION public.create_tenant_during_signup IS 'Creates a new tenant during user signup process. Uses industry column.'; 