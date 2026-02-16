# 🔧 Signup Troubleshooting Guide

## Current Issue: "Database error saving new user"

This error message suggests the issue is coming from the Supabase database side, not our frontend code.

## Immediate Steps to Try

### 1. Clear Browser Cache
The error message "Database error saving new user" doesn't exist in our current codebase, suggesting browser cache issues:

1. **Hard Refresh**: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. **Clear Cache**: 
   - Chrome: `Ctrl + Shift + Delete` → Clear "Cached images and files"
   - Developer Tools: F12 → Application → Storage → Clear All
3. **Incognito/Private Mode**: Try signup in a private browser window

### 2. Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Try the signup again
4. Look for a detailed error log that starts with "Full signup error details:"
5. Send the full error details to debug further

### 3. Database Configuration Check

The error is likely from one of these Supabase database issues:

#### Check Email Domain Configuration
1. Go to Supabase Dashboard → Table Editor
2. Open the `allowed_domains` table
3. Verify these domains exist and are active:
   - `snellersg.com` (is_active = true)
   - `snellerslandscaping.com` (is_active = true)

#### Check Database Triggers
The error might come from the `validate_email_domain()` trigger. To verify:

1. Go to Supabase Dashboard → SQL Editor
2. Run this query to check if the function exists:
```sql
SELECT proname, prosrc FROM pg_proc WHERE proname = 'validate_email_domain';
```

#### Check RLS Policies
1. Go to Supabase Dashboard → Authentication → Policies
2. Verify the `users` table has appropriate insert policies

### 4. Temporary Bypass Test
To isolate if it's a domain validation issue:

1. Temporarily try signup with an email that definitely should work: `brendon.dalaba@snellersg.com`
2. If that works, the issue is domain-specific
3. If that fails too, it's a broader database configuration issue

### 5. Expected Console Output
After the changes, you should see detailed error logging in the browser console like:
```
Full signup error details: {
  message: "...",
  code: "...", 
  details: "...",
  hint: "...",
  status: "..."
}
```

## Common Database Issues & Solutions

### Issue: Email Domain Not Found
**Error**: Foreign key violation or "domain not allowed"
**Solution**: Add domain to `allowed_domains` table

### Issue: Database Trigger Blocking Signup  
**Error**: Function does not exist or validation error
**Solution**: Check if database setup SQL was run completely

### Issue: RLS Policy Blocking Insert
**Error**: Insufficient permissions 
**Solution**: Verify authenticated users can insert into `users` table

## Next Steps After Console Debug

Once we see the actual error details from the console, we can:

1. **Fix domain validation** if it's a domain issue
2. **Update database functions** if triggers are malformed  
3. **Adjust RLS policies** if it's a permissions issue
4. **Bypass problematic triggers** if they're causing issues

## Contact
If none of these steps resolve the issue, share the console error details and we can debug further.