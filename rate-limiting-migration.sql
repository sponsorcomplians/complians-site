-- Rate Limiting Migration
-- This migration adds PostgreSQL-based rate limiting functions

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  identifier TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  reset_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time ON public.rate_limits(reset_time);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies (only system can access)
CREATE POLICY "System can manage rate limits" ON public.rate_limits
  FOR ALL USING (true);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_ms BIGINT DEFAULT 900000, -- 15 minutes
  p_current_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  success BOOLEAN,
  remaining INTEGER,
  reset_time TIMESTAMP WITH TIME ZONE,
  retry_after INTEGER
) AS $$
DECLARE
  v_record RECORD;
  v_reset_time TIMESTAMP WITH TIME ZONE;
  v_count INTEGER;
BEGIN
  -- Calculate reset time
  v_reset_time := p_current_time + (p_window_ms || ' milliseconds')::INTERVAL;
  
  -- Try to get existing record
  SELECT * INTO v_record
  FROM public.rate_limits
  WHERE identifier = p_identifier;
  
  -- If no record exists or reset time has passed, create new record
  IF v_record IS NULL OR p_current_time > v_record.reset_time THEN
    -- Delete old record if exists
    DELETE FROM public.rate_limits WHERE identifier = p_identifier;
    
    -- Insert new record
    INSERT INTO public.rate_limits (identifier, count, reset_time)
    VALUES (p_identifier, 1, v_reset_time);
    
    RETURN QUERY SELECT
      TRUE as success,
      p_max_attempts - 1 as remaining,
      v_reset_time as reset_time,
      NULL::INTEGER as retry_after;
    
    RETURN;
  END IF;
  
  -- Check if limit exceeded
  IF v_record.count >= p_max_attempts THEN
    RETURN QUERY SELECT
      FALSE as success,
      0 as remaining,
      v_record.reset_time as reset_time,
      EXTRACT(EPOCH FROM (v_record.reset_time - p_current_time))::INTEGER as retry_after;
    
    RETURN;
  END IF;
  
  -- Increment count
  UPDATE public.rate_limits
  SET count = count + 1, updated_at = p_current_time
  WHERE identifier = p_identifier;
  
  RETURN QUERY SELECT
    TRUE as success,
    p_max_attempts - (v_record.count + 1) as remaining,
    v_record.reset_time as reset_time,
    NULL::INTEGER as retry_after;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset rate limit
CREATE OR REPLACE FUNCTION public.reset_rate_limit(
  p_identifier TEXT
)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE identifier = p_identifier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get rate limit info
CREATE OR REPLACE FUNCTION public.get_rate_limit_info(
  p_identifier TEXT
)
RETURNS TABLE (
  count INTEGER,
  remaining INTEGER,
  reset_time TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_record RECORD;
  v_max_attempts INTEGER := 5; -- Default max attempts
BEGIN
  SELECT * INTO v_record
  FROM public.rate_limits
  WHERE identifier = p_identifier;
  
  IF v_record IS NULL THEN
    RETURN QUERY SELECT
      0 as count,
      v_max_attempts as remaining,
      NOW() as reset_time;
    RETURN;
  END IF;
  
  -- Check if reset time has passed
  IF NOW() > v_record.reset_time THEN
    -- Clean up expired record
    DELETE FROM public.rate_limits WHERE identifier = p_identifier;
    
    RETURN QUERY SELECT
      0 as count,
      v_max_attempts as remaining,
      NOW() as reset_time;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT
    v_record.count as count,
    GREATEST(0, v_max_attempts - v_record.count) as remaining,
    v_record.reset_time as reset_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired rate limits
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits
  WHERE reset_time < NOW();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to cleanup expired rate limits (if using pg_cron)
-- This is optional and depends on your PostgreSQL setup
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT public.cleanup_expired_rate_limits();');

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, BIGINT, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_rate_limit(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_rate_limit_info(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_rate_limits() TO authenticated; 