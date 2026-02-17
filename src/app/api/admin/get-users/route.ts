import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create a Supabase client with service role key to bypass RLS
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

export async function GET(request: Request) {
  try {
    // Get the current user to verify they're authenticated
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      console.error('[get-users] No authorization header')
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    // Verify the user is an admin by checking their user record
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('[get-users] Auth error:', authError?.message)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[get-users] Checking admin status for user:', user.id)

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    console.log('[get-users] User role check:', { role: userData?.role, error: userError })

    if (userError || !userData || userData.role !== 'admin') {
      console.error('[get-users] Admin access denied:', { userData, userError })
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.log('[get-users] Admin verified, fetching all users')

    // Fetch all users using service role (bypasses RLS)
    const { data: allUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('[get-users] Error fetching users:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: fetchError.message },
        { status: 500 }
      )
    }

    console.log('[get-users] Successfully fetched', allUsers?.length || 0, 'users')

    return NextResponse.json({ users: allUsers || [] })
  } catch (error: any) {
    console.error('[get-users] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
