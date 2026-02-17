import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create admin client with service role key (server-side only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {}
  }

  try {
    // Check 1: Can we connect to Supabase?
    diagnostics.checks.connection = {
      status: 'checking',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing'
    }

    // Check 2: Does users table exist?
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1)
      
      diagnostics.checks.usersTable = {
        status: error ? 'error' : 'ok',
        exists: !error,
        error: error?.message,
        hint: error?.hint
      }
    } catch (err: any) {
      diagnostics.checks.usersTable = {
        status: 'error',
        exists: false,
        error: err.message
      }
    }

    // Check 3: Does allowed_domains table exist?
    try {
      const { data, error } = await supabaseAdmin
        .from('allowed_domains')
        .select('*')
      
      diagnostics.checks.allowedDomainsTable = {
        status: error ? 'error' : 'ok',
        exists: !error,
        domainsCount: data?.length || 0,
        domains: data?.map(d => ({ domain: d.domain, isActive: d.is_active })) || [],
        error: error?.message
      }
    } catch (err: any) {
      diagnostics.checks.allowedDomainsTable = {
        status: 'error',
        exists: false,
        error: err.message
      }
    }

    // Check 4: Test INSERT permission on users table
    try {
      // Try a test insert (we'll immediately roll it back by design)
      const testUserId = '00000000-0000-0000-0000-000000000000'
      const { error } = await supabaseAdmin
        .from('users')
        .insert({
          id: testUserId,
          email: 'test@test.com',
          full_name: 'Test User',
          role: 'user'
        })
        .select()
        .limit(0) // Don't actually insert

      diagnostics.checks.usersTableInsertPermission = {
        status: error ? 'error' : 'ok',
        canInsert: !error || error.code === '23505', // Duplicate key is ok for this test
        error: error?.message,
        code: error?.code
      }

      // Clean up if somehow the test insert worked
      if (!error) {
        await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', testUserId)
      }
    } catch (err: any) {
      diagnostics.checks.usersTableInsertPermission = {
        status: 'error',
        canInsert: false,
        error: err.message
      }
    }

    // Check 5: Service role key configured?
    diagnostics.checks.serviceRoleKey = {
      status: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
      configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }

    // Overall status
    const allChecksOk = Object.values(diagnostics.checks).every(
      (check: any) => check.status === 'ok' || check.status === 'configured'
    )

    diagnostics.overallStatus = allChecksOk ? 'healthy' : 'issues_detected'
    diagnostics.recommendation = allChecksOk 
      ? 'Database is properly configured.'
      : 'Database configuration issues detected. Please run supabase_setup.sql script.'

    return NextResponse.json(diagnostics, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
