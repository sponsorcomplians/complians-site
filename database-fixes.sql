-- Comprehensive Database Fixes for Signup Functionality
-- Run this in your Supabase SQL Editor

-- 1. Fix audit_logs table structure
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audit_logs' 
        AND column_name = 'details'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN details JSONB;
    END IF;
END $$;

-- Update existing audit_logs to have empty details if null
UPDATE audit_logs SET details = '{}' WHERE details IS NULL;

-- Make details column NOT NULL with default
ALTER TABLE audit_logs ALTER COLUMN details SET NOT NULL;
ALTER TABLE audit_logs ALTER COLUMN details SET DEFAULT '{}';

-- 2. Create rate_limits table and function
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_created ON rate_limits(identifier, created_at);

-- Create rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_current_time TIMESTAMP WITH TIME ZONE,
    p_identifier TEXT,
    p_max_attempts INTEGER,
    p_window_ms BIGINT
)
RETURNS TABLE(
    success BOOLEAN,
    remaining INTEGER,
    reset_time TIMESTAMP WITH TIME ZONE,
    retry_after INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    window_start TIMESTAMP WITH TIME ZONE;
    current_count INTEGER;
    reset_time_val TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate window start time
    window_start := p_current_time - (p_window_ms || ' milliseconds')::INTERVAL;
    
    -- Get current count for this identifier in the window
    SELECT COUNT(*) INTO current_count
    FROM rate_limits
    WHERE identifier = p_identifier
    AND created_at >= window_start;
    
    -- Calculate reset time
    reset_time_val := p_current_time + (p_window_ms || ' milliseconds')::INTERVAL;
    
    -- Check if limit exceeded
    IF current_count >= p_max_attempts THEN
        RETURN QUERY SELECT 
            FALSE as success,
            0 as remaining,
            reset_time_val as reset_time,
            EXTRACT(EPOCH FROM (reset_time_val - p_current_time))::INTEGER as retry_after;
    ELSE
        -- Record this attempt
        INSERT INTO rate_limits (identifier, created_at)
        VALUES (p_identifier, p_current_time);
        
        RETURN QUERY SELECT 
            TRUE as success,
            p_max_attempts - current_count - 1 as remaining,
            reset_time_val as reset_time,
            NULL::INTEGER as retry_after;
    END IF;
END;
$$;

-- 3. Fix RLS policies for tenants table
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin users can manage tenants" ON tenants;
DROP POLICY IF EXISTS "Admin users can view all tenants" ON tenants;

-- Create new policies that allow tenant creation during signup
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

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION check_rate_limit(TIMESTAMP WITH TIME ZONE, TEXT, INTEGER, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(TIMESTAMP WITH TIME ZONE, TEXT, INTEGER, BIGINT) TO anon;
GRANT ALL ON rate_limits TO authenticated;
GRANT ALL ON rate_limits TO anon;

-- 5. Enable RLS on rate_limits table
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for rate_limits
CREATE POLICY "Allow rate limit operations" ON rate_limits
  FOR ALL USING (true);

-- 6. Clean up old rate limit records (optional)
DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '24 hours'; 