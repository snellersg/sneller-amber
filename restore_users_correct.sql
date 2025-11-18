-- Correct data restoration script based on actual table structure
-- Run this in your Supabase SQL Editor

-- First, let's see what users we currently have
SELECT id, email, full_name, created_at, role, status FROM users ORDER BY created_at;

-- Now let's get the unique users from the backup audit log
SELECT DISTINCT 
    target_user_email,
    MIN(created_at) as first_action_date,
    COUNT(*) as total_actions
FROM admin_audit_log_backup 
WHERE target_user_email IS NOT NULL
GROUP BY target_user_email
ORDER BY first_action_date;

-- Insert missing users from the audit log backup into the users table
-- These are users who had actions taken on them but aren't in the users table
INSERT INTO users (id, email, full_name, created_at, role, status, last_sign_in_at)
SELECT DISTINCT 
    backup.target_user_id::uuid,  -- Cast to UUID
    backup.target_user_email,
    -- Extract name from email (before @)
    SPLIT_PART(backup.target_user_email, '@', 1) as full_name,
    MIN(backup.created_at) as created_at,
    'user' as role,
    CASE 
        WHEN backup.action_type = 'user_approved' THEN 'active'
        ELSE 'pending'
    END as status,
    NULL::timestamp with time zone as last_sign_in_at  -- Cast NULL to proper type
FROM admin_audit_log_backup backup
LEFT JOIN users ON users.email = backup.target_user_email
WHERE users.email IS NULL 
  AND backup.target_user_email IS NOT NULL 
  AND backup.target_user_id IS NOT NULL
GROUP BY backup.target_user_id, backup.target_user_email, backup.action_type
ON CONFLICT (email) DO NOTHING;  -- Ignore if user already exists

-- Also add the admin user if not exists (using INSERT ... ON CONFLICT)
INSERT INTO users (id, email, full_name, created_at, role, status, last_sign_in_at)
SELECT DISTINCT 
    '31819f97-868b-4f17-ba13-92f0bb85e07f'::uuid as id,  -- Cast to UUID
    'brendon.dalaba@snellersg.com' as email,
    'Brendon Dalaba' as full_name,
    MIN(created_at) as created_at,
    'admin' as role,
    'active' as status,
    NULL::timestamp with time zone as last_sign_in_at  -- Cast NULL to proper type
FROM admin_audit_log_backup
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    status = 'active',
    full_name = 'Brendon Dalaba';

-- Update user statuses based on audit log actions
UPDATE users 
SET status = 'active'
WHERE email IN (
    SELECT DISTINCT target_user_email 
    FROM admin_audit_log_backup 
    WHERE action_type = 'user_approved'
);

-- Show final results
SELECT id, email, full_name, created_at, role, status, last_sign_in_at FROM users ORDER BY created_at;