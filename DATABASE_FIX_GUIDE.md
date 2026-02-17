# 🚨 URGENT FIX: Database Configuration Issues

## Problem Summary

Based on the errors you're seeing:
1. **Signup Error**: "Database configuration issue detected. This might be a temporary problem or require administrator setup."
2. **Invite Error**: "Failed to create user: Failed to create user: Database error creating new user"

This indicates that your Supabase database is **missing critical tables and/or has incorrect Row Level Security (RLS) policies** that are blocking user creation.

## 🔍 Quick Diagnosis

First, let's verify what's wrong in your Supabase database:

### Step 1: Check if the `users` table exists

1. Go to **Supabase Dashboard** → **Table Editor**
2. Look for a table called `users` in the left sidebar
3. **If it doesn't exist**: This is the problem! ⚠️
4. **If it exists**: Check if it has these columns:
   - `id` (UUID, Primary Key)
   - `email` (TEXT)
   - `full_name` (TEXT)
   - `role` (TEXT)
   - `created_at` (TIMESTAMP)
   - `last_sign_in_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

### Step 2: Check RLS Policies

1. Go to **Supabase Dashboard** → **Authentication** → **Policies**
2. Find the `users` table
3. You should see policies like:
   - "Users can read own profile"
   - "Users can create own profile on signup" ← **THIS IS CRITICAL!**
   - "Service role full access"

**If you don't see these policies, that's why signup is failing!**

### Step 3: Check `allowed_domains` table

1. Go to **Table Editor**
2. Look for `allowed_domains` table
3. It should have these domains:
   - `@snellersg.com` (is_active = true)
   - `@snellerslandscaping.com` (is_active = true)

## ✅ THE FIX - Run This SQL Script

I've created a complete database setup script that will fix all these issues.

### Instructions:

1. **Open Supabase SQL Editor**:
   - Go to your Supabase Dashboard
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Copy the SQL script**:
   - Open the file `supabase_setup.sql` in your project root
   - Copy the **entire contents** (Ctrl+A, Ctrl+C)

3. **Paste and Run**:
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for completion

4. **Verify Success**:
   - You should see "Success. No rows returned" or similar
   - If you see any errors, copy them and let me know

### What This Script Does:

✅ Creates the `users` table with correct schema  
✅ Creates the `allowed_domains` table  
✅ Sets up proper RLS policies to allow user creation  
✅ Adds your company email domains  
✅ Creates a trigger to automatically create user records  
✅ Configures all necessary permissions  

### Important Notes:

- ⚠️ The script uses `IF NOT EXISTS` so it's **safe to run multiple times**
- ⚠️ Existing data will **NOT be deleted**
- ⚠️ If tables already exist, only missing policies will be added

## 🧪 After Running the Script

### Test 1: Try Signup Again

1. Go to your login page: `https://your-site.netlify.app/login`
2. Click "Create your account"
3. Enter: `gavin@snellerslandscaping.com`
4. Enter a password (at least 8 chars, 1 letter, 1 number)
5. Click "Sign Up"

**Expected Result**: Should show "Check your email for the confirmation link!"

### Test 2: Try Inviting User from Admin Panel

1. Log in as admin
2. Go to Admin Panel
3. Enter: `gavin@snellerslandscaping.com`
4. Select role: User or Admin
5. Click "+ Invite User"

**Expected Result**: Should show success message with temporary password

## 🔥 If It Still Doesn't Work

### Check Browser Console:

1. Open Developer Tools (F12)
2. Go to Console tab
3. Try signup/invite again
4. Look for errors in red
5. Copy the full error message and send it to me

### Check Supabase Logs:

1. Go to **Supabase Dashboard** → **Logs**
2. Select **Postgres Logs**
3. Look for recent errors related to `users` table
4. Copy any error messages

### Common Issues:

**Error: "permission denied for table users"**
- Solution: Make sure you ran the ENTIRE SQL script, especially the `GRANT` statements at the end

**Error: "foreign key violation"**
- Solution: This means the auth user exists but can't create profile. Check the trigger `on_auth_user_created` exists

**Error: "duplicate key value violates unique constraint"**
- Solution: User already exists! They just need to sign in, not sign up

## 📝 Understanding the Root Cause

The issue was that your Supabase database was missing:

1. **The `users` table** - stores user profiles
2. **RLS policies** - especially the policy allowing users to insert their own record
3. **The trigger** - automatically creates user profile after Supabase Auth signup
4. **Proper permissions** - allowing authenticated users to insert into `users`

Without these, when someone signs up:
- ✅ Supabase Auth creates the auth account
- ❌ But the trigger can't create the profile in `users` table
- ❌ Result: "Database error saving new user"

## 🆘 Still Need Help?

If after running the SQL script you still can't sign up or invite users:

1. Send me the **exact error message** from browser console
2. Send me any **errors from Supabase logs**
3. Take a screenshot of your **Table Editor** showing the tables
4. Take a screenshot of the **Policies** page for the `users` table

I'll help you debug further!

---

**Quick Reference:**
- SQL Script Location: `supabase_setup.sql`
- Supabase Dashboard: https://app.supabase.com
- Your Project: [Check your .env.local for NEXT_PUBLIC_SUPABASE_URL]
