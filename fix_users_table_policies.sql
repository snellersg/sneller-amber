-- Fix infinite recursion in users table RLS policies
-- Run this in your Supabase SQL Editor

-- First, drop all existing policies on the users table to clear recursion
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON users;
DROP POLICY IF EXISTS "Allow admins to manage users" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "admin_all_access" ON users;

-- Disable RLS temporarily to clear any recursive issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Allow ALL authenticated users to read all users (simple approach for admin panel)
CREATE POLICY "authenticated_read_all_users" ON users
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to update their own profile only
CREATE POLICY "users_update_own_profile" ON users
    FOR UPDATE
    TO authenticated
    USING (auth.email() = email)
    WITH CHECK (auth.email() = email);

-- Allow new user insertion
CREATE POLICY "allow_user_insert" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT ON users TO anon;