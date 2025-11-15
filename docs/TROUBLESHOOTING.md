# Troubleshooting Guide

Common issues and solutions for Sneller AMBER (Next.js version).

## Table of Contents
- [Authentication Issues](#authentication-issues)
- [Environment Variables](#environment-variables)
- [Database and RLS Issues](#database-and-rls-issues)
- [Mobile/PWA Issues](#mobile-pwa-issues)
- [Development Issues](#development-issues)
- [TanStack Query Issues](#tanstack-query-issues)

---

## Authentication Issues

### Issue: Infinite redirect loop between login and home page

**Symptoms:**
- Page keeps redirecting between `/` and `/login`
- Console shows authentication errors
- Can't access any protected pages

**Root Cause:**
Middleware authentication check failing or Supabase client misconfigured.

**Solution:**

1. **Check environment variables** (see [Environment Variables](#environment-variables))
2. **Verify middleware configuration** (`src/middleware.ts`):
   ```typescript
   // Ensure middleware is properly configured
   export const config = {
     matcher: [
       '/((?!api|_next/static|_next/image|favicon.ico).*)',
     ],
   }
   ```
3. **Check Supabase client** (`src/lib/supabase.ts`):
   ```typescript
   // Ensure correct environment variables are used
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   ```

### Issue: "User session not found" after page refresh

**Symptoms:**
- User gets logged out after refreshing the page
- Authentication state is not persistent

**Root Cause:**
Server-side authentication not properly configured.

**Solution:**
Ensure middleware properly handles Supabase SSR:
```typescript
// middleware.ts should use createServerClient
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      // ... proper cookie handling
    },
  }
)
```

---

## Environment Variables

### Issue: "Missing Supabase environment variables" error

**Symptoms:**
- App crashes on startup with environment variable error
- Authentication doesn't work

**Root Cause:**
Missing or incorrectly named environment variables.

**Solution:**

1. **Create `.env.local` file** in project root:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

2. **Verify variable names** start with `NEXT_PUBLIC_` (not `REACT_APP_`)

3. **Restart development server** after adding variables:
   ```bash
   npm run dev
   ```

### Issue: Environment variables work locally but not in production

**Symptoms:**
- App works in development but fails when deployed
- Authentication fails in production

**Solution:**
Add environment variables to your deployment platform:
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Other platforms**: Follow their specific environment variable setup

---

## Database and RLS Issues

### Issue: "Permission denied for table users"

**Symptoms:**
- Admin Panel shows "permission denied for table users"
- Cannot fetch user list or admin functions fail

**Root Cause:**
Row Level Security (RLS) policies trying to access `auth.users` directly.

**Solution:**
Use the helper function created during database setup:

```sql
-- This function should exist from database setup
SELECT public.is_admin();
```

If not, run the RLS policy setup from `database/` folder.

### Issue: "User not allowed" in Admin Panel

**Symptoms:**
- Cannot access admin functions despite being admin
- User list doesn't load

**Root Cause:**
Admin status not properly set in user metadata.

**Solution:**

1. **Check user metadata** in Supabase Dashboard:
   - Go to Authentication → Users
   - Find your user and edit User Metadata
   - Add: `{"is_admin": true}`

2. **Verify with SQL query**:
   ```sql
   SELECT raw_user_meta_data
   FROM auth.users
   WHERE email = 'your-email@company.com';
   ```

---

## Mobile/PWA Issues

### Issue: App layout breaks on mobile devices

**Symptoms:**
- Horizontal scrolling on mobile
- Content overflows viewport
- Sidebar doesn't work properly on mobile

**Root Cause:**
Layout component not properly handling mobile breakpoints.

**Solution:**

The current Layout component (`src/components/Layout.tsx`) includes proper mobile handling:
- `overflow-x-hidden` prevents horizontal scroll
- Responsive padding: `px-4 sm:px-6`
- Mobile sidebar overlay with backdrop

**Key patterns for mobile components:**
```jsx
// Mobile-first responsive design
<div className="flex flex-col sm:flex-row gap-3">
  <button className="w-full sm:w-auto">
    <Icon className="h-4 w-4 sm:mr-2" />
    <span className="hidden sm:inline">Desktop Text</span>
  </button>
</div>

// Prevent overflow
<div className="overflow-x-hidden break-words">
  Long content here
</div>
```

### Issue: PWA installation not working

**Symptoms:**
- No "Install App" prompt on mobile
- PWA doesn't behave like native app

**Solution:**

1. **Verify manifest.json** in `public/` folder
2. **Check HTTPS** - PWAs require HTTPS in production
3. **Verify service worker** (if implemented)
4. **Test on actual mobile device** - desktop browsers may not show install prompt

---

## Development Issues

### Issue: "Module not found" errors for TypeScript files

**Symptoms:**
- Import errors for `.tsx` files
- TypeScript compilation errors

**Root Cause:**
Path resolution or TypeScript configuration issues.

**Solution:**

1. **Check `tsconfig.json`** has proper path mapping:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. **Restart TypeScript server** in VS Code:
   - Cmd/Ctrl + Shift + P
   - "TypeScript: Restart TS Server"

### Issue: Hot reload not working in development

**Symptoms:**
- Changes don't appear without manual refresh
- Development server seems slow

**Solution:**

1. **Restart development server**:
   ```bash
   npm run dev
   ```

2. **Check Next.js configuration** in `next.config.js`

3. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## TanStack Query Issues

### Issue: Data not updating after mutations

**Symptoms:**
- Changes made but UI doesn't reflect them
- Stale data showing in interface

**Root Cause:**
Query invalidation not properly configured.

**Solution:**

Use proper query invalidation after mutations:
```javascript
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// After successful mutation
await queryClient.invalidateQueries({ 
  queryKey: ['active-accounts'] 
})

// Or refetch specific query
await refetch()
```

### Issue: "Query data is undefined" errors

**Symptoms:**
- Components crash with undefined data
- Loading states not handled properly

**Root Cause:**
Not handling loading/error states properly.

**Solution:**

Always handle loading and error states:
```javascript
const { 
  data: accounts = [], 
  isLoading, 
  error 
} = useQuery({
  queryKey: ['active-accounts'],
  queryFn: fetchAccounts,
})

if (isLoading) return <div>Loading...</div>
if (error) return <div>Error: {error.message}</div>

// Now safe to use accounts
return <div>{accounts.map(...)}</div>
```

---

## Performance Issues

### Issue: Slow page loads or large bundle size

**Symptoms:**
- Pages take long time to load
- Lighthouse performance scores low

**Solution:**

1. **Check bundle analysis**:
   ```bash
   npm run build
   ```

2. **Optimize imports** - use tree shaking:
   ```javascript
   // ✅ Good: Tree-shakeable import
   import { Search, Filter } from 'lucide-react'
   
   // ❌ Bad: Imports entire library
   import * as Icons from 'lucide-react'
   ```

3. **Use Next.js Image optimization**:
   ```jsx
   import Image from 'next/image'
   
   <Image
     src="/logo.png"
     alt="Logo"
     width={200}
     height={100}
   />
   ```

---

## Common Error Messages

### "Hydration mismatch" errors

**Symptoms:**
- Console warnings about hydration mismatches
- Content flashing or changing after page load

**Root Cause:**
Server and client rendering different content.

**Solution:**
```jsx
// Use suppressHydrationWarning for known mismatches
<body suppressHydrationWarning={true}>

// Or use useEffect for client-only content
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])

if (!mounted) return null
```

---

## Diagnostic Commands

### Check Environment Variables
```bash
# In development, check if variables are loaded
npx next info

# Or add to a page temporarily:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### Check Database Connection
```sql
-- In Supabase SQL editor
SELECT current_user, current_database();

-- Test RLS
SELECT public.is_admin();
```

### Check Build
```bash
# Build and check for errors
npm run build

# Start production server locally
npm start
```

---

## Need More Help?

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture details
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Setup instructions
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database configuration
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - File organization

For specific Next.js issues, also check:
- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
