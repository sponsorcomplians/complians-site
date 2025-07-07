-- Cleanup all tenant functions and create the correct one
-- This will resolve the "tenant_industry" column error

-- Step 1: Drop ALL existing tenant-related functions
DROP FUNCTION IF EXISTS public.create_tenant_during_signup(text, int, text, text);
DROP FUNCTION IF EXISTS create_tenant_during_signup(text, int, text, text);
DROP FUNCTION IF EXISTS public.create_tenant_for_signup(text, text, int, text);
DROP FUNCTION IF EXISTS create_tenant_for_signup(text, text, int, text);
DROP FUNCTION IF EXISTS public.create_tenant_for_signup(text, text, int, text, text);
DROP FUNCTION IF EXISTS create_tenant_for_signup(text, text, int, text, text);

-- Step 2: Ensure the industry column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' 
        AND column_name = 'industry'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE tenants ADD COLUMN industry TEXT DEFAULT 'General';
        RAISE NOTICE 'Added industry column to tenants table';
    ELSE
        RAISE NOTICE 'industry column already exists';
    END IF;
END $$;

-- Step 3: Create the ONLY correct function
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

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION public.create_tenant_during_signup TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tenant_during_signup TO anon;

-- Step 5: Test the function
SELECT '=== TESTING TENANT CREATION ===' as info;
SELECT public.create_tenant_during_signup('Test Industry', 50, 'Test Company Cleanup', 'Basic') as test_result;

-- Step 6: Clean up test data
DELETE FROM tenants WHERE name = 'Test Company Cleanup';

-- Step 7: Show all functions to verify
SELECT '=== VERIFYING FUNCTIONS ===' as info;
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname LIKE '%tenant%' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Step 8: Show tenants table structure
SELECT '=== TENANTS TABLE STRUCTURE ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tenants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== CLEANUP COMPLETE ===' as info; 