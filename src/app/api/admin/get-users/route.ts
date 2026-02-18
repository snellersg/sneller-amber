import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function GET(request: Request) {
  try {
    // Get the current user to verify they're authenticated
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      console.error('[get-users] No authorization header')
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Verify the user is an admin by checking their user record
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      console.error('[get-users] Auth error:', authError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
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

    console.log('[get-users] Successfully fetched', allUsers?.length || 0, 'users from database')

    // Fetch auth users to get email verification status
    const { data: authData, error: authFetchError } = await supabaseAdmin.auth.admin.listUsers()

    if (authFetchError) {
      console.error('[get-users] Error fetching auth users:', authFetchError)
      return NextResponse.json(
        { error: 'Failed to fetch auth data', details: authFetchError.message },
        { status: 500 }
      )
    }

    console.log('[get-users] Successfully fetched', authData.users?.length || 0, 'users from auth')

    // Merge profile data with auth verification status
    const usersWithVerificationStatus = (allUsers || []).map(profileUser => {
      const authUser = authData.users.find(authUser => authUser.id === profileUser.id)

      // Use the more recent last_sign_in_at timestamp (database is usually more current)
      let lastSignInAt = profileUser.last_sign_in_at
      if (authUser?.last_sign_in_at && profileUser.last_sign_in_at) {
        // Compare timestamps and use the more recent one
        const authTime = new Date(authUser.last_sign_in_at)
        const dbTime = new Date(profileUser.last_sign_in_at)
        lastSignInAt = authTime > dbTime ? authUser.last_sign_in_at : profileUser.last_sign_in_at
      } else if (authUser?.last_sign_in_at && !profileUser.last_sign_in_at) {
        // Use auth timestamp if database doesn't have one
        lastSignInAt = authUser.last_sign_in_at
      }

      return {
        ...profileUser,
        email_confirmed_at: authUser?.email_confirmed_at || null,
        email_verified: !!authUser?.email_confirmed_at,
        last_sign_in_at: lastSignInAt,
      }
    })

    console.log('[get-users] Merged verification status for all users')

    return NextResponse.json({ users: usersWithVerificationStatus })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[get-users] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
