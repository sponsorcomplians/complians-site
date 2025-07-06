-- Comprehensive Multi-Tenant Migration Script
-- This script creates a dedicated tenants table and implements proper tenant isolation

-- Step 1: Create the tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  max_workers INTEGER DEFAULT 100,
  subscription_plan TEXT DEFAULT 'Basic',
  settings JSONB DEFAULT '{}',
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add tenant_id to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 3: Add tenant_id to all compliance tables
ALTER TABLE compliance_workers 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE compliance_assessments 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE compliance_reports 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE remediation_actions 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE alerts 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Add tenant_id to workers table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workers') THEN
    ALTER TABLE workers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 5: Add tenant_id to other related tables
-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES compliance_workers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training records table
CREATE TABLE IF NOT EXISTS training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES compliance_workers(id) ON DELETE CASCADE,
  training_type TEXT NOT NULL,
  training_date DATE NOT NULL,
  expiry_date DATE,
  certificate_number TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES compliance_workers(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES compliance_assessments(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_workers_tenant_id ON compliance_workers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_tenant_id ON compliance_assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_tenant_id ON compliance_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_remediation_actions_tenant_id ON remediation_actions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_tenant_id ON alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_training_records_tenant_id ON training_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notes_tenant_id ON notes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_compliance_workers_tenant_agent ON compliance_workers(tenant_id, agent_type);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_tenant_agent ON compliance_assessments(tenant_id, agent_type);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_worker ON documents(tenant_id, worker_id);
CREATE INDEX IF NOT EXISTS idx_training_records_tenant_worker ON training_records(tenant_id, worker_id);
CREATE INDEX IF NOT EXISTS idx_notes_tenant_worker ON notes(tenant_id, worker_id);

-- Step 7: Migrate existing data to create tenants and assign tenant_id
-- Create a default tenant for existing users
INSERT INTO tenants (name, industry, subscription_plan, subscription_status)
SELECT 
  'Default Tenant',
  'General',
  'Basic',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE name = 'Default Tenant');

-- Get the default tenant ID
DO $$
DECLARE
  default_tenant_id UUID;
BEGIN
  SELECT id INTO default_tenant_id FROM tenants WHERE name = 'Default Tenant' LIMIT 1;
  
  -- Update users table
  UPDATE users 
  SET tenant_id = default_tenant_id 
  WHERE tenant_id IS NULL;
  
  -- Update compliance tables
  UPDATE compliance_workers 
  SET tenant_id = default_tenant_id 
  WHERE tenant_id IS NULL;
  
  UPDATE compliance_assessments 
  SET tenant_id = default_tenant_id 
  WHERE tenant_id IS NULL;
  
  UPDATE compliance_reports 
  SET tenant_id = default_tenant_id 
  WHERE tenant_id IS NULL;
  
  UPDATE remediation_actions 
  SET tenant_id = default_tenant_id 
  WHERE tenant_id IS NULL;
  
  UPDATE alerts 
  SET tenant_id = default_tenant_id 
  WHERE tenant_id IS NULL;
  
  -- Update workers table if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workers') THEN
    UPDATE workers 
    SET tenant_id = default_tenant_id 
    WHERE tenant_id IS NULL;
  END IF;
END $$;

-- Step 8: Make tenant_id NOT NULL after populating data
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE compliance_workers ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE compliance_assessments ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE compliance_reports ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE remediation_actions ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE alerts ALTER COLUMN tenant_id SET NOT NULL;

-- Step 9: Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE remediation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 10: Drop old RLS policies
DROP POLICY IF EXISTS "Users can view their own compliance workers" ON compliance_workers;
DROP POLICY IF EXISTS "Users can insert their own compliance workers" ON compliance_workers;
DROP POLICY IF EXISTS "Users can update their own compliance workers" ON compliance_workers;
DROP POLICY IF EXISTS "Users can delete their own compliance workers" ON compliance_workers;

DROP POLICY IF EXISTS "Users can view their own compliance assessments" ON compliance_assessments;
DROP POLICY IF EXISTS "Users can insert their own compliance assessments" ON compliance_assessments;
DROP POLICY IF EXISTS "Users can update their own compliance assessments" ON compliance_assessments;
DROP POLICY IF EXISTS "Users can delete their own compliance assessments" ON compliance_assessments;

DROP POLICY IF EXISTS "Users can view their own compliance reports" ON compliance_reports;
DROP POLICY IF EXISTS "Users can insert their own compliance reports" ON compliance_reports;
DROP POLICY IF EXISTS "Users can update their own compliance reports" ON compliance_reports;
DROP POLICY IF EXISTS "Users can delete their own compliance reports" ON compliance_reports;

-- Step 11: Create new comprehensive RLS policies

-- Tenants policies (admin only)
CREATE POLICY "Admin users can view all tenants" ON tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admin users can manage tenants" ON tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Users policies (tenant-based)
CREATE POLICY "Users can view users in their tenant" ON users
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (
    id = auth.uid()
  );

CREATE POLICY "Users can insert into their tenant" ON users
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Compliance Workers policies
CREATE POLICY "Tenant users can view their compliance workers" ON compliance_workers
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert compliance workers" ON compliance_workers
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their compliance workers" ON compliance_workers
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their compliance workers" ON compliance_workers
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Compliance Assessments policies
CREATE POLICY "Tenant users can view their compliance assessments" ON compliance_assessments
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert compliance assessments" ON compliance_assessments
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their compliance assessments" ON compliance_assessments
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their compliance assessments" ON compliance_assessments
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Compliance Reports policies
CREATE POLICY "Tenant users can view their compliance reports" ON compliance_reports
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert compliance reports" ON compliance_reports
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their compliance reports" ON compliance_reports
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their compliance reports" ON compliance_reports
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Remediation Actions policies
CREATE POLICY "Tenant users can view their remediation actions" ON remediation_actions
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert remediation actions" ON remediation_actions
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their remediation actions" ON remediation_actions
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their remediation actions" ON remediation_actions
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Alerts policies
CREATE POLICY "Tenant users can view their alerts" ON alerts
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert alerts" ON alerts
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their alerts" ON alerts
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their alerts" ON alerts
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Documents policies
CREATE POLICY "Tenant users can view their documents" ON documents
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert documents" ON documents
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their documents" ON documents
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their documents" ON documents
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Training Records policies
CREATE POLICY "Tenant users can view their training records" ON training_records
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert training records" ON training_records
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their training records" ON training_records
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their training records" ON training_records
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Notes policies
CREATE POLICY "Tenant users can view their notes" ON notes
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert notes" ON notes
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their notes" ON notes
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their notes" ON notes
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Audit Logs policies (read-only for tenant users, full access for admins)
CREATE POLICY "Tenant users can view their audit logs" ON audit_logs
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Step 12: Create helper functions
CREATE OR REPLACE FUNCTION get_current_user_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_tenant()
RETURNS TABLE (
  id UUID,
  name TEXT,
  industry TEXT,
  max_workers INTEGER,
  subscription_plan TEXT,
  subscription_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.industry,
    t.max_workers,
    t.subscription_plan,
    t.subscription_status
  FROM tenants t
  JOIN users u ON t.id = u.tenant_id
  WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Create triggers for automatic tenant_id assignment
CREATE OR REPLACE FUNCTION set_tenant_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := get_current_user_tenant_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for all tables
CREATE TRIGGER set_tenant_id_compliance_workers
  BEFORE INSERT ON compliance_workers
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

CREATE TRIGGER set_tenant_id_compliance_assessments
  BEFORE INSERT ON compliance_assessments
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

CREATE TRIGGER set_tenant_id_compliance_reports
  BEFORE INSERT ON compliance_reports
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

CREATE TRIGGER set_tenant_id_remediation_actions
  BEFORE INSERT ON remediation_actions
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

CREATE TRIGGER set_tenant_id_alerts
  BEFORE INSERT ON alerts
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

CREATE TRIGGER set_tenant_id_documents
  BEFORE INSERT ON documents
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

CREATE TRIGGER set_tenant_id_training_records
  BEFORE INSERT ON training_records
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

CREATE TRIGGER set_tenant_id_notes
  BEFORE INSERT ON notes
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

CREATE TRIGGER set_tenant_id_audit_logs
  BEFORE INSERT ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert();

-- Step 14: Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      tenant_id,
      user_id,
      action,
      table_name,
      record_id,
      new_values
    ) VALUES (
      NEW.tenant_id,
      auth.uid(),
      'INSERT',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      tenant_id,
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      NEW.tenant_id,
      auth.uid(),
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      tenant_id,
      user_id,
      action,
      table_name,
      record_id,
      old_values
    ) VALUES (
      OLD.tenant_id,
      auth.uid(),
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
CREATE TRIGGER audit_compliance_workers
  AFTER INSERT OR UPDATE OR DELETE ON compliance_workers
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_compliance_assessments
  AFTER INSERT OR UPDATE OR DELETE ON compliance_assessments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Step 15: Create updated_at triggers
CREATE TRIGGER handle_updated_at_tenants
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_documents
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_training_records
  BEFORE UPDATE ON training_records
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_notes
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Migration complete!
-- All tables now have proper tenant isolation with comprehensive RLS policies
-- Audit logging is enabled for important operations
-- Automatic tenant_id assignment is implemented 