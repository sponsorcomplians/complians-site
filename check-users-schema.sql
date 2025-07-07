-- Check users table schema to see if role column exists
-- Run this in Supabase SQL Editor first

-- Check if role column exists in users table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'role';

-- Check all columns in users table for reference
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check if user_roles table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'user_roles';

-- Check user_roles table structure if it exists
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position; 