# Session Management & Data Persistence Fix

> **⚠️ LEGACY DOCUMENTATION**  
> This document describes fixes applied to the previous React version of AMBER.  
> Current Next.js version uses TanStack Query for data management which handles caching and retries automatically.

## Problem Summary (Pre-Next.js Rewrite)

Users experienced data loading failures when:
1. Viewing a property detail page
2. Switching to another browser tab
3. Returning to the app
4. Navigating to the active accounts list
5. Clicking on another property

**Symptoms:**
- Infinite spinning loader
- Eventually showing error buttons (refresh, diagnostics)
- Unable to reconnect and repopulate UI
- Data not persisting across tab switches

## Root Causes Identified

### 1. **Stale Global State Tracking**
- Used simple `Set` objects (`fetchedPropertyIds`, `fetchingPropertyIds`) that didn't track timestamps
- Fetch status could become stale (request started but never completed or errored)
- No way to detect if a "fetching" status was from a failed/stale request

### 2. **Session Token Expiration**
- When user switched tabs for extended periods, the auth session token could expire
- Session was only checked conditionally (`if (retryCount === 0)`)
- No automatic session refresh when tab regained visibility

### 3. **Race Conditions in Wait Logic**
- When multiple mounts tried to fetch the same property, the waiting logic would check if another fetch was in progress
- If that other fetch failed or timed out, subsequent mounts would wait forever
- No timeout on the waiting interval

### 4. **Short Timeout Values**
- 15-20 second timeouts were too aggressive for slower connections
- Could timeout prematurely, leaving state inconsistent

### 5. **No Session Refresh on Tab Visibility**
- When users switched tabs and came back, session tokens could be stale
- No mechanism to refresh auth session when tab became visible again

## Solutions Implemented

### 1. **Improved Cache Tracking System**
```javascript
const propertyFetchCache = {
  inProgress: new Map(), // id -> timestamp when fetch started
  lastSuccess: new Map(), // id -> timestamp of last successful fetch
  lastError: new Map(),   // id -> timestamp of last error
};
```

**Benefits:**
- Tracks timestamps to detect stale fetches
- Can determine if a fetch has been running too long (>30 seconds)
- Clears stale state automatically
- Separate tracking for successes and errors

### 2. **Always Refresh Session Before Queries**
Changed from:
```javascript
if (retryCount === 0) {
  const { error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    await supabase.auth.refreshSession();
  }
}
```

To:
```javascript
// Always refresh session before making the query
const { error: sessionError } = await supabase.auth.refreshSession();
if (sessionError) {
  console.log('Session refresh error:', sessionError);
  // Continue anyway - the session might still be valid
}
```

**Benefits:**
- Ensures fresh auth token for every fetch
- Prevents auth-related errors
- More reliable across tab switches

### 3. **Smarter Wait Logic with Timeouts**
```javascript
if (isFetching) {
  // Wait for other request
  const checkInterval = setInterval(() => {
    const stillFetching = isFetchInProgress(id);
    const nowHasCache = sessionStorage.getItem(`propertyDetail_${id}`) !== null;
    const hasError = propertyFetchCache.lastError.has(id);

    if (!stillFetching) {
      clearInterval(checkInterval);
      if (nowHasCache) {
        // Load from cache
      } else if (hasError) {
        // Other request failed - try ourselves
        fetchAccount();
      }
    }
  }, 200);

  // Timeout after 35 seconds
  const timeoutId = setTimeout(() => {
    clearInterval(checkInterval);
    if (noCache) {
      propertyFetchCache.inProgress.delete(id);
      fetchAccount(); // Try fetching ourselves
    }
  }, 35000);
}
```

**Benefits:**
- Detects when other fetch completes or errors
- Has fallback timeout to prevent infinite waiting
- Automatically retries if other fetch failed

### 4. **Increased Timeout Values**
- Fetch timeout: 15s → 30s
- Supabase client timeout: 25s → 40s
- Wait interval timeout: None → 35s

**Benefits:**
- More reliable on slower connections
- Reduces premature timeout errors
- Still provides reasonable feedback time

### 5. **Tab Visibility Session Refresh**
```javascript
useEffect(() => {
  const handleVisibilityChange = async () => {
    if (!document.hidden && user) {
      console.log('Tab became visible, refreshing session...');
      await supabase.auth.refreshSession();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [user]);
```

