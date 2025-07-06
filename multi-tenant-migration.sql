-- Multi-Tenant Data Isolation Migration Script
-- This script adds tenant_id to all compliance tables and updates RLS policies

-- Step 1: Add tenant_id column to users table (if not exists)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT gen_random_uuid();

-- Step 2: Update existing users to have unique tenant_id based on company
-- This creates a tenant_id for each unique company
UPDATE public.users 
SET tenant_id = (
  SELECT tenant_id 
  FROM (
    SELECT DISTINCT company, gen_random_uuid() as tenant_id 
    FROM public.users 
    WHERE company IS NOT NULL
  ) t 
  WHERE t.company = users.company
)
WHERE tenant_id IS NULL AND company IS NOT NULL;

-- Step 3: Add tenant_id column to all compliance tables
ALTER TABLE public.compliance_workers 
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.compliance_assessments 
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.compliance_reports 
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.remediation_actions 
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.alerts 
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Step 4: Update existing compliance data to use tenant_id from user's company
UPDATE public.compliance_workers 
SET tenant_id = u.tenant_id
FROM public.users u
WHERE compliance_workers.user_id = u.id 
AND compliance_workers.tenant_id IS NULL;

UPDATE public.compliance_assessments 
SET tenant_id = u.tenant_id
FROM public.users u
WHERE compliance_assessments.user_id = u.id 
AND compliance_assessments.tenant_id IS NULL;

UPDATE public.compliance_reports 
SET tenant_id = u.tenant_id
FROM public.users u
WHERE compliance_reports.user_id = u.id 
AND compliance_reports.tenant_id IS NULL;

UPDATE public.remediation_actions 
SET tenant_id = u.tenant_id
FROM public.users u
WHERE remediation_actions.user_id = u.id 
AND remediation_actions.tenant_id IS NULL;

UPDATE public.alerts 
SET tenant_id = u.tenant_id
FROM public.users u
WHERE alerts.user_id = u.id 
AND alerts.tenant_id IS NULL;

-- Step 5: Make tenant_id NOT NULL after populating data
ALTER TABLE public.compliance_workers 
ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.compliance_assessments 
ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.compliance_reports 
ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.remediation_actions 
ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE public.alerts 
ALTER COLUMN tenant_id SET NOT NULL;

-- Step 6: Add foreign key constraints
ALTER TABLE public.compliance_workers 
ADD CONSTRAINT fk_compliance_workers_tenant 
FOREIGN KEY (tenant_id) REFERENCES public.users(tenant_id) ON DELETE CASCADE;

ALTER TABLE public.compliance_assessments 
ADD CONSTRAINT fk_compliance_assessments_tenant 
FOREIGN KEY (tenant_id) REFERENCES public.users(tenant_id) ON DELETE CASCADE;

ALTER TABLE public.compliance_reports 
ADD CONSTRAINT fk_compliance_reports_tenant 
FOREIGN KEY (tenant_id) REFERENCES public.users(tenant_id) ON DELETE CASCADE;

ALTER TABLE public.remediation_actions 
ADD CONSTRAINT fk_remediation_actions_tenant 
FOREIGN KEY (tenant_id) REFERENCES public.users(tenant_id) ON DELETE CASCADE;

ALTER TABLE public.alerts 
ADD CONSTRAINT fk_alerts_tenant 
FOREIGN KEY (tenant_id) REFERENCES public.users(tenant_id) ON DELETE CASCADE;

-- Step 7: Create indexes for tenant_id columns
CREATE INDEX IF NOT EXISTS idx_compliance_workers_tenant_id ON public.compliance_workers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_tenant_id ON public.compliance_assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_tenant_id ON public.compliance_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_remediation_actions_tenant_id ON public.remediation_actions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_tenant_id ON public.alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);

-- Step 8: Drop old RLS policies
DROP POLICY IF EXISTS "Users can view their own compliance workers" ON public.compliance_workers;
DROP POLICY IF EXISTS "Users can insert their own compliance workers" ON public.compliance_workers;
DROP POLICY IF EXISTS "Users can update their own compliance workers" ON public.compliance_workers;
DROP POLICY IF EXISTS "Users can delete their own compliance workers" ON public.compliance_workers;

DROP POLICY IF EXISTS "Users can view their own compliance assessments" ON public.compliance_assessments;
DROP POLICY IF EXISTS "Users can insert their own compliance assessments" ON public.compliance_assessments;
DROP POLICY IF EXISTS "Users can update their own compliance assessments" ON public.compliance_assessments;
DROP POLICY IF EXISTS "Users can delete their own compliance assessments" ON public.compliance_assessments;

