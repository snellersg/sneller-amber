# Enhanced Audit Log System

## Overview
This system tracks all changes made to Active Accounts by any user, allowing admins to review, approve, or undo changes.

## Database Schema

### accounts_audit_log Table
Tracks all user actions with the following fields:

- **id**: Unique identifier
- **created_at**: Timestamp of the action
- **user_id**, **user_email**: User who performed the action
- **action_type**: Type of action performed
- **account_id**, **account_name**: Target account
- **previous_data**: JSON snapshot before change
- **new_data**: JSON snapshot after change
- **status**: `pending`, `approved`, or `undone`
- **reviewed_at**, **reviewed_by**, **reviewer_email**: Admin review details
- **can_undo**: Whether the change can be reversed
- **undo_data**: Data needed to reverse the operation

### Action Types Tracked

1. **account_created** - New account added
2. **account_updated** - Account details modified
3. **account_deleted** - Account removed
4. **lm_contract_uploaded** - LM contract PDF uploaded/replaced
5. **lm_contract_deleted** - LM contract PDF removed
6. **wr_contract_uploaded** - WR contract PDF uploaded/replaced
7. **wr_contract_deleted** - WR contract PDF removed

## Functions

### log_account_change()
Creates an audit log entry when a change is made.

**Parameters:**
- `p_action_type`: Type of action
- `p_account_id`: Account ID
- `p_account_name`: Account name
- `p_previous_data`: Data before change (JSON)
- `p_new_data`: Data after change (JSON)
- `p_undo_data`: Data needed to undo (JSON)

**Returns:** Log entry ID

### approve_account_change()
Marks a pending change as approved.

**Parameters:**
- `p_log_id`: Audit log entry ID
- `p_notes`: Optional admin notes

**Effects:**
- Sets status to 'approved'
- Records reviewer details
- Prevents undo

### undo_account_change()
Reverses a pending change.

**Parameters:**
- `p_log_id`: Audit log entry ID

**Returns:** JSON data needed to perform the undo

**Effects:**
- Sets status to 'undone'
- Records reviewer details
- Returns undo_data for application to execute

## Admin UI Features

### Audit Log Review Tab
Located in Admin Panel, shows:

- **Pending Changes**: Awaiting admin review
  - User who made the change
  - What was changed
  - Before/after comparison
  - Action buttons: Approve or Undo

- **History**: All approved and undone changes
  - Filterable by user, date, action type
  - Searchable

### For Each Pending Change

**Approve Button:**
- Keeps the change
- Marks as approved
- Removes from pending queue
- Cannot be undone after approval

**Undo Button:**
- Reverses the change
  - Created account → Deleted
  - Deleted account → Restored
  - Updated account → Reverted to previous values
  - Uploaded contract → Removed
  - Deleted contract → Restored (if still in storage)
- Marks as undone in history

## Implementation Status

### ✅ Completed
1. Database schema created (`create_accounts_audit_log.sql`)
2. Audit logging added to ActiveAccounts page:
   - Account creation logged
   - Account deletion logged with undo data

### 🚧 In Progress
3. Add audit logging to PropertyDetail page:
   - Account updates (property name, parent account, location, manager)
   - Account deletion
   - LM contract upload/delete
   - WR contract upload/delete

### ⏳ To Do
4. Create admin UI in AdminPanel.js:
   - New "Account Changes" tab
   - Pending changes view
   - Approve/undo functionality
   - Change history view

## Setup Instructions

1. Run the SQL script in Supabase:
   ```
   database/create_accounts_audit_log.sql
   ```

2. The frontend code will automatically start logging changes

3. Admins will see the new "Account Changes" tab in the Admin Panel

## Security

- All authenticated users can create audit logs
- Only admins can approve or undo changes
- Row Level Security (RLS) policies enforce permissions
- All actions are tracked and cannot be hidden

## Benefits

- **Accountability**: Every change is tracked with who, what, when
- **Error Recovery**: Mistakes can be undone
- **Quality Control**: Admins can review changes before they're final
- **Audit Trail**: Complete history of all changes
- **Training**: New users can make changes with admin oversight
