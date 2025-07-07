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

-- Create rate_limits table if it doesn't exist
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_rate_limits_identifier_created (identifier, created_at)
);

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_rate_limit(TIMESTAMP WITH TIME ZONE, TEXT, INTEGER, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(TIMESTAMP WITH TIME ZONE, TEXT, INTEGER, BIGINT) TO anon;
GRANT ALL ON rate_limits TO authenticated;
GRANT ALL ON rate_limits TO anon; 