**Benefits:**
- Keeps auth session alive when user returns to tab
- Lightweight (only refreshes token, doesn't refetch data)
- Prevents "session expired" errors

### 6. **Improved Refresh Handler**
```javascript
const handleRefresh = async () => {
  // Clear all caches and state
  sessionStorage.removeItem(`propertyDetail_${id}`);
  sessionStorage.removeItem(`propertyContacts_${id}`);
  
  // Clear fetch tracking
  propertyFetchCache.inProgress.delete(id);
  propertyFetchCache.lastSuccess.delete(id);
  propertyFetchCache.lastError.delete(id);
  
  // Refresh session first
  await supabase.auth.refreshSession();
  
  // Then fetch fresh data
  await fetchAccount();
  await fetchContacts();
};
```

**Benefits:**
- Completely resets state for clean retry
- Ensures fresh session before fetching
- Clears any stale cache data

## Files Modified

1. **`src/pages/PropertyDetail.js`**
   - Replaced global `Set` objects with timestamped `Map` cache
   - Added `isFetchInProgress()` helper to detect stale fetches
   - Improved main useEffect with better wait logic and timeouts
   - Always refresh session before queries
   - Added tab visibility session refresh
   - Enhanced refresh handler

2. **`src/pages/ActiveAccounts.js`**
   - Always refresh session before queries (was conditional)
   - Increased timeout from 20s to 30s
   - Added tab visibility session refresh

3. **`src/lib/supabaseClient.js`**
   - Increased global fetch timeout from 25s to 40s
   - Respects existing signal if provided

## Testing Recommendations

Test the following scenarios:

1. **Basic Navigation**
   - Login → Active Accounts → Property Detail
   - Verify data loads successfully

2. **Tab Switching**
   - Open property detail
   - Switch to another tab for 5+ minutes
   - Return and verify data still visible
   - Navigate back to active accounts
   - Click another property
   - **Expected:** Should load without issues

3. **Multiple Properties**
   - Click property A (wait for load)
   - Click property B (should use cache or load)
   - Back to Active Accounts
   - Click property C
   - **Expected:** All should load successfully

4. **Slow Connection**
   - Simulate slow 3G network
   - Navigate to property detail
   - **Expected:** Should wait up to 30s before timing out

5. **Session Expiry**
   - Leave tab open for 1+ hour
   - Return to tab
   - Navigate to different property
   - **Expected:** Session should auto-refresh, data should load

6. **Refresh Button**
   - Load property detail
   - Make it stale (wait or simulate error)
   - Click "Refresh Page" button
   - **Expected:** Should clear cache and reload successfully

## Monitoring & Debugging

Console logs now include:
- Cache status checks (`hasCachedData`, `isFetchInProgress`)
- Timestamp tracking for fetch operations
- Session refresh status
- Wait logic progress
- Timeout warnings

Key log messages to watch for:
- `✅ Using cached data for property X` - Cache hit
- `⏳ Another request is in progress, waiting...` - Deduplication working
- `⏰ Request timeout after 30 seconds` - Timeout occurred
- `🔑 Refreshing session before query...` - Session being refreshed
- `✅ Session refreshed successfully` - Tab visibility refresh worked

## Performance Impact

- **Positive:**
  - Cached data loads instantly (no network request)
  - Deduplication prevents unnecessary duplicate fetches
  - Session refresh prevents auth errors
  
- **Minimal:**
  - Session refresh adds ~200-500ms when returning to tab
  - Increased timeouts only affect slow/failing requests
  - Interval checking runs every 200ms (negligible CPU usage)

## Backward Compatibility

- All changes are backward compatible
- Existing cached data in sessionStorage continues to work
- No database schema changes required
- No API changes

## Future Improvements

Consider these enhancements:

1. **Service Worker Caching** - Cache data in service worker for offline support
2. **Optimistic Updates** - Show cached data while refreshing in background
3. **Session Keep-Alive** - Proactive token refresh every 30 minutes
4. **Better Error Recovery** - Retry with exponential backoff
5. **Connection Status Detection** - Show offline indicator when network is down

---

**Last Updated:** October 16, 2025
**Version:** 7.0
