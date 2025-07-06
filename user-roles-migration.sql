-- User Roles Migration Script
-- This script creates the user_roles table and updates authentication to support role-based access control

-- Step 1: Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager', 'Auditor', 'Viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- Step 2: Add role column to users table for backward compatibility
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Viewer' CHECK (role IN ('Admin', 'Manager', 'Auditor', 'Viewer'));

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON public.user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Step 4: Add foreign key constraint for tenant_id
ALTER TABLE public.user_roles 
ADD CONSTRAINT fk_user_roles_tenant 
FOREIGN KEY (tenant_id) REFERENCES public.users(tenant_id) ON DELETE CASCADE;

-- Step 5: Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (
    user_id = auth.uid() OR
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all roles in their tenant" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.tenant_id = user_roles.tenant_id
      AND ur.role = 'Admin'
    )
  );

-- Step 7: Create function to get user role for a tenant
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID, tenant_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND tenant_id = tenant_uuid
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(user_uuid UUID, tenant_uuid UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles 
  WHERE user_id = user_uuid 
  AND tenant_id = tenant_uuid
  LIMIT 1;
  
  -- Role hierarchy: Admin > Manager > Auditor > Viewer
  CASE required_role
    WHEN 'Admin' THEN
      RETURN user_role = 'Admin';
    WHEN 'Manager' THEN
      RETURN user_role IN ('Admin', 'Manager');
    WHEN 'Auditor' THEN
      RETURN user_role IN ('Admin', 'Manager', 'Auditor');
    WHEN 'Viewer' THEN
      RETURN user_role IN ('Admin', 'Manager', 'Auditor', 'Viewer');
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create function to get all users in a tenant with their roles
CREATE OR REPLACE FUNCTION public.get_tenant_users_with_roles(tenant_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    COALESCE(ur.role, 'Viewer') as role,
    u.created_at
  FROM public.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id AND ur.tenant_id = tenant_uuid
  WHERE u.tenant_id = tenant_uuid
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create trigger to update updated_at timestamp
CREATE TRIGGER handle_updated_at_user_roles
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 11: Create function to assign default role to new users
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default Viewer role for new users
  INSERT INTO public.user_roles (user_id, tenant_id, role)
  VALUES (NEW.id, NEW.tenant_id, COALESCE(NEW.role, 'Viewer'))
  ON CONFLICT (user_id, tenant_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Create trigger to assign default role on user creation
CREATE TRIGGER assign_default_role_on_user_insert
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_user_role();

-- Step 13: Update existing users to have default roles
INSERT INTO public.user_roles (user_id, tenant_id, role)
SELECT 
  id, 
  tenant_id, 
  COALESCE(role, 'Viewer')
FROM public.users 
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Step 14: Create function to check user permissions for specific actions
CREATE OR REPLACE FUNCTION public.check_user_permission(user_uuid UUID, tenant_uuid UUID, action TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles 
  WHERE user_id = user_uuid 
  AND tenant_id = tenant_uuid
  LIMIT 1;
  
  -- Default to Viewer if no role found
  user_role := COALESCE(user_role, 'Viewer');
  
  -- Define permissions for each action
  CASE action
    -- Admin permissions
    WHEN 'manage_users' THEN
      RETURN user_role = 'Admin';
    WHEN 'manage_tenant_settings' THEN
      RETURN user_role = 'Admin';
    WHEN 'view_audit_logs' THEN
      RETURN user_role IN ('Admin', 'Manager');
    WHEN 'export_data' THEN
      RETURN user_role IN ('Admin', 'Manager');
    
    -- Manager permissions
    WHEN 'manage_workers' THEN
      RETURN user_role IN ('Admin', 'Manager');
    WHEN 'manage_assessments' THEN
      RETURN user_role IN ('Admin', 'Manager');
    WHEN 'create_reports' THEN
      RETURN user_role IN ('Admin', 'Manager');
    WHEN 'manage_remediation' THEN
      RETURN user_role IN ('Admin', 'Manager');
    
    -- Auditor permissions
    WHEN 'view_workers' THEN
      RETURN user_role IN ('Admin', 'Manager', 'Auditor');
    WHEN 'view_assessments' THEN
      RETURN user_role IN ('Admin', 'Manager', 'Auditor');
    WHEN 'view_reports' THEN
      RETURN user_role IN ('Admin', 'Manager', 'Auditor');
    WHEN 'view_dashboards' THEN
      RETURN user_role IN ('Admin', 'Manager', 'Auditor', 'Viewer');
    
    -- Viewer permissions (read-only)
    WHEN 'view_compliance_data' THEN
      RETURN user_role IN ('Admin', 'Manager', 'Auditor', 'Viewer');
    WHEN 'view_analytics' THEN
      RETURN user_role IN ('Admin', 'Manager', 'Auditor', 'Viewer');
    
    -- Default deny
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 15: Create RLS policies that use role-based permissions
-- Update compliance_workers policies to include role checks
DROP POLICY IF EXISTS "Tenant users can view their own compliance workers" ON public.compliance_workers;
CREATE POLICY "Role-based access to compliance workers" ON public.compliance_workers
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'view_workers')
  );

DROP POLICY IF EXISTS "Tenant users can insert their own compliance workers" ON public.compliance_workers;
CREATE POLICY "Role-based insert compliance workers" ON public.compliance_workers
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'manage_workers')
  );

