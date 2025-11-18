-- Fix user roles - only Brendon Dalaba should be admin
-- Run this in your Supabase SQL Editor

-- First, let's see what users we currently have
SELECT id, email, full_name, role FROM users ORDER BY email;

-- Set everyone to 'user' role first
UPDATE users SET role = 'user';

-- Then set only Brendon Dalaba as admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'brendon.dalaba@snellersg.com' 
   OR full_name = 'Brendon Dalaba'
   OR email ILIKE '%brendon%';

-- Verify the changes
SELECT id, email, full_name, role FROM users ORDER BY email;