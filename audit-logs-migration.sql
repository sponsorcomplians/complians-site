-- Audit Logs Migration Script
-- This script creates an audit logging system to track key actions across the platform

-- Step 1: Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  resource_type TEXT,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_timestamp ON public.audit_logs(tenant_id, timestamp DESC);

-- Step 3: Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Admins can view all audit logs for their tenant
CREATE POLICY "Admins can view all audit logs for their tenant" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.user_roles ur ON u.id = ur.user_id
      WHERE u.id = auth.uid()
      AND u.tenant_id = audit_logs.tenant_id
      AND ur.role = 'Admin'
    )
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Step 5: Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_tenant_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    details,
    ip_address,
    user_agent,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    p_tenant_id,
    p_user_id,
    p_action,
    p_details,
    p_ip_address,
    p_user_agent,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create function to get audit logs for tenant
CREATE OR REPLACE FUNCTION public.get_tenant_audit_logs(
  p_tenant_id UUID,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0,
  p_action_filter TEXT DEFAULT NULL,
  p_user_id_filter UUID DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  tenant_id UUID,
  user_id UUID,
  action TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  resource_type TEXT,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE,
  user_email TEXT,
  user_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.tenant_id,
    al.user_id,
    al.action,
    al.details,
    al.ip_address,
    al.user_agent,
    al.resource_type,
    al.resource_id,
    al.old_values,
    al.new_values,
    al.timestamp,
    u.email as user_email,
    u.name as user_name
  FROM public.audit_logs al
  LEFT JOIN public.users u ON al.user_id = u.id
  WHERE al.tenant_id = p_tenant_id
    AND (p_action_filter IS NULL OR al.action = p_action_filter)
    AND (p_user_id_filter IS NULL OR al.user_id = p_user_id_filter)
    AND (p_start_date IS NULL OR al.timestamp >= p_start_date)
    AND (p_end_date IS NULL OR al.timestamp <= p_end_date)
  ORDER BY al.timestamp DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create function to get audit summary for tenant
CREATE OR REPLACE FUNCTION public.get_audit_summary(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  action TEXT,
  count BIGINT,
  last_occurrence TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.action,
    COUNT(*) as count,
    MAX(al.timestamp) as last_occurrence
  FROM public.audit_logs al
  WHERE al.tenant_id = p_tenant_id
    AND al.timestamp >= NOW() - INTERVAL '1 day' * p_days
  GROUP BY al.action
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create triggers for automatic audit logging

-- Trigger function for compliance_workers table
CREATE OR REPLACE FUNCTION public.audit_compliance_workers()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  current_tenant_id UUID;
BEGIN
  -- Get current user and tenant from session
  current_user_id := auth.uid();
  
  IF current_user_id IS NOT NULL THEN
    SELECT tenant_id INTO current_tenant_id FROM public.users WHERE id = current_user_id;
  END IF;
  
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      current_tenant_id,
      current_user_id,
      'worker_created',
      jsonb_build_object(
        'worker_name', NEW.name,
        'job_title', NEW.job_title,
        'soc_code', NEW.soc_code,
        'compliance_status', NEW.compliance_status
      ),
      NULL,
      NULL,
      'compliance_worker',
      NEW.id::TEXT,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      current_tenant_id,
      current_user_id,
      'worker_updated',
      jsonb_build_object(
        'worker_name', NEW.name,
        'job_title', NEW.job_title,
        'soc_code', NEW.soc_code,
        'compliance_status', NEW.compliance_status
      ),
      NULL,
      NULL,
      'compliance_worker',
      NEW.id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      current_tenant_id,
      current_user_id,
      'worker_deleted',
      jsonb_build_object(
        'worker_name', OLD.name,
        'job_title', OLD.job_title,
        'soc_code', OLD.soc_code
      ),
      NULL,
      NULL,
      'compliance_worker',
      OLD.id::TEXT,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on compliance_workers table
DROP TRIGGER IF EXISTS audit_compliance_workers_trigger ON public.compliance_workers;
CREATE TRIGGER audit_compliance_workers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.compliance_workers
  FOR EACH ROW EXECUTE FUNCTION public.audit_compliance_workers();

-- Trigger function for user_roles table
CREATE OR REPLACE FUNCTION public.audit_user_roles()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  current_tenant_id UUID;
BEGIN
  -- Get current user and tenant from session
  current_user_id := auth.uid();
  
  IF current_user_id IS NOT NULL THEN
    SELECT tenant_id INTO current_tenant_id FROM public.users WHERE id = current_user_id;
  END IF;
  
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      current_tenant_id,
      current_user_id,
      'user_role_assigned',
      jsonb_build_object(
        'assigned_user_id', NEW.user_id,
        'role', NEW.role
      ),
      NULL,
      NULL,
      'user_role',
      NEW.user_id::TEXT,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      current_tenant_id,
      current_user_id,
      'user_role_changed',
      jsonb_build_object(
        'assigned_user_id', NEW.user_id,
        'old_role', OLD.role,
        'new_role', NEW.role
      ),
      NULL,
      NULL,
      'user_role',
      NEW.user_id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      current_tenant_id,
      current_user_id,
      'user_role_removed',
      jsonb_build_object(
        'assigned_user_id', OLD.user_id,
        'role', OLD.role
      ),
      NULL,
      NULL,
      'user_role',
      OLD.user_id::TEXT,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user_roles table
DROP TRIGGER IF EXISTS audit_user_roles_trigger ON public.user_roles;
CREATE TRIGGER audit_user_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_user_roles();

-- Step 9: Create function to manually log specific events
CREATE OR REPLACE FUNCTION public.log_document_upload(
  p_tenant_id UUID,
  p_user_id UUID,
  p_document_name TEXT,
  p_document_type TEXT,
  p_file_size INTEGER,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
  RETURN public.log_audit_event(
    p_tenant_id,
    p_user_id,
    'document_uploaded',
    jsonb_build_object(
      'document_name', p_document_name,
      'document_type', p_document_type,
      'file_size', p_file_size
    ),
    p_ip_address,
    p_user_agent,
    'document',
    p_document_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_assessment_run(
  p_tenant_id UUID,
  p_user_id UUID,
  p_assessment_type TEXT,
  p_worker_id UUID,
  p_result TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
  RETURN public.log_audit_event(
    p_tenant_id,
    p_user_id,
    'assessment_run',
    jsonb_build_object(
      'assessment_type', p_assessment_type,
      'worker_id', p_worker_id,
      'result', p_result
    ),
    p_ip_address,
    p_user_agent,
    'assessment',
    p_worker_id::TEXT
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_narrative_generation(
  p_tenant_id UUID,
  p_user_id UUID,
  p_worker_name TEXT,
  p_narrative_length INTEGER,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
  RETURN public.log_audit_event(
    p_tenant_id,
    p_user_id,
    'narrative_generated',
    jsonb_build_object(
      'worker_name', p_worker_name,
      'narrative_length', p_narrative_length
    ),
    p_ip_address,
    p_user_agent,
    'narrative',
    p_worker_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create function to clean old audit logs
CREATE OR REPLACE FUNCTION public.clean_old_audit_logs(
  p_days_to_keep INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs 
  WHERE timestamp < NOW() - INTERVAL '1 day' * p_days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create scheduled job to clean old logs (optional)
-- This would be set up in your database scheduler (e.g., pg_cron)
-- SELECT cron.schedule('clean-audit-logs', '0 2 * * 0', 'SELECT public.clean_old_audit_logs(365);'); 