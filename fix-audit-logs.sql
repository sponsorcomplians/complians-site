-- Fix audit_logs table structure
-- Add missing details column

-- Check if details column exists, if not add it
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