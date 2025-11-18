-- Complete fix for infinite recursion in users table RLS policies
-- Run this in your Supabase SQL Editor

-- First, let's completely disable RLS and drop ALL policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all possible policies (including any we might have missed)
DO $$ 
DECLARE 
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT pol.polname 
        FROM pg_policy pol 
        JOIN pg_class cls ON pol.polrelid = cls.oid 
        WHERE cls.relname = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', policy_name);
    END LOOP;
END $$;

-- Also check for any functions that might be causing recursion
-- Drop any custom functions that might reference the users table recursively
-- (You may need to adjust this based on your specific setup)

-- Now let's start fresh with RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create extremely simple policies to avoid any recursion
-- Allow authenticated users to read all users
CREATE POLICY "simple_read_policy" ON users
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to insert (for registration)
CREATE POLICY "simple_insert_policy" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update their own record only (using auth.email())
CREATE POLICY "simple_update_policy" ON users
    FOR UPDATE
    TO authenticated
    USING (email = auth.email())
    WITH CHECK (email = auth.email());

-- Grant permissions
GRANT ALL ON users TO authenticated;
GRANT SELECT ON users TO anon;

-- Let's also make sure there are no triggers or functions causing issues
-- Check if there are any triggers on the users table
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgrelid = 'users'::regclass 
AND tgname NOT LIKE 'RI_%';  -- Exclude foreign key triggers