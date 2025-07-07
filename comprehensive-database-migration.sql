-- Comprehensive Database Migration Script
-- This script creates all missing tables, functions, and RLS policies

-- 1. Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    max_workers INTEGER DEFAULT 100,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(100),
    passport_number VARCHAR(50),
    position VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
    assessment_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    result JSONB,
    documents JSONB,
    narrative TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL,
    content JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns to existing tables
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE workers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- 3. Create missing functions
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_current_time TIMESTAMP WITH TIME ZONE,
    p_identifier TEXT,
    p_max_attempts INTEGER,
    p_window_ms BIGINT
) RETURNS BOOLEAN AS $$
DECLARE
    attempt_count INTEGER;
BEGIN
    -- Count attempts within the time window
    SELECT COUNT(*) INTO attempt_count
    FROM audit_logs
    WHERE action = 'rate_limit_check'
    AND details->>'identifier' = p_identifier
    AND created_at > (p_current_time - (p_window_ms || ' milliseconds')::INTERVAL);
    
    -- Return true if under limit, false if over limit
    RETURN attempt_count < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_tenant_during_signup(
    tenant_name TEXT,
    tenant_industry TEXT DEFAULT 'general',
    tenant_max_workers INTEGER DEFAULT 100,
    tenant_subscription_plan TEXT DEFAULT 'basic'
) RETURNS UUID AS $$
DECLARE
    new_tenant_id UUID;
BEGIN
    -- Create new tenant
    INSERT INTO tenants (name, industry, max_workers, subscription_plan)
    VALUES (tenant_name, tenant_industry, tenant_max_workers, tenant_subscription_plan)
    RETURNING id INTO new_tenant_id;
    
    RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_tenant_for_signup(
    tenant_name TEXT,
    tenant_industry TEXT DEFAULT 'general',
    tenant_max_workers INTEGER DEFAULT 100,
    tenant_subscription_plan TEXT DEFAULT 'basic'
) RETURNS UUID AS $$
DECLARE
    new_tenant_id UUID;
BEGIN
    -- Create new tenant
    INSERT INTO tenants (name, industry, max_workers, subscription_plan)
    VALUES (tenant_name, tenant_industry, tenant_max_workers, tenant_subscription_plan)
    RETURNING id INTO new_tenant_id;
    
    RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable Row Level Security on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for tenant isolation
-- Tenants policy - users can only see their own tenant
CREATE POLICY "Users can view own tenant" ON tenants
    FOR SELECT USING (id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own tenant" ON tenants
    FOR INSERT WITH CHECK (true);

-- Workers policies
CREATE POLICY "Users can view workers in own tenant" ON workers
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert workers in own tenant" ON workers
    FOR INSERT WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update workers in own tenant" ON workers
    FOR UPDATE USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete workers in own tenant" ON workers
    FOR DELETE USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

-- Assessments policies
CREATE POLICY "Users can view assessments in own tenant" ON assessments
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert assessments in own tenant" ON assessments
    FOR INSERT WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update assessments in own tenant" ON assessments
    FOR UPDATE USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete assessments in own tenant" ON assessments
    FOR DELETE USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

-- Reports policies
CREATE POLICY "Users can view reports in own tenant" ON reports
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert reports in own tenant" ON reports
    FOR INSERT WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update reports in own tenant" ON reports
    FOR UPDATE USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete reports in own tenant" ON reports
    FOR DELETE USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

-- Audit logs policies
CREATE POLICY "Users can view audit logs in own tenant" ON audit_logs
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert audit logs in own tenant" ON audit_logs
    FOR INSERT WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workers_tenant_id ON workers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reports_tenant_id ON reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON tenants TO authenticated;
GRANT ALL ON workers TO authenticated;
GRANT ALL ON assessments TO authenticated;
GRANT ALL ON reports TO authenticated;
GRANT ALL ON audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION create_tenant_during_signup TO authenticated;
GRANT EXECUTE ON FUNCTION create_tenant_for_signup TO authenticated;

-- 8. Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert sample data for testing (optional)
INSERT INTO tenants (name, industry, max_workers, subscription_plan) 
VALUES ('Test Company', 'Technology', 50, 'premium')
ON CONFLICT DO NOTHING; 