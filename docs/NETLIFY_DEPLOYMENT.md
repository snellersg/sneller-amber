# Netlify + Supabase Deployment Guide

## CRITICAL: Set Environment Variables in Netlify

The build is failing because Supabase environment variables are missing during the prerender step.

### 1. Add Environment Variables in Netlify Dashboard
Go to: **Netlify Dashboard → Your Site → Site settings → Environment variables**

Add these **exact** variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_from_supabase
```

**How to find your anon key:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings → API**
4. Copy the `anon` `public` key (NOT the service_role key)

### 2. Netlify Environment Variables (Required for Build)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_from_supabase
```

## 2. Supabase Authentication Configuration
In your Supabase dashboard → Authentication → URL Configuration:

### Site URL
Update to your Netlify URL:
```
https://your-site-name.netlify.app
```

### Redirect URLs
Add your Netlify URL to allowed redirects:
```
https://your-site-name.netlify.app/**
https://your-site-name.netlify.app/auth/callback
```

## 3. Supabase Row Level Security (RLS)
Ensure your RLS policies allow access from the new domain.

## 4. Domain Configuration
If using a custom domain:
1. Set up the custom domain in Netlify
2. Update Supabase Site URL to your custom domain
3. Add custom domain to Supabase redirect URLs

## 5. Testing Checklist
After deployment:
- [ ] Environment variables are set in Netlify
- [ ] Supabase Site URL updated
- [ ] Supabase redirect URLs include Netlify domain
- [ ] Login/logout functionality works
- [ ] Protected routes redirect properly
- [ ] Database queries work correctly

## Troubleshooting
- If auth fails: Check Supabase redirect URLs
- If API calls fail: Verify environment variables are set
- If pages don't load: Check build logs for missing dependencies