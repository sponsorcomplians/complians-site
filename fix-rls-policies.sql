-- Fix RLS policies to allow tenant creation during signup
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin users can manage tenants" ON tenants;

-- Create new policy that allows tenant creation during signup
CREATE POLICY "Allow tenant creation during signup" ON tenants
  FOR INSERT WITH CHECK (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
    -- OR allow if no authenticated user (during signup)
    OR auth.uid() IS NULL
  );

-- Create policy for viewing tenants
CREATE POLICY "Users can view their own tenant" ON tenants
  FOR SELECT USING (
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
    -- OR allow if user belongs to this tenant
    OR id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Create policy for updating tenants (admin only)
CREATE POLICY "Admin users can update tenants" ON tenants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create policy for deleting tenants (admin only)
CREATE POLICY "Admin users can delete tenants" ON tenants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  ); 