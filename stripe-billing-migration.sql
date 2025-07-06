-- Stripe Billing Integration Migration Script
-- This script adds Stripe billing capabilities to the tenant system

-- Step 1: Add Stripe fields to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing')),
ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT 'free' CHECK (current_plan IN ('free', 'starter', 'professional', 'enterprise')),
ADD COLUMN IF NOT EXISTS plan_limits JSONB DEFAULT '{"workers": 5, "assessments_per_month": 50, "reports_per_month": 10, "narratives_per_month": 25}'::jsonb,
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS next_billing_date DATE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Step 2: Create billing_plans table
CREATE TABLE IF NOT EXISTS public.billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT,
  monthly_price DECIMAL(10,2),
  yearly_price DECIMAL(10,2),
  plan_limits JSONB NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create usage_billing table for tracking overages
CREATE TABLE IF NOT EXISTS public.usage_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('workers', 'assessments', 'reports', 'narratives')),
  usage_count INTEGER NOT NULL DEFAULT 0,
  plan_limit INTEGER NOT NULL DEFAULT 0,
  overage_count INTEGER NOT NULL DEFAULT 0,
  overage_rate DECIMAL(10,4) NOT NULL DEFAULT 0,
  overage_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  stripe_invoice_id TEXT,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, billing_period_start, metric_type)
);

-- Step 4: Create billing_events table for audit trail
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('subscription_created', 'subscription_updated', 'subscription_canceled', 'payment_succeeded', 'payment_failed', 'usage_recorded', 'overage_charged')),
  stripe_event_id TEXT,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Add foreign key constraints
ALTER TABLE public.usage_billing 
ADD CONSTRAINT fk_usage_billing_tenant 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.billing_events 
ADD CONSTRAINT fk_billing_events_tenant 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer_id ON public.tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON public.tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenants_current_plan ON public.tenants(current_plan);
CREATE INDEX IF NOT EXISTS idx_usage_billing_tenant_period ON public.usage_billing(tenant_id, billing_period_start);
CREATE INDEX IF NOT EXISTS idx_billing_events_tenant_type ON public.billing_events(tenant_id, event_type);

-- Step 7: Enable RLS on new tables
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
-- Billing plans are readable by all authenticated users
CREATE POLICY "Billing plans are readable by all users" ON public.billing_plans
  FOR SELECT USING (true);

-- Usage billing is tenant-specific
CREATE POLICY "Tenant users can view their own usage billing" ON public.usage_billing
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can manage usage billing" ON public.usage_billing
  FOR ALL USING (true);

