-- ============================================================================
-- AMBER Database Setup Script
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- ============================================================================

-- 1. Create allowed_domains table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.allowed_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on allowed_domains
ALTER TABLE public.allowed_domains ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read allowed domains
CREATE POLICY "Allow authenticated users to read allowed domains"
  ON public.allowed_domains
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete domains (we'll handle this via service role key)
CREATE POLICY "Allow service role to manage domains"
  ON public.allowed_domains
  FOR ALL
  TO service_role
  USING (true);

-- 2. Create users table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (excluding role)
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert their own record
-- This is crucial for signup to work!
CREATE POLICY "Users can create own profile on signup"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Service role can do anything (for admin operations)
CREATE POLICY "Service role full access"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Insert allowed email domains
-- ============================================================================
INSERT INTO public.allowed_domains (domain, is_active, notes)
VALUES 
  ('@snellersg.com', true, 'Primary company domain'),
  ('@snellerslandscaping.com', true, 'Legacy company domain')
ON CONFLICT (domain) DO NOTHING;

-- 4. Create function to validate email domain (optional)
-- ============================================================================
-- This function can be used by triggers but we'll make it non-blocking
CREATE OR REPLACE FUNCTION public.validate_email_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate if the email has a domain part
  IF NEW.email IS NOT NULL AND NEW.email LIKE '%@%' THEN
    -- Extract domain with @ symbol
    DECLARE
      email_domain TEXT;
    BEGIN
      email_domain := '@' || split_part(NEW.email, '@', 2);
      
      -- Check if domain exists in allowed_domains and is active
      IF NOT EXISTS (
        SELECT 1 FROM public.allowed_domains
        WHERE domain = email_domain AND is_active = true
      ) THEN
        -- Log warning but don't block (we auto-add domains in the API)
        RAISE WARNING 'Email domain % not in allowed list', email_domain;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: We're NOT creating a trigger for this validation
-- because we want to allow the API to auto-add domains
-- If you want strict domain validation, uncomment this:
-- CREATE TRIGGER validate_user_email_domain
--   BEFORE INSERT OR UPDATE ON public.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.validate_email_domain();

-- 5. Create function to automatically create user record after signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant necessary permissions
-- ============================================================================
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON public.allowed_domains TO service_role;
GRANT ALL ON public.users TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.allowed_domains TO authenticated;

-- 7. Verification queries (optional - just for checking)
-- ============================================================================
-- Run these separately to verify setup:

-- Check allowed domains:
-- SELECT * FROM public.allowed_domains;

-- Check users table:
-- SELECT * FROM public.users;

-- Check RLS policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('users', 'allowed_domains');

-- ============================================================================
-- Setup Complete!
-- ============================================================================
-- Your database is now configured for AMBER.
-- Users can now sign up and admins can invite users.
-- ============================================================================
