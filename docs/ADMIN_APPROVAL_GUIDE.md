# 🔐 Admin Approval System Guide

Complete guide for managing user approvals in Sneller AMBER.

## Overview

Manual admin approval is an additional security layer that requires an administrator to approve every new user signup before they can access the application.

## How It Works

### 1. User Signs Up
1. User visits `/login` and clicks "Sign up"
2. User enters company email and password
3. Account is created with `status: "pending"`
4. User sees confirmation message: "Check your email for the confirmation link!"

### 2. User Verifies Email (if enabled)
1. User clicks verification link in email
2. Email is verified, but account still has `status: "pending"`
3. User cannot sign in yet

### 3. User Tries to Sign In
1. User enters credentials at `/login`
2. Authentication succeeds
3. App checks approval status
4. User sees "Account Pending Approval" screen with:
   - ⏳ Wait icon
   - Explanation message
   - "Check Again" button
   - "Sign Out" button

### 4. Admin Approves User
1. Admin logs in and goes to Admin Panel
2. Yellow alert box shows pending users at top
3. Admin sees:
   - User email
   - Signup date
   - **Approve** button (green)
   - **Reject** button (red)
4. Admin clicks "Approve"
5. User status changes to `status: "approved"`
6. Action logged in audit trail

### 5. User Gains Access
1. User clicks "Check Again" or signs in again
2. Status check passes
3. User gets full access to the app

## Admin Actions

### Approve a User

**Option 1: From Alert Box** (Recommended)
1. Go to Admin Panel > Users tab
2. See yellow alert box at top with pending users
3. Click green **"Approve"** button next to user
4. User immediately gains access

**Option 2: From User Table**
1. Find user with yellow "pending" status badge
2. Click green checkmark icon (✓) in Actions column
3. User status changes to "approved"

### Reject a User

**Warning:** Rejection permanently deletes the user account.

1. Click red **"Reject"** button or red X icon (✗)
2. Optionally enter rejection reason (for audit log)
3. Confirm deletion
4. User account is permanently removed
5. User must sign up again to reapply

## Enabling Manual Approval

Manual approval is **enabled** by running the SQL script:

```bash
# In Supabase Dashboard > SQL Editor
# Run: supabase_enable_manual_approval.sql
```

This script:
- Sets `requires_approval := true` in the database function
- Adds `approve_user()` and `reject_user()` RPC functions
- All new signups will require admin approval

## Disabling Manual Approval

To allow instant access after email verification:

1. Go to Supabase Dashboard > SQL Editor
2. Run this query:

```sql
CREATE OR REPLACE FUNCTION public.check_user_approval_status()
RETURNS TRIGGER AS $$
DECLARE
  requires_approval BOOLEAN;
BEGIN
  -- Manual approval is now DISABLED
  requires_approval := false;

  IF requires_approval THEN
    NEW.raw_user_meta_data := jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{status}',
      '"pending"'::jsonb
    );
  ELSE
    NEW.raw_user_meta_data := jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{status}',
      '"approved"'::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Note:** This only affects NEW signups. Existing pending users still need approval.

## Audit Trail

All approval/rejection actions are logged:

**Approval:**
- Action: `user_approved`
- Admin: Admin email who approved
- Target: User email that was approved
- Timestamp: When it happened

**Rejection:**
- Action: `user_rejected`
- Admin: Admin email who rejected
- Target: User email that was rejected
- Details: Rejection reason (if provided)
- Timestamp: When it happened

View audit logs: Admin Panel > Audit Logs tab

## Security Benefits

✅ **Prevents fake accounts**: Admins verify each user is legitimate
✅ **Controls access**: Only approved employees can see company data
✅ **Audit accountability**: Complete record of who approved whom
✅ **Early detection**: Spot suspicious signup attempts immediately
✅ **Extra verification**: Works alongside email domain restrictions

## Best Practices

### For Admins:

1. **Check pending users daily**
   - Yellow alert appears when users are waiting
   - Don't make employees wait too long

2. **Verify user identity**
   - Confirm the email matches a real employee
   - Ask the person directly if unsure
   - Check with HR for new hires

3. **Document rejections**
   - Always provide a reason when rejecting
   - Helps track security incidents
   - Useful for audit purposes

4. **Review audit logs weekly**
   - Monitor for suspicious patterns
   - Ensure approval processes are followed

### For Users:

1. **Use your real company email**
   - Personal emails will be rejected
   - Must be @snellersg.com or @snellerslandscaping.com

2. **Wait for approval**
   - Check back after a few hours
   - Contact admin if urgent
   - Don't create multiple accounts

3. **Contact admin if rejected**
   - There may have been a mistake
   - Provide proof of employment
   - Sign up again with correct info

## Troubleshooting

### User says they're stuck on pending screen

**Check:**
1. Admin Panel > Users tab
2. Find their email
3. Check Status column - is it still "pending"?
4. If yes, approve them
5. If approved, have user sign out and back in

### Approve button not working

**Possible causes:**
1. **SQL script not run**: Run `supabase_enable_manual_approval.sql`
2. **RPC function missing**: Check Supabase Dashboard > Database > Functions
3. **Permission error**: Ensure you're logged in as admin
4. **Browser console errors**: Check F12 console for error messages

### User approved but still can't access

**Solutions:**
1. Have user sign out completely
2. Clear browser cache and localStorage
3. Restart dev server (development only)
4. User signs in fresh
5. If still blocked, check user metadata in Supabase Dashboard

### Can't find pending users

**Check:**
1. Admin Panel > Users tab > Look for yellow status badges
2. Refresh page (click refresh icon)
3. Check if approval is actually enabled (run query to check function)
4. Look in Supabase Dashboard > Authentication > Users > Check user_metadata

## Database Details

### User Status Values

- `"pending"` - Awaiting admin approval (cannot sign in)
- `"approved"` - Can access the app
- `null` or missing - Treated as approved (backwards compatibility)

### Where Status is Stored

```
auth.users table
  └─ raw_user_meta_data column (JSONB)
      └─ status field: "pending" | "approved"
```

### RPC Functions

**`approve_user(p_user_id UUID, p_admin_notes TEXT)`**
- Sets user status to "approved"
- Logs action to audit trail
- Returns success/error JSON

**`reject_user(p_user_id UUID, p_reason TEXT)`**
- Logs rejection to audit trail
- Deletes user account permanently
- Returns success/error JSON

## Integration with Email Verification

Both systems work together:

| Email Verification | Manual Approval | Result |
|--------------------|-----------------|--------|
| ✅ Enabled | ✅ Enabled | Most Secure: Email must be verified AND admin must approve |
| ✅ Enabled | ❌ Disabled | Secure: Email verified, instant access |
| ❌ Disabled | ✅ Enabled | Medium: Admin approves, no email verification |
| ❌ Disabled | ❌ Disabled | Least Secure: Instant access, no verification |

**Recommended:** Enable both for maximum security.

## Support

- **Technical issues**: Check Supabase logs and browser console
- **Questions**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Security Note:** Manual approval adds an extra security layer but requires active admin participation. Make sure admins check for pending users regularly!
