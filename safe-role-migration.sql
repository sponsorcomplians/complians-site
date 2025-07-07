-- SAFE ROLE MIGRATION
-- This script safely checks for existing columns before creating/modifying them
-- Run this in Supabase SQL Editor

-- 1. SAFELY ADD role column to users table (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'Viewer';
    RAISE NOTICE 'Added role column to users table with default value Viewer';
  ELSE
    RAISE NOTICE 'Role column already exists in users table';
  END IF;
END $$;

-- 2. SAFELY UPDATE role column default (only if it exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ALTER COLUMN role SET DEFAULT 'Viewer';
    RAISE NOTICE 'Updated role column default to Viewer';
  ELSE
    RAISE NOTICE 'Role column does not exist, cannot update default';
  END IF;
END $$;

-- 3. SAFELY CREATE user_roles table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager', 'Auditor', 'Viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- 4. SAFELY UPDATE user_roles table constraint (only if table exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_roles'
  ) THEN
    -- Drop existing constraint if it exists
    ALTER TABLE public.user_roles 
    DROP CONSTRAINT IF EXISTS user_roles_role_check;
    
    -- Add correct constraint
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_role_check 
    CHECK (role IN ('Admin', 'Manager', 'Auditor', 'Viewer'));
    
    RAISE NOTICE 'Updated user_roles table constraint';
  ELSE
    RAISE NOTICE 'user_roles table does not exist, cannot update constraint';
  END IF;
END $$;

-- 5. SAFELY UPDATE any existing 'User' roles to 'Viewer'
DO $$ 
BEGIN
  -- Update user_roles table
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_roles'
  ) THEN
    UPDATE public.user_roles 
    SET role = 'Viewer' 
    WHERE role = 'User';
    
    GET DIAGNOSTICS var_count = ROW_COUNT;
    RAISE NOTICE 'Updated % rows in user_roles table from User to Viewer', var_count;
  END IF;
  
  -- Update users table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    UPDATE public.users 
    SET role = 'Viewer' 
    WHERE role = 'User' OR role IS NULL;
    
    GET DIAGNOSTICS var_count = ROW_COUNT;
    RAISE NOTICE 'Updated % rows in users table from User/NULL to Viewer', var_count;
  END IF;
END $$;

-- 6. VERIFY: Check final state
DO $$
DECLARE
  users_role_exists BOOLEAN;
  user_roles_exists BOOLEAN;
  role_count INTEGER;
BEGIN
  -- Check if role column exists in users table
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) INTO users_role_exists;
  
  -- Check if user_roles table exists
  SELECT EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_roles'
  ) INTO user_roles_exists;
  
  -- Count users with roles
  IF users_role_exists THEN
    SELECT COUNT(*) INTO role_count FROM users WHERE role IS NOT NULL;
  ELSE
    role_count := 0;
  END IF;
  
  RAISE NOTICE '=== ROLE SYSTEM VERIFICATION ===';
  RAISE NOTICE 'Users table has role column: %', users_role_exists;
  RAISE NOTICE 'user_roles table exists: %', user_roles_exists;
  RAISE NOTICE 'Users with role values: %', role_count;
  
  IF users_role_exists AND user_roles_exists THEN
    RAISE NOTICE '✅ Role system is properly configured!';
  ELSE
    RAISE WARNING '⚠️ Role system may need additional configuration';
  END IF;
END $$; 