DROP POLICY IF EXISTS "Users can view their own compliance reports" ON public.compliance_reports;
DROP POLICY IF EXISTS "Users can insert their own compliance reports" ON public.compliance_reports;
DROP POLICY IF EXISTS "Users can update their own compliance reports" ON public.compliance_reports;
DROP POLICY IF EXISTS "Users can delete their own compliance reports" ON public.compliance_reports;

-- Step 9: Create new multi-tenant RLS policies
-- Compliance Workers policies
CREATE POLICY "Tenant users can view their own compliance workers" ON public.compliance_workers
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert their own compliance workers" ON public.compliance_workers
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their own compliance workers" ON public.compliance_workers
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their own compliance workers" ON public.compliance_workers
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Compliance Assessments policies
CREATE POLICY "Tenant users can view their own compliance assessments" ON public.compliance_assessments
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert their own compliance assessments" ON public.compliance_assessments
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their own compliance assessments" ON public.compliance_assessments
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their own compliance assessments" ON public.compliance_assessments
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Compliance Reports policies
CREATE POLICY "Tenant users can view their own compliance reports" ON public.compliance_reports
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert their own compliance reports" ON public.compliance_reports
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their own compliance reports" ON public.compliance_reports
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their own compliance reports" ON public.compliance_reports
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Remediation Actions policies
CREATE POLICY "Tenant users can view their own remediation actions" ON public.remediation_actions
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert their own remediation actions" ON public.remediation_actions
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their own remediation actions" ON public.remediation_actions
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their own remediation actions" ON public.remediation_actions
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Alerts policies
CREATE POLICY "Tenant users can view their own alerts" ON public.alerts
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can insert their own alerts" ON public.alerts
  FOR INSERT WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can update their own alerts" ON public.alerts
  FOR UPDATE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant users can delete their own alerts" ON public.alerts
  FOR DELETE USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Step 10: Update functions to use tenant_id
CREATE OR REPLACE FUNCTION public.get_compliance_workers_by_agent(user_uuid UUID, agent_type_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  job_title TEXT,
  soc_code TEXT,
  cos_reference TEXT,
  compliance_status TEXT,
  risk_level TEXT,
  red_flag BOOLEAN,
  assignment_date DATE,
  last_assessment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cw.id,
    cw.name,
    cw.job_title,
    cw.soc_code,
    cw.cos_reference,
    cw.compliance_status,
    cw.risk_level,
    cw.red_flag,
    cw.assignment_date,
    cw.last_assessment_date,
    cw.created_at
  FROM public.compliance_workers cw
  WHERE cw.tenant_id = (
    SELECT tenant_id FROM public.users WHERE id = user_uuid
  )
  AND cw.agent_type = agent_type_param
  ORDER BY cw.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_compliance_assessments_by_agent(user_uuid UUID, agent_type_param TEXT)
RETURNS TABLE (
  id UUID,
  worker_id UUID,
  worker_name TEXT,
  cos_reference TEXT,
  job_title TEXT,
  soc_code TEXT,
  compliance_status TEXT,
  risk_level TEXT,
  evidence_status TEXT,
  breach_type TEXT,
  red_flag BOOLEAN,
  assignment_date DATE,
  professional_assessment TEXT,
  generated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    ca.worker_id,
    ca.worker_name,
    ca.cos_reference,
    ca.job_title,
    ca.soc_code,
    ca.compliance_status,
    ca.risk_level,
    ca.evidence_status,
    ca.breach_type,
    ca.red_flag,
    ca.assignment_date,
    ca.professional_assessment,
    ca.generated_at
  FROM public.compliance_assessments ca
  WHERE ca.tenant_id = (
    SELECT tenant_id FROM public.users WHERE id = user_uuid
  )
  AND ca.agent_type = agent_type_param
  ORDER BY ca.generated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Create function to ensure tenant_id is set on insert
CREATE OR REPLACE FUNCTION public.set_tenant_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := public.get_current_user_tenant_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Create triggers to automatically set tenant_id
CREATE TRIGGER set_tenant_id_compliance_workers
  BEFORE INSERT ON public.compliance_workers
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();

CREATE TRIGGER set_tenant_id_compliance_assessments
  BEFORE INSERT ON public.compliance_assessments
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();

CREATE TRIGGER set_tenant_id_compliance_reports
  BEFORE INSERT ON public.compliance_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();

CREATE TRIGGER set_tenant_id_remediation_actions
  BEFORE INSERT ON public.remediation_actions
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();

CREATE TRIGGER set_tenant_id_alerts
  BEFORE INSERT ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id_on_insert();

-- Migration complete!
-- All compliance data is now isolated by tenant_id
-- Users can only access data from their own company/tenant 