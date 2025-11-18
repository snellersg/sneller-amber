# Admin Panel Setup Guide

## Overview

The admin panel provides comprehensive user management, audit logging, and system configuration capabilities. To access all users (not just your own profile), you need to configure the service role key.

## Current Issue

You're seeing only your own profile because the admin panel is limited by Row Level Security (RLS) policies when using the anonymous key. To see all users who have signed up, you need admin-level database access.

## Solution: Service Role Key Setup

### Step 1: Get Your Service Role Key

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Navigate to your project

2. **Access API Settings**
   - Click on **Settings** in the left sidebar
   - Select **API** from the settings menu

3. **Copy Service Role Key**
   - Find the **service_role** key section
   - Copy the key (it starts with `eyJ...`)
   - ⚠️ **IMPORTANT**: This is different from the `anon` key

### Step 2: Configure Environment Variables

Add the following line to your `.env.local` file:

```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=https://nmhopipqtxtirqvdepho.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Add this new line:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

## What This Fixes

### Before (Current State)
- ❌ Admin panel shows only your profile
- ❌ "Failed to load users" errors
- ❌ Limited to current user data only
- ❌ Audit logs not accessible

### After (With Service Role Key)
- ✅ Admin panel shows ALL registered users
- ✅ Full user management capabilities
- ✅ Access to user emails and metadata
- ✅ Audit logs and system monitoring
- ✅ Admin-only functions enabled

## Security Notes

- **Service Role Key**: Bypasses all Row Level Security policies
- **Server-Side Only**: Never expose this key in client-side code
- **API Routes**: Used only in `/api/admin/*` endpoints
- **Admin Access**: Only users with `isAdmin: true` can access data

## API Endpoints

The admin panel now uses dedicated API routes:

- `GET /api/admin/users` - Fetch all registered users
- `GET /api/admin/audit-logs` - Fetch system audit logs
- Direct Supabase queries for allowed domains (no service role needed)

## Troubleshooting

### Common Errors

1. **"Service role key not configured"**
   - Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
   - Restart development server

2. **"Access denied: Admin privileges required"**
   - Ensure your user has `isAdmin: true` in metadata
   - Check Supabase Auth user metadata

3. **500 Server Errors**
   - Check console for detailed error messages
   - Verify service role key is correct
   - Ensure Supabase project is accessible

### Verification Steps

1. **Check Environment Variables**
   ```bash
   # Verify your .env.local has both keys
   cat .env.local
   ```

2. **Test API Endpoints**
   - Visit: `http://localhost:3000/api/admin/users`
   - Should return JSON with all users (not just current user)

3. **Check Admin Panel**
   - Navigate to: `http://localhost:3000/admin`
   - User Management tab should show multiple users
   - Should see actual email addresses instead of "[NO EMAIL]"

## Next Steps

After setting up the service role key:

1. **User Management**: View, search, and manage all registered users
2. **Audit Logging**: Track system activities and user actions
3. **Domain Management**: Configure allowed email domains
4. **System Monitoring**: Monitor application usage and performance

## Support

If you continue to see issues after following these steps:

1. Check the browser console for detailed error messages
2. Verify the service role key is correctly formatted
3. Ensure your Supabase project permissions are set up correctly
4. Contact support with specific error messages