DROP POLICY IF EXISTS "Tenant users can update their own compliance workers" ON public.compliance_workers;
CREATE POLICY "Role-based update compliance workers" ON public.compliance_workers
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'manage_workers')
  );

DROP POLICY IF EXISTS "Tenant users can delete their own compliance workers" ON public.compliance_workers;
CREATE POLICY "Role-based delete compliance workers" ON public.compliance_workers
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'manage_workers')
  );

-- Update compliance_assessments policies
DROP POLICY IF EXISTS "Tenant users can view their own compliance assessments" ON public.compliance_assessments;
CREATE POLICY "Role-based access to compliance assessments" ON public.compliance_assessments
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'view_assessments')
  );

DROP POLICY IF EXISTS "Tenant users can insert their own compliance assessments" ON public.compliance_assessments;
CREATE POLICY "Role-based insert compliance assessments" ON public.compliance_assessments
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'manage_assessments')
  );

DROP POLICY IF EXISTS "Tenant users can update their own compliance assessments" ON public.compliance_assessments;
CREATE POLICY "Role-based update compliance assessments" ON public.compliance_assessments
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'manage_assessments')
  );

DROP POLICY IF EXISTS "Tenant users can delete their own compliance assessments" ON public.compliance_assessments;
CREATE POLICY "Role-based delete compliance assessments" ON public.compliance_assessments
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'manage_assessments')
  );

-- Update compliance_reports policies
DROP POLICY IF EXISTS "Tenant users can view their own compliance reports" ON public.compliance_reports;
CREATE POLICY "Role-based access to compliance reports" ON public.compliance_reports
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'view_reports')
  );

DROP POLICY IF EXISTS "Tenant users can insert their own compliance reports" ON public.compliance_reports;
CREATE POLICY "Role-based insert compliance reports" ON public.compliance_reports
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'create_reports')
  );

-- Update remediation_actions policies
DROP POLICY IF EXISTS "Tenant users can view their own remediation actions" ON public.remediation_actions;
CREATE POLICY "Role-based access to remediation actions" ON public.remediation_actions
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'view_compliance_data')
  );

DROP POLICY IF EXISTS "Tenant users can insert their own remediation actions" ON public.remediation_actions;
CREATE POLICY "Role-based insert remediation actions" ON public.remediation_actions
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'manage_remediation')
  );

DROP POLICY IF EXISTS "Tenant users can update their own remediation actions" ON public.remediation_actions;
CREATE POLICY "Role-based update remediation actions" ON public.remediation_actions
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'manage_remediation')
  );

-- Update alerts policies
DROP POLICY IF EXISTS "Tenant users can view their own alerts" ON public.alerts;
CREATE POLICY "Role-based access to alerts" ON public.alerts
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'view_compliance_data')
  );

DROP POLICY IF EXISTS "Tenant users can insert their own alerts" ON public.alerts;
CREATE POLICY "Role-based insert alerts" ON public.alerts
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    ) AND
    public.check_user_permission(auth.uid(), tenant_id, 'manage_assessments')
  );

-- Step 16: Create audit log for role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (tenant_id, user_id, action, table_name, record_id, new_values)
    VALUES (NEW.tenant_id, auth.uid(), 'INSERT', 'user_roles', NEW.id, row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (tenant_id, user_id, action, table_name, record_id, old_values, new_values)
    VALUES (NEW.tenant_id, auth.uid(), 'UPDATE', 'user_roles', NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (tenant_id, user_id, action, table_name, record_id, old_values)
    VALUES (OLD.tenant_id, auth.uid(), 'DELETE', 'user_roles', OLD.id, row_to_json(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 17: Create trigger for role change auditing
CREATE TRIGGER log_user_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

-- Step 18: Create function to get user permissions summary
CREATE OR REPLACE FUNCTION public.get_user_permissions_summary(user_uuid UUID, tenant_uuid UUID)
RETURNS TABLE (
  role TEXT,
  can_manage_users BOOLEAN,
  can_manage_workers BOOLEAN,
  can_manage_assessments BOOLEAN,
  can_create_reports BOOLEAN,
  can_view_audit_logs BOOLEAN,
  can_export_data BOOLEAN,
  can_manage_tenant_settings BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ur.role, 'Viewer') as role,
    public.check_user_permission(user_uuid, tenant_uuid, 'manage_users') as can_manage_users,
    public.check_user_permission(user_uuid, tenant_uuid, 'manage_workers') as can_manage_workers,
    public.check_user_permission(user_uuid, tenant_uuid, 'manage_assessments') as can_manage_assessments,
    public.check_user_permission(user_uuid, tenant_uuid, 'create_reports') as can_create_reports,
    public.check_user_permission(user_uuid, tenant_uuid, 'view_audit_logs') as can_view_audit_logs,
    public.check_user_permission(user_uuid, tenant_uuid, 'export_data') as can_export_data,
    public.check_user_permission(user_uuid, tenant_uuid, 'manage_tenant_settings') as can_manage_tenant_settings
  FROM public.user_roles ur
  WHERE ur.user_id = user_uuid AND ur.tenant_id = tenant_uuid
  UNION ALL
  SELECT 
    'Viewer' as role,
    FALSE as can_manage_users,
    FALSE as can_manage_workers,
    FALSE as can_manage_assessments,
    FALSE as can_create_reports,
    FALSE as can_view_audit_logs,
    FALSE as can_export_data,
    FALSE as can_manage_tenant_settings
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur2 
    WHERE ur2.user_id = user_uuid AND ur2.tenant_id = tenant_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 