import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  // During build time or when environment variables are missing, just continue
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  // Skip middleware for build-time and static assets
  if (process.env.NODE_ENV === 'production' && !process.env.NETLIFY_DEV) {
    return NextResponse.next()
  }

  return NextResponse.next()
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
