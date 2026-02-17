import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

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

// Generate cryptographically secure password
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const specials = '!@#$%&*'
  let password = ''
  
  // 12 random characters
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(crypto.randomInt(chars.length))
  }
  
  // Add 2 special characters
  password += specials.charAt(crypto.randomInt(specials.length))
  password += specials.charAt(crypto.randomInt(specials.length))
  
  // Add 2 numbers
  password += crypto.randomInt(10).toString()
  password += crypto.randomInt(10).toString()
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export async function POST(request: NextRequest) {
  try {
    const { email, role = 'user' } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 })
    }

    // Check environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Verify the requesting user is authenticated and admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get the requesting user
    const { data: { user: requestingUser }, error: tokenError } = await supabaseAdmin.auth.getUser(token)
    
    if (tokenError || !requestingUser) {
      return NextResponse.json({ error: 'Invalid authorization' }, { status: 401 })
    }

    // Check if requesting user is admin
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('email', requestingUser.email)
      .single()

    if (adminError || adminCheck?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const tempPassword = generateSecurePassword()

    // Create the user in Supabase Auth using admin client
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: tempPassword,
      email_confirm: true // Auto-confirm the email
    })

    if (createUserError) {
      console.error('Auth user creation failed:', createUserError.message)
      return NextResponse.json({ 
        error: `Failed to create user: ${createUserError.message}` 
      }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ 
        error: 'User creation failed: No user data returned' 
      }, { status: 500 })
    }

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
      console.error('Profile creation failed:', profileError.message)
      // Clean up the auth user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError)
      }
      
      return NextResponse.json({ 
        error: `Failed to create user profile: ${profileError.message}` 
      }, { status: 500 })
    }

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