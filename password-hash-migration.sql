-- Password Hash Migration
-- This script updates the users table to use password_hash consistently

-- 1. Add password_hash column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
    ALTER TABLE users ADD COLUMN password_hash TEXT;
    RAISE NOTICE 'Added password_hash column to users table';
  ELSE
    RAISE NOTICE 'password_hash column already exists in users table';
  END IF;
END $$;

-- 2. Copy data from password column to password_hash if password column exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN
    -- Copy existing password data to password_hash
    UPDATE users 
    SET password_hash = password 
    WHERE password IS NOT NULL AND password_hash IS NULL;
    
    RAISE NOTICE 'Copied password data to password_hash column';
    
    -- Remove the password column
    ALTER TABLE users DROP COLUMN password;
    RAISE NOTICE 'Removed password column from users table';
  ELSE
    RAISE NOTICE 'password column does not exist, no data migration needed';
  END IF;
END $$;

-- 3. Add index on password_hash for performance
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON users(password_hash);

-- 4. Add comment for documentation
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for user authentication';

-- Migration completed
SELECT 'PASSWORD HASH MIGRATION COMPLETED SUCCESSFULLY' as status; 