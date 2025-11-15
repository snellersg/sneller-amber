import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For build time, provide fallback values to prevent prerender errors
const isBuilding = process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME

if (!supabaseUrl || !supabaseAnonKey) {
  if (isBuilding) {
    console.warn('Supabase environment variables missing during build - using fallbacks')
  } else {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }
}

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)