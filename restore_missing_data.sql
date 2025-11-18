-- Discover the actual table structure first
-- Run this in your Supabase SQL Editor

-- First, let's see what columns exist in the backup table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_audit_log_backup' 
ORDER BY ordinal_position;

-- Let's also see current users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Show current users to see what we have
SELECT id, email, full_name, created_at, role, status FROM users ORDER BY created_at;

-- Let's see a few rows from the backup table without assuming column names
SELECT * FROM admin_audit_log_backup LIMIT 5;