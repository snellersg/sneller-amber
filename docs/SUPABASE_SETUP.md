# 🔐 Supabase Setup Guide

Complete guide for setting up Supabase authentication for Sneller AMBER.

## Prerequisites

- Supabase account (free at [supabase.com](https://supabase.com))
- Company email (@snellersg.com or @snellerslandscaping.com)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: `sneller-amber`
   - **Database Password**: Create strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier
4. Click "Create new project"
5. Wait 2-3 minutes for setup

## Step 2: Get API Credentials

1. In Supabase Dashboard, go to **Project Settings** (gear icon)
2. Click **API** in left menu
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`

## Step 3: Configure Environment Variables

1. In your project root, copy `.env.local.example` to `.env.local`
2. Add your credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Never commit `.env.local`** - it's already in `.gitignore`

## Step 4: Run Database Setup

1. In Supabase Dashboard, click **SQL Editor**
2. Click **New Query**
3. Open `database/supabase_setup.sql` from the database folder
4. Copy entire file contents
5. Paste into SQL Editor
6. Click **Run** (or Ctrl+Enter)
7. Should see "Success. No rows returned"

This creates:
- `allowed_domains` table (email domains)
- `user_profiles` table (user info)
- `admin_audit_log` table (admin actions)
- All security policies and triggers

**For complete database setup instructions, see [database/README.md](./database/README.md)**

## Step 5: Configure Email Authentication

1. Go to **Authentication** > **Providers**
2. Ensure **Email** is enabled
3. Configure **Confirm email**:
   - **Enabled**: Users must verify email (recommended)
   - **Disabled**: Immediate access after signup
4. Click **Save**

## Step 6: Set First Admin User

1. Start your app: `npm start`
2. Go to `localhost:3000` → redirects to `/login`
3. Click "Sign up"
4. Create account with company email
5. Verify email if confirmation is enabled

**Make yourself admin:**
1. Go to Supabase Dashboard > **Authentication** > **Users**
2. Click on your user
3. Scroll to "User Metadata"
4. Click "Edit" and set:
```json
{
  "is_admin": true
}
```
5. Save
6. Refresh app - you'll see "Admin Panel" in sidebar

## Step 7: Test Everything

1. Sign out and back in
2. Access Admin Panel
3. Create test user
4. Promote/demote users
5. Check Audit Logs
6. Manage email domains

## Troubleshooting

### Can't connect to Supabase
- Check `.env.local` has correct credentials
- Restart dev server after changing `.env.local`
- Verify Supabase project URL is correct

### SQL script fails
- Make sure you copied the entire script
- Run in SQL Editor, not psql directly
- Check for error messages in Supabase

### Email confirmation not working
- Check Authentication > Email Templates
- Verify SMTP settings (uses Supabase's by default)
- Check spam folder

### Can't access admin panel
- Verify `is_admin: true` in user metadata
- Clear browser cache and localStorage
- Check browser console for errors

## Security Notes

- **Never** commit `.env.local`
- **Never** share service_role key (not needed for this app)
- Row Level Security (RLS) protects all database tables
- All admin actions are logged in audit trail

## Next Steps

See [GETTING_STARTED.md](./GETTING_STARTED.md) for development workflow.

---

Need help? Check Supabase docs at [supabase.com/docs](https://supabase.com/docs)