-- Billing events are tenant-specific
CREATE POLICY "Tenant users can view their own billing events" ON public.billing_events
  FOR SELECT USING (
    tenant_id = (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can manage billing events" ON public.billing_events
  FOR ALL USING (true);

-- Step 9: Insert default billing plans
INSERT INTO public.billing_plans (plan_name, stripe_price_id, monthly_price, yearly_price, plan_limits, features) VALUES
('free', NULL, 0, 0, 
  '{"workers": 5, "assessments_per_month": 50, "reports_per_month": 10, "narratives_per_month": 25}'::jsonb,
  '{"ai_agents": ["basic"], "support": "email", "analytics": false}'::jsonb
),
('starter', 'price_starter_monthly', 29.99, 299.99,
  '{"workers": 25, "assessments_per_month": 250, "reports_per_month": 50, "narratives_per_month": 125}'::jsonb,
  '{"ai_agents": ["all"], "support": "email", "analytics": true, "priority_support": false}'::jsonb
),
('professional', 'price_professional_monthly', 79.99, 799.99,
  '{"workers": 100, "assessments_per_month": 1000, "reports_per_month": 200, "narratives_per_month": 500}'::jsonb,
  '{"ai_agents": ["all"], "support": "priority", "analytics": true, "priority_support": true, "custom_integrations": false}'::jsonb
),
('enterprise', 'price_enterprise_monthly', 199.99, 1999.99,
  '{"workers": 500, "assessments_per_month": 5000, "reports_per_month": 1000, "narratives_per_month": 2500}'::jsonb,
  '{"ai_agents": ["all"], "support": "dedicated", "analytics": true, "priority_support": true, "custom_integrations": true, "sla": true}'::jsonb
)
ON CONFLICT (plan_name) DO NOTHING;

-- Step 10: Create function to get current usage for a tenant
CREATE OR REPLACE FUNCTION public.get_tenant_current_usage(
  tenant_uuid UUID,
  billing_period_start DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE
)
RETURNS TABLE (
  metric_type TEXT,
  usage_count INTEGER,
  plan_limit INTEGER,
  overage_count INTEGER,
  overage_amount DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'workers' as metric_type,
    COUNT(cw.id)::INTEGER as usage_count,
    (t.plan_limits->>'workers')::INTEGER as plan_limit,
    GREATEST(COUNT(cw.id) - (t.plan_limits->>'workers')::INTEGER, 0) as overage_count,
    0.00 as overage_amount
  FROM public.tenants t
  LEFT JOIN public.compliance_workers cw ON t.id = cw.tenant_id
  WHERE t.id = tenant_uuid
  GROUP BY t.plan_limits
  
  UNION ALL
  
  SELECT 
    'assessments' as metric_type,
    COALESCE(SUM(tm.assessments_run), 0)::INTEGER as usage_count,
    (t.plan_limits->>'assessments_per_month')::INTEGER as plan_limit,
    GREATEST(COALESCE(SUM(tm.assessments_run), 0) - (t.plan_limits->>'assessments_per_month')::INTEGER, 0) as overage_count,
    0.00 as overage_amount
  FROM public.tenants t
  LEFT JOIN public.tenant_usage_metrics tm ON t.id = tm.tenant_id 
    AND tm.date >= billing_period_start
  WHERE t.id = tenant_uuid
  GROUP BY t.plan_limits
  
  UNION ALL
  
  SELECT 
    'reports' as metric_type,
    COALESCE(SUM(tm.compliance_reports_generated), 0)::INTEGER as usage_count,
    (t.plan_limits->>'reports_per_month')::INTEGER as plan_limit,
    GREATEST(COALESCE(SUM(tm.compliance_reports_generated), 0) - (t.plan_limits->>'reports_per_month')::INTEGER, 0) as overage_count,
    0.00 as overage_amount
  FROM public.tenants t
  LEFT JOIN public.tenant_usage_metrics tm ON t.id = tm.tenant_id 
    AND tm.date >= billing_period_start
  WHERE t.id = tenant_uuid
  GROUP BY t.plan_limits
  
  UNION ALL
  
  SELECT 
    'narratives' as metric_type,
    COALESCE(SUM(tm.narratives_generated), 0)::INTEGER as usage_count,
    (t.plan_limits->>'narratives_per_month')::INTEGER as plan_limit,
    GREATEST(COALESCE(SUM(tm.narratives_generated), 0) - (t.plan_limits->>'narratives_per_month')::INTEGER, 0) as overage_count,
    0.00 as overage_amount
  FROM public.tenants t
  LEFT JOIN public.tenant_usage_metrics tm ON t.id = tm.tenant_id 
    AND tm.date >= billing_period_start
  WHERE t.id = tenant_uuid
  GROUP BY t.plan_limits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create function to record usage billing
CREATE OR REPLACE FUNCTION public.record_usage_billing(
  tenant_uuid UUID,
  billing_period_start DATE,
  billing_period_end DATE
)
RETURNS VOID AS $$
DECLARE
  usage_record RECORD;
  overage_rate DECIMAL(10,4);
BEGIN
  -- Get overage rates from plan
  SELECT 
    CASE 
      WHEN current_plan = 'free' THEN 0.50
      WHEN current_plan = 'starter' THEN 0.25
      WHEN current_plan = 'professional' THEN 0.15
      WHEN current_plan = 'enterprise' THEN 0.10
      ELSE 0.50
    END INTO overage_rate
  FROM public.tenants 
  WHERE id = tenant_uuid;

  -- Insert or update usage billing records
  FOR usage_record IN 
    SELECT * FROM public.get_tenant_current_usage(tenant_uuid, billing_period_start)
  LOOP
    INSERT INTO public.usage_billing (
      tenant_id, 
      billing_period_start, 
      billing_period_end, 
      metric_type, 
      usage_count, 
      plan_limit, 
      overage_count, 
      overage_rate, 
      overage_amount
    ) VALUES (
      tenant_uuid,
      billing_period_start,
      billing_period_end,
      usage_record.metric_type,
      usage_record.usage_count,
      usage_record.plan_limit,
      usage_record.overage_count,
      overage_rate,
      usage_record.overage_count * overage_rate
    )
    ON CONFLICT (tenant_id, billing_period_start, metric_type)
    DO UPDATE SET
      usage_count = EXCLUDED.usage_count,
      plan_limit = EXCLUDED.plan_limit,
      overage_count = EXCLUDED.overage_count,
      overage_amount = EXCLUDED.overage_amount,
      updated_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Create function to check if tenant can perform action
CREATE OR REPLACE FUNCTION public.can_perform_action(
  tenant_uuid UUID,
  action_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage RECORD;
  plan_limit INTEGER;
  current_count INTEGER;
BEGIN
  -- Get current plan limits
  SELECT 
    CASE action_type
      WHEN 'add_worker' THEN (plan_limits->>'workers')::INTEGER
      WHEN 'run_assessment' THEN (plan_limits->>'assessments_per_month')::INTEGER
      WHEN 'generate_report' THEN (plan_limits->>'reports_per_month')::INTEGER
      WHEN 'generate_narrative' THEN (plan_limits->>'narratives_per_month')::INTEGER
      ELSE 0
    END INTO plan_limit
  FROM public.tenants 
  WHERE id = tenant_uuid;

  -- Get current usage for the month
  SELECT 
    CASE action_type
      WHEN 'add_worker' THEN COUNT(cw.id)
      WHEN 'run_assessment' THEN COALESCE(SUM(tm.assessments_run), 0)
      WHEN 'generate_report' THEN COALESCE(SUM(tm.compliance_reports_generated), 0)
      WHEN 'generate_narrative' THEN COALESCE(SUM(tm.narratives_generated), 0)
      ELSE 0
    END INTO current_count
  FROM public.tenants t
  LEFT JOIN public.compliance_workers cw ON t.id = cw.tenant_id AND action_type = 'add_worker'
  LEFT JOIN public.tenant_usage_metrics tm ON t.id = tm.tenant_id 
    AND tm.date >= DATE_TRUNC('month', CURRENT_DATE)::DATE
    AND action_type IN ('run_assessment', 'generate_report', 'generate_narrative')
  WHERE t.id = tenant_uuid;

  -- Check if subscription is active
  IF NOT EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE id = tenant_uuid 
    AND subscription_status IN ('active', 'trialing')
  ) THEN
    RETURN FALSE;
  END IF;

  -- Allow if under limit or if plan allows overages
  RETURN current_count < plan_limit OR plan_limit = -1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Create function to get billing summary
CREATE OR REPLACE FUNCTION public.get_billing_summary(
  tenant_uuid UUID
)
RETURNS TABLE (
  current_plan TEXT,
  subscription_status TEXT,
  next_billing_date DATE,
  current_period_usage JSONB,
  total_overage_amount DECIMAL(10,2),
  plan_limits JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.current_plan,
    t.subscription_status,
    t.next_billing_date,
    (
      SELECT jsonb_object_agg(usage.metric_type, jsonb_build_object(
        'usage_count', usage.usage_count,
        'plan_limit', usage.plan_limit,
        'overage_count', usage.overage_count
      ))
      FROM public.get_tenant_current_usage(tenant_uuid) usage
    ) as current_period_usage,
    COALESCE(SUM(ub.overage_amount), 0) as total_overage_amount,
    t.plan_limits
  FROM public.tenants t
  LEFT JOIN public.usage_billing ub ON t.id = ub.tenant_id 
    AND ub.billing_period_start = DATE_TRUNC('month', CURRENT_DATE)::DATE
    AND ub.is_paid = false
  WHERE t.id = tenant_uuid
  GROUP BY t.current_plan, t.subscription_status, t.next_billing_date, t.plan_limits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 14: Create trigger to update updated_at timestamp
CREATE TRIGGER handle_updated_at_billing_plans
  BEFORE UPDATE ON public.billing_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_usage_billing
  BEFORE UPDATE ON public.usage_billing
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at(); 