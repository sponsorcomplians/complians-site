-- Tenant Usage Metrics Migration Script
-- This script creates the tenant_usage_metrics table and related analytics functionality

-- Step 1: Create tenant_usage_metrics table
CREATE TABLE IF NOT EXISTS public.tenant_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  date DATE NOT NULL,
  documents_uploaded INTEGER DEFAULT 0,
  assessments_run INTEGER DEFAULT 0,
  narratives_generated INTEGER DEFAULT 0,
  compliance_reports_generated INTEGER DEFAULT 0,
  workers_added INTEGER DEFAULT 0,
  alerts_created INTEGER DEFAULT 0,
  remediation_actions_created INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, date)
);

-- Step 2: Add foreign key constraint
ALTER TABLE public.tenant_usage_metrics 
ADD CONSTRAINT fk_tenant_usage_metrics_tenant 
FOREIGN KEY (tenant_id) REFERENCES public.users(tenant_id) ON DELETE CASCADE;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_usage_metrics_tenant_id ON public.tenant_usage_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_metrics_date ON public.tenant_usage_metrics(date);
CREATE INDEX IF NOT EXISTS idx_tenant_usage_metrics_tenant_date ON public.tenant_usage_metrics(tenant_id, date);

-- Step 4: Enable RLS on tenant_usage_metrics table
ALTER TABLE public.tenant_usage_metrics ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for tenant_usage_metrics
CREATE POLICY "Tenant users can view their own usage metrics" ON public.tenant_usage_metrics
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert usage metrics" ON public.tenant_usage_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update usage metrics" ON public.tenant_usage_metrics
  FOR UPDATE USING (true);

-- Step 6: Create function to get tenant metrics for a date range
CREATE OR REPLACE FUNCTION public.get_tenant_metrics(
  tenant_uuid UUID,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  date DATE,
  documents_uploaded INTEGER,
  assessments_run INTEGER,
  narratives_generated INTEGER,
  compliance_reports_generated INTEGER,
  workers_added INTEGER,
  alerts_created INTEGER,
  remediation_actions_created INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.date,
    COALESCE(tm.documents_uploaded, 0) as documents_uploaded,
    COALESCE(tm.assessments_run, 0) as assessments_run,
    COALESCE(tm.narratives_generated, 0) as narratives_generated,
    COALESCE(tm.compliance_reports_generated, 0) as compliance_reports_generated,
    COALESCE(tm.workers_added, 0) as workers_added,
    COALESCE(tm.alerts_created, 0) as alerts_created,
    COALESCE(tm.remediation_actions_created, 0) as remediation_actions_created
  FROM generate_series(start_date, end_date, '1 day'::interval)::date as d
  LEFT JOIN public.tenant_usage_metrics tm ON tm.date = d AND tm.tenant_id = tenant_uuid
  ORDER BY d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create function to get tenant metrics summary
CREATE OR REPLACE FUNCTION public.get_tenant_metrics_summary(
  tenant_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_documents_uploaded BIGINT,
  total_assessments_run BIGINT,
  total_narratives_generated BIGINT,
  total_compliance_reports_generated BIGINT,
  total_workers_added BIGINT,
  total_alerts_created BIGINT,
  total_remediation_actions_created BIGINT,
  avg_daily_documents DECIMAL,
  avg_daily_assessments DECIMAL,
  avg_daily_narratives DECIMAL,
  avg_daily_reports DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(tm.documents_uploaded), 0) as total_documents_uploaded,
    COALESCE(SUM(tm.assessments_run), 0) as total_assessments_run,
    COALESCE(SUM(tm.narratives_generated), 0) as total_narratives_generated,
    COALESCE(SUM(tm.compliance_reports_generated), 0) as total_compliance_reports_generated,
    COALESCE(SUM(tm.workers_added), 0) as total_workers_added,
    COALESCE(SUM(tm.alerts_created), 0) as total_alerts_created,
    COALESCE(SUM(tm.remediation_actions_created), 0) as total_remediation_actions_created,
    COALESCE(AVG(tm.documents_uploaded), 0) as avg_daily_documents,
    COALESCE(AVG(tm.assessments_run), 0) as avg_daily_assessments,
    COALESCE(AVG(tm.narratives_generated), 0) as avg_daily_narratives,
    COALESCE(AVG(tm.compliance_reports_generated), 0) as avg_daily_reports
  FROM public.tenant_usage_metrics tm
  WHERE tm.tenant_id = tenant_uuid
  AND tm.date >= CURRENT_DATE - days_back;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create function to get compliance trends
CREATE OR REPLACE FUNCTION public.get_compliance_trends(
  tenant_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  compliant_count INTEGER,
  breach_count INTEGER,
  serious_breach_count INTEGER,
  total_workers INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(cw.created_at) as date,
    COUNT(CASE WHEN cw.compliance_status = 'COMPLIANT' THEN 1 END) as compliant_count,
    COUNT(CASE WHEN cw.compliance_status = 'BREACH' THEN 1 END) as breach_count,
    COUNT(CASE WHEN cw.compliance_status = 'SERIOUS_BREACH' THEN 1 END) as serious_breach_count,
    COUNT(*) as total_workers
  FROM public.compliance_workers cw
  WHERE cw.tenant_id = tenant_uuid
  AND cw.created_at >= CURRENT_DATE - days_back
  GROUP BY DATE(cw.created_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create function to get breach breakdown by type
CREATE OR REPLACE FUNCTION public.get_breach_breakdown(
  tenant_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  breach_type TEXT,
  breach_count INTEGER,
  serious_breach_count INTEGER,
  total_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ca.breach_type, 'Unknown') as breach_type,
    COUNT(CASE WHEN ca.compliance_status = 'BREACH' THEN 1 END) as breach_count,
    COUNT(CASE WHEN ca.compliance_status = 'SERIOUS_BREACH' THEN 1 END) as serious_breach_count,
    COUNT(*) as total_count
  FROM public.compliance_assessments ca
  WHERE ca.tenant_id = tenant_uuid
  AND ca.created_at >= CURRENT_DATE - days_back
  AND ca.compliance_status IN ('BREACH', 'SERIOUS_BREACH')
  GROUP BY ca.breach_type
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create function to increment usage metrics
CREATE OR REPLACE FUNCTION public.increment_tenant_metric(
  tenant_uuid UUID,
  metric_column TEXT,
  increment_value INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.tenant_usage_metrics (tenant_id, date, documents_uploaded, assessments_run, narratives_generated, compliance_reports_generated, workers_added, alerts_created, remediation_actions_created)
  VALUES (
    tenant_uuid,
    CURRENT_DATE,
    CASE WHEN metric_column = 'documents_uploaded' THEN increment_value ELSE 0 END,
    CASE WHEN metric_column = 'assessments_run' THEN increment_value ELSE 0 END,
    CASE WHEN metric_column = 'narratives_generated' THEN increment_value ELSE 0 END,
    CASE WHEN metric_column = 'compliance_reports_generated' THEN increment_value ELSE 0 END,
    CASE WHEN metric_column = 'workers_added' THEN increment_value ELSE 0 END,
    CASE WHEN metric_column = 'alerts_created' THEN increment_value ELSE 0 END,
    CASE WHEN metric_column = 'remediation_actions_created' THEN increment_value ELSE 0 END
  )
  ON CONFLICT (tenant_id, date)
  DO UPDATE SET
    documents_uploaded = tenant_usage_metrics.documents_uploaded + 
      CASE WHEN metric_column = 'documents_uploaded' THEN increment_value ELSE 0 END,
    assessments_run = tenant_usage_metrics.assessments_run + 
      CASE WHEN metric_column = 'assessments_run' THEN increment_value ELSE 0 END,
    narratives_generated = tenant_usage_metrics.narratives_generated + 
      CASE WHEN metric_column = 'narratives_generated' THEN increment_value ELSE 0 END,
    compliance_reports_generated = tenant_usage_metrics.compliance_reports_generated + 
      CASE WHEN metric_column = 'compliance_reports_generated' THEN increment_value ELSE 0 END,
    workers_added = tenant_usage_metrics.workers_added + 
      CASE WHEN metric_column = 'workers_added' THEN increment_value ELSE 0 END,
    alerts_created = tenant_usage_metrics.alerts_created + 
      CASE WHEN metric_column = 'alerts_created' THEN increment_value ELSE 0 END,
    remediation_actions_created = tenant_usage_metrics.remediation_actions_created + 
      CASE WHEN metric_column = 'remediation_actions_created' THEN increment_value ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create triggers to automatically track usage metrics

-- Trigger function for compliance workers
CREATE OR REPLACE FUNCTION public.track_worker_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_tenant_metric(NEW.tenant_id, 'workers_added');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for compliance workers
CREATE TRIGGER track_worker_metrics_trigger
  AFTER INSERT ON public.compliance_workers
  FOR EACH ROW EXECUTE FUNCTION public.track_worker_metrics();

-- Trigger function for compliance assessments
CREATE OR REPLACE FUNCTION public.track_assessment_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_tenant_metric(NEW.tenant_id, 'assessments_run');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for compliance assessments
CREATE TRIGGER track_assessment_metrics_trigger
  AFTER INSERT ON public.compliance_assessments
  FOR EACH ROW EXECUTE FUNCTION public.track_assessment_metrics();

-- Trigger function for compliance reports
CREATE OR REPLACE FUNCTION public.track_report_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_tenant_metric(NEW.tenant_id, 'compliance_reports_generated');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for compliance reports
CREATE TRIGGER track_report_metrics_trigger
  AFTER INSERT ON public.compliance_reports
  FOR EACH ROW EXECUTE FUNCTION public.track_report_metrics();

-- Trigger function for alerts
CREATE OR REPLACE FUNCTION public.track_alert_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_tenant_metric(NEW.tenant_id, 'alerts_created');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for alerts
CREATE TRIGGER track_alert_metrics_trigger
  AFTER INSERT ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.track_alert_metrics();

-- Trigger function for remediation actions
CREATE OR REPLACE FUNCTION public.track_remediation_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_tenant_metric(NEW.tenant_id, 'remediation_actions_created');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for remediation actions
CREATE TRIGGER track_remediation_metrics_trigger
  AFTER INSERT ON public.remediation_actions
  FOR EACH ROW EXECUTE FUNCTION public.track_remediation_metrics();

-- Step 12: Create function to get top performing tenants (for admin analytics)
CREATE OR REPLACE FUNCTION public.get_top_performing_tenants(
  days_back INTEGER DEFAULT 30,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  tenant_id UUID,
  company_name TEXT,
  total_assessments BIGINT,
  total_reports BIGINT,
  avg_compliance_score DECIMAL,
  total_workers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.tenant_id,
    u.company as company_name,
    COALESCE(SUM(tm.assessments_run), 0) as total_assessments,
    COALESCE(SUM(tm.compliance_reports_generated), 0) as total_reports,
    COALESCE(AVG(cw.global_risk_score), 0) as avg_compliance_score,
    COUNT(DISTINCT cw.id) as total_workers
  FROM public.users u
  LEFT JOIN public.tenant_usage_metrics tm ON u.tenant_id = tm.tenant_id 
    AND tm.date >= CURRENT_DATE - days_back
  LEFT JOIN public.compliance_workers cw ON u.tenant_id = cw.tenant_id
  GROUP BY u.tenant_id, u.company
  ORDER BY total_assessments DESC, total_reports DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Create trigger to update updated_at timestamp
CREATE TRIGGER handle_updated_at_tenant_usage_metrics
  BEFORE UPDATE ON public.tenant_usage_metrics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at(); 