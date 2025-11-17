# Database Permissions Fix - RLS Policies

## Issue: New Users Can't View Active Accounts

**Symptoms:**
- Admin users can see all active accounts
- New users get empty list or permission errors
- Data loads fine in development but fails for non-admin users in production

**Root Cause:** Row Level Security (RLS) policies on the `active_accounts` table are too restrictive.

## Solution: Update Supabase RLS Policies

### Step 1: Access Supabase SQL Editor
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the sidebar

### Step 2: Check Current RLS Policies
```sql
-- Check if RLS is enabled and view current policies
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'active_accounts';

-- View current policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'active_accounts';
```

### Step 3: Fix RLS Policies for Active Accounts

**Option A: Allow All Authenticated Users (Recommended)**
```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "admin_only_policy" ON active_accounts;
DROP POLICY IF EXISTS "Users can view active accounts based on email domain" ON active_accounts;

-- Create policy to allow all authenticated users to read active accounts
CREATE POLICY "authenticated_users_can_read_active_accounts" 
ON active_accounts 
FOR SELECT 
TO authenticated 
USING (true);
```

**Option B: Domain-Based Access (If you want email domain restriction)**
```sql
-- Allow users with company email domains
CREATE POLICY "company_users_can_read_active_accounts" 
ON active_accounts 
FOR SELECT 
TO authenticated 
USING (
  auth.jwt() ->> 'email' LIKE '%@snellersg.com' OR
  auth.jwt() ->> 'email' LIKE '%@snellerslandscaping.com'
);
```

**Option C: Role-Based Access (Most Secure)**
```sql
-- Create policy based on user metadata roles
CREATE POLICY "role_based_read_active_accounts" 
ON active_accounts 
FOR SELECT 
TO authenticated 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'isAdmin')::boolean = true OR
  (auth.jwt() -> 'user_metadata' ->> 'role')::text IN ('user', 'admin', 'manager')
);
```

### Step 4: Verify the Fix

```sql
-- Test the policy as different users
-- This should return data for authenticated users
SELECT COUNT(*) FROM active_accounts;

-- Check policy is working
SELECT * FROM pg_policies WHERE tablename = 'active_accounts';
```

### Step 5: Set User Roles (if using Option C)

If you chose role-based access, update user metadata:

```sql
-- Update user metadata to include role
UPDATE auth.users 
SET user_metadata = user_metadata || '{"role": "user"}'
WHERE email = 'newuser@snellersg.com';

-- Or for admin role
UPDATE auth.users 
SET user_metadata = user_metadata || '{"role": "admin", "isAdmin": true}'
WHERE email = 'admin@snellersg.com';
```

## Additional Tables to Check

Apply similar policies to related tables:

```sql
-- Check what other tables might need similar policies
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT LIKE 'pg_%' 
AND tablename NOT LIKE 'information_schema%';
```

## Recommended Policy (Copy & Paste)

**For immediate fix, use this:**

```sql
-- Enable RLS if not already enabled
ALTER TABLE active_accounts ENABLE ROW LEVEL SECURITY;

-- Drop any overly restrictive policies
DROP POLICY IF EXISTS "admin_only_policy" ON active_accounts;

-- Create simple authenticated user policy
CREATE POLICY "authenticated_users_read_active_accounts" 
ON active_accounts 
FOR SELECT 
TO authenticated 
USING (true);

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON active_accounts TO authenticated;
```

## Testing

1. **Run the SQL above in Supabase SQL Editor**
2. **Have the new user refresh the page**
3. **Check browser console for any remaining errors**
4. **Verify accounts list populates**

## Security Note

The recommended policy allows all authenticated users to read active accounts. If you need more restrictive access:

1. Use Option C (role-based) and set appropriate user roles
2. Implement additional middleware checks in the application
3. Create more granular policies based on your business requirements

---

**Quick Fix Status:**
- ✅ Enhanced error reporting in Active Accounts page
- 🔄 RLS policy needs to be updated in Supabase (SQL above)
- ✅ Domain verification already in place for signup