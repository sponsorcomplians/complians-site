-- ROLE SYSTEM FINAL MIGRATION
-- This script ensures the role system is properly configured and consistent
-- Run this in Supabase SQL Editor after the main migration

-- 1. ENSURE: user_roles table has correct constraint
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('Admin', 'Manager', 'Auditor', 'Viewer'));

-- 2. ENSURE: users table role column has correct default
ALTER TABLE public.users 
ALTER COLUMN role SET DEFAULT 'Viewer';

-- 3. UPDATE: Any existing 'User' roles to 'Viewer' for consistency
UPDATE public.user_roles 
SET role = 'Viewer' 
WHERE role = 'User';

UPDATE public.users 
SET role = 'Viewer' 
WHERE role = 'User' OR role IS NULL;

-- 4. CREATE: Function to get user role with fallback
CREATE OR REPLACE FUNCTION public.get_user_role_with_fallback(user_uuid UUID, tenant_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- First try to get role from user_roles table
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = user_uuid AND tenant_id = tenant_uuid;
  
  -- If not found, fall back to users table
  IF user_role IS NULL THEN
    SELECT role INTO user_role
    FROM public.users
    WHERE id = user_uuid;
  END IF;
  
  -- Default to Viewer if still null
  RETURN COALESCE(user_role, 'Viewer');
END;
$$;

-- 5. CREATE: Function to ensure user has role record
CREATE OR REPLACE FUNCTION public.ensure_user_role_record(user_uuid UUID, tenant_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get current role
  SELECT get_user_role_with_fallback(user_uuid, tenant_uuid) INTO user_role;
  
  -- Ensure record exists in user_roles table
  INSERT INTO public.user_roles (user_id, tenant_id, role)
  VALUES (user_uuid, tenant_uuid, user_role)
  ON CONFLICT (user_id, tenant_id) 
  DO UPDATE SET role = EXCLUDED.role;
  
  RETURN user_role;
END;
$$;

-- 6. CREATE: Trigger to sync user_roles with users table
CREATE OR REPLACE FUNCTION public.sync_user_role_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- When user is created/updated, ensure user_roles record exists
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM ensure_user_role_record(NEW.id, NEW.tenant_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- 7. CREATE: Trigger on users table
DROP TRIGGER IF EXISTS sync_user_role_trigger ON public.users;
CREATE TRIGGER sync_user_role_trigger
  AFTER INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_trigger();

-- 8. MIGRATE: Ensure all existing users have role records
INSERT INTO public.user_roles (user_id, tenant_id, role)
SELECT 
  u.id,
  u.tenant_id,
  COALESCE(u.role, 'Viewer') as role
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = u.id AND ur.tenant_id = u.tenant_id
);

-- 9. CREATE: RPC function for role management
CREATE OR REPLACE FUNCTION public.manage_user_role(
  target_user_uuid UUID,
  new_role TEXT,
  current_user_uuid UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
  target_user_tenant UUID;
  result JSON;
BEGIN
  -- Get current user's role
  SELECT get_user_role_with_fallback(current_user_uuid, ur.tenant_id) INTO current_user_role
  FROM public.user_roles ur
  WHERE ur.user_id = current_user_uuid
  LIMIT 1;
  
  -- Check if current user is Admin
  IF current_user_role != 'Admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions. Only Admins can manage user roles.'
    );
  END IF;
  
  -- Get target user's tenant
  SELECT tenant_id INTO target_user_tenant
  FROM public.users
  WHERE id = target_user_uuid;
  
  -- Check if target user is in same tenant
  IF target_user_tenant != (
    SELECT tenant_id FROM public.user_roles WHERE user_id = current_user_uuid LIMIT 1
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot manage users from different tenants.'
    );
  END IF;
  
  -- Validate role
  IF new_role NOT IN ('Admin', 'Manager', 'Auditor', 'Viewer') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid role. Must be one of: Admin, Manager, Auditor, Viewer.'
    );
  END IF;
  
  -- Update role
  UPDATE public.user_roles
  SET role = new_role, updated_at = NOW()
  WHERE user_id = target_user_uuid AND tenant_id = target_user_tenant;
  
  -- Also update users table for backward compatibility
  UPDATE public.users
  SET role = new_role
  WHERE id = target_user_uuid;
  
  RETURN json_build_object(
    'success', true,
    'message', 'User role updated successfully',
    'user_id', target_user_uuid,
    'new_role', new_role
  );
END;
$$;

-- 10. GRANT: Permissions for role management functions
GRANT EXECUTE ON FUNCTION public.get_user_role_with_fallback(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_role_record(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.manage_user_role(UUID, TEXT, UUID) TO authenticated;

-- 11. CREATE: Index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup ON public.user_roles(user_id, tenant_id, role);

-- 12. VERIFY: Role system integrity
DO $$
DECLARE
  user_count INTEGER;
  role_count INTEGER;
  missing_roles INTEGER;
BEGIN
  -- Count users
  SELECT COUNT(*) INTO user_count FROM public.users;
  
  -- Count user_roles records
  SELECT COUNT(*) INTO role_count FROM public.user_roles;
  
  -- Count users without role records
  SELECT COUNT(*) INTO missing_roles
  FROM public.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = u.id AND ur.tenant_id = u.tenant_id
  );
  
  -- Log results
  RAISE NOTICE 'Role system verification:';
  RAISE NOTICE 'Total users: %', user_count;
  RAISE NOTICE 'Total role records: %', role_count;
  RAISE NOTICE 'Users missing role records: %', missing_roles;
  
  IF missing_roles > 0 THEN
    RAISE WARNING 'Some users are missing role records. Run the migration again.';
  ELSE
    RAISE NOTICE 'Role system is consistent!';
  END IF;
END $$; 