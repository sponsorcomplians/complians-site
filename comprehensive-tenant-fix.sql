-- Comprehensive Tenant Fix
-- This script will check the schema and fix the tenant creation function

-- Step 1: Check current schema
SELECT '=== CURRENT TENANTS TABLE SCHEMA ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tenants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check if industry column exists
SELECT '=== CHECKING FOR INDUSTRY COLUMN ===' as info;
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' 
        AND column_name = 'industry'
        AND table_schema = 'public'
    ) THEN '✅ industry column EXISTS' ELSE '❌ industry column MISSING' END as industry_status;

-- Step 3: Add industry column if it doesn't exist
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

-- Step 4: Drop any existing functions that might be causing issues
DROP FUNCTION IF EXISTS public.create_tenant_during_signup(text, int, text, text);
DROP FUNCTION IF EXISTS create_tenant_during_signup(text, int, text, text);

-- Step 5: Create the correct function
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

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION public.create_tenant_during_signup TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_tenant_during_signup TO anon;

-- Step 7: Test the function
SELECT '=== TESTING TENANT CREATION FUNCTION ===' as info;
SELECT public.create_tenant_during_signup('Test Industry', 50, 'Test Company', 'Basic') as test_result;

-- Step 8: Clean up test data
DELETE FROM tenants WHERE name = 'Test Company';

-- Step 9: Final verification
SELECT '=== FINAL VERIFICATION ===' as info;
SELECT 
    'Function exists' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'create_tenant_during_signup' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN '✅ Function EXISTS' ELSE '❌ Function MISSING' END as status
UNION ALL
SELECT 
    'Industry column exists' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' 
        AND column_name = 'industry'
        AND table_schema = 'public'
    ) THEN '✅ Column EXISTS' ELSE '❌ Column MISSING' END as status;

SELECT '=== TENANT CREATION FIX COMPLETE ===' as info; 