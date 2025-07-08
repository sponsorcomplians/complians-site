-- Create SW002 forms table
CREATE TABLE IF NOT EXISTS sw002_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sw002_forms_worker_id ON sw002_forms(worker_id);
CREATE INDEX IF NOT EXISTS idx_sw002_forms_status ON sw002_forms(status);

-- Create audit trail table for SW002 form changes
CREATE TABLE IF NOT EXISTS sw002_form_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES sw002_forms(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for audit logs
CREATE INDEX IF NOT EXISTS idx_sw002_audit_form_id ON sw002_form_audit_logs(form_id);
CREATE INDEX IF NOT EXISTS idx_sw002_audit_worker_id ON sw002_form_audit_logs(worker_id);

-- Create storage bucket for SW002 documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sw002-documents', 'sw002-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for SW002 forms
ALTER TABLE sw002_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SW002 forms" ON sw002_forms
  FOR SELECT USING (
    worker_id IN (
      SELECT id FROM workers WHERE tenant_id = auth.jwt() ->> 'tenant_id'
    )
  );

CREATE POLICY "Users can insert their own SW002 forms" ON sw002_forms
  FOR INSERT WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE tenant_id = auth.jwt() ->> 'tenant_id'
    )
  );

CREATE POLICY "Users can update their own SW002 forms" ON sw002_forms
  FOR UPDATE USING (
    worker_id IN (
      SELECT id FROM workers WHERE tenant_id = auth.jwt() ->> 'tenant_id'
    )
  );

-- Create RLS policies for audit logs
ALTER TABLE sw002_form_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SW002 audit logs" ON sw002_form_audit_logs
  FOR SELECT USING (
    worker_id IN (
      SELECT id FROM workers WHERE tenant_id = auth.jwt() ->> 'tenant_id'
    )
  );

CREATE POLICY "Users can insert their own SW002 audit logs" ON sw002_form_audit_logs
  FOR INSERT WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE tenant_id = auth.jwt() ->> 'tenant_id'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sw002_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_sw002_forms_updated_at
  BEFORE UPDATE ON sw002_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_sw002_forms_updated_at(); 