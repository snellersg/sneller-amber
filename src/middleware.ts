import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables in middleware')
    
    // During build time, just continue without auth check
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME) {
      return NextResponse.next()
    }
    
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  // If accessing login while authenticated, redirect to active accounts
  if (req.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/active-accounts', req.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/active-accounts/:path*',
    '/calculators/:path*',
    '/core-services/:path*',
    '/add-on-services/:path*',
    '/product-knowledge/:path*',
    '/core-processes/:path*',
    '/kam-club/:path*',
    '/sheets-and-docs/:path*',
    '/login'
  ]
}