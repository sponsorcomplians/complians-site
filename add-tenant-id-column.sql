-- Add tenant_id column to users table
-- Run this in Supabase SQL Editor

-- Add tenant_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add index for tenant_id
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- Add foreign key constraint to tenants table (if tenants table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
    ALTER TABLE users 
    ADD CONSTRAINT fk_users_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Verify the column was added
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'tenant_id'; 