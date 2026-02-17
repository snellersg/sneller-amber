import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client with service role key
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

export async function POST(request: NextRequest) {
  try {
    const { email, role = 'user' } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Verify the requesting user is an admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate a secure temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 
                        Math.random().toString(36).slice(-8).toUpperCase() + 
                        Math.floor(Math.random() * 1000)

    console.log('Creating user with admin client:', email)

    // Create the user in Supabase Auth using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: tempPassword,
      email_confirm: true // Auto-confirm the email
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ 
        error: `Failed to create auth user: ${authError.message}` 
      }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ 
        error: 'No user data returned from auth creation' 
      }, { status: 500 })
    }

    console.log('Auth user created, creating profile:', authData.user.id)

    // Create the user profile record
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: authData.user.email?.split('@')[0] || 'New User',
        role: role,
        created_at: new Date().toISOString(),
        last_sign_in_at: null
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      // If profile creation fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ 
        error: `Failed to create user profile: ${profileError.message}` 
      }, { status: 500 })
    }

    console.log('User successfully created')

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        tempPassword: tempPassword
      }
    })

  } catch (error) {
    console.error('Unexpected error in invite-user API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}