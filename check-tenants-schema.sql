-- Check tenants table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tenants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if specific columns exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' 
        AND column_name = 'industry'
        AND table_schema = 'public'
    ) THEN 'industry column EXISTS' ELSE 'industry column MISSING' END as industry_status;

SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' 
        AND column_name = 'tenant_industry'
        AND table_schema = 'public'
    ) THEN 'tenant_industry column EXISTS' ELSE 'tenant_industry column MISSING' END as tenant_industry_status;

-- Show current tenants table structure
\d tenants; 