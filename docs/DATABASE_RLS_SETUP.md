# 🔒 Database RLS Policy Setup

This guide fixes the issue where new users can't see the Active Accounts list.

## The Problem

New users are getting permission denied errors when trying to view accounts because the `active_accounts` table doesn't have proper Row Level Security (RLS) policies configured.

## The Solution

Run these SQL commands in your Supabase SQL Editor to set up proper RLS policies:

### 1. Enable RLS and Create Policies for active_accounts

```sql
-- Enable RLS on active_accounts table
ALTER TABLE active_accounts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all active accounts
CREATE POLICY "Allow authenticated users to read active accounts" 
ON active_accounts 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to update active accounts (for editing property details)
CREATE POLICY "Allow authenticated users to update active accounts" 
ON active_accounts 
FOR UPDATE 
TO authenticated 
USING (true);
```

### 2. Restrict write access to admins only (RECOMMENDED)

Since we now want only admins to edit property details, update the policies:

```sql
-- Enable RLS on active_accounts table
ALTER TABLE active_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert active accounts" ON active_accounts;
DROP POLICY IF EXISTS "Authenticated users can update active accounts" ON active_accounts;
DROP POLICY IF EXISTS "Authenticated users can delete active accounts" ON active_accounts;

-- Allow all authenticated users to read active accounts
CREATE POLICY "Allow authenticated users to read active accounts" 
ON active_accounts 
FOR SELECT 
TO authenticated 
USING (true);

-- Only allow admins to insert new accounts
CREATE POLICY "Allow admins to insert active accounts" 
ON active_accounts 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
  )
);

-- Only allow admins to update accounts
CREATE POLICY "Allow admins to update active accounts" 
ON active_accounts 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
  )
);

-- Only allow admins to delete accounts
CREATE POLICY "Allow admins to delete active accounts" 
ON active_accounts 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
  )
);
```

### 3. Check if policies are working

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'active_accounts';

-- List all policies for active_accounts
SELECT * FROM pg_policies 
WHERE tablename = 'active_accounts';
```

## How to Apply These Fixes

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the SQL from **Section 1** above (for basic access) or **Section 2** (for admin-controlled access)
5. Click **Run** or press Ctrl+Enter
6. You should see "Success. No rows returned" for each policy creation

## Testing the Fix

1. Have the user refresh the Active Accounts page
2. The accounts list should now populate
3. Check the browser console (F12) for any remaining errors
4. If you used Section 2 policies, verify that regular users can read but admins can edit

## Alternative: Temporary Fix (If Above Doesn't Work)

If the policies above don't work immediately, you can temporarily disable RLS:

```sql
-- TEMPORARY: Disable RLS (NOT RECOMMENDED for production)
ALTER TABLE active_accounts DISABLE ROW LEVEL SECURITY;
```

**⚠️ Warning**: Only use this as a temporary fix. Re-enable RLS with proper policies as soon as possible.

## Additional Tables That May Need Policies

If you have other tables that users should access, apply similar policies:

```sql
-- Example for any other tables users need to read
ALTER TABLE your_table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read your_table_name" 
ON your_table_name 
FOR SELECT 
TO authenticated 
USING (true);
```

## Verification

After applying the policies, the user should:
- ✅ See the accounts list populate
- ✅ Be able to view property details
- ✅ Be able to edit property information (if using Section 1 policies)
- ✅ See proper error messages if authentication fails (instead of generic permission denied)

## Need Help?

If you're still seeing issues after applying these policies:
1. Check the browser console for specific error messages
2. Verify the user is properly authenticated
3. Test with a fresh browser session
4. Check the Supabase logs in the dashboard