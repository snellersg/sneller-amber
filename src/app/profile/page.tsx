'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import Layout from '@/components/Layout'
import {
  User as UserIcon,
  Mail,
  Save,
  Lock,
  Eye,
  EyeOff,
  Check,
  XCircle,
  Loader2
} from 'lucide-react'

interface UserProfileData {
  id: string
  email: string
  full_name: string
  created_at: string
  last_sign_in_at: string
  status: string
  role: string
  approved_by?: string
  approved_at?: string
}

export default function UserProfile() {
  // Force reload - compact styling update
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Profile form state
  const [fullName, setFullName] = useState('')

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Checking user authentication...')
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Auth error:', error)
          throw error
        }
        
        if (!user) {
          console.log('No user found, redirecting to login')
          router.push('/login')
          return
        }

        console.log('User authenticated:', user.email)
        setUser(user)
        setFullName(user.user_metadata?.full_name || '')
        await fetchProfile(user.id)
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/login')
      }
    }

    checkUser()
  }, [router])

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id)
    }
  }, [user?.id])

  const ensureUserRecord = async (authUser: User) => {
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking user record:', existingError)
      return
    }

    if (existing) return

    const payload = {
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name || '',
      role: 'user'
    }

    const { error: insertError } = await supabase
      .from('users')
      .insert(payload)

    if (insertError && insertError.code !== '23505') {
      console.error('Error ensuring user record:', insertError)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data: byId, error: byIdError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (byIdError) {
        throw byIdError
      }

      if (byId) {
        setProfile(byId)
        setFullName(byId.full_name || '')
        return
      }

      // Fallback by email in case the users table row uses email as the id or id mismatch
      if (user?.email) {
        const { data: byEmail, error: byEmailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .maybeSingle()

        if (byEmailError) {
          throw byEmailError
        }

        if (byEmail) {
          setProfile(byEmail)
          setFullName(byEmail.full_name || '')
          return
        }
      }

      if (user) {
        await ensureUserRecord(user)
      }

      if (user?.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name)
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (authUpdateError) throw authUpdateError

      const { error: updateByIdError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          email: user.email
        })
        .eq('id', user.id)

      if (updateByIdError) {
        // If update by id fails, try by email as a fallback
        await supabase
          .from('users')
          .update({ full_name: fullName })
          .eq('email', user.email)
      }

      setMessage('Profile updated successfully!')
      setEditing(false)

      await fetchProfile(user.id)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error: passwordError } = await supabase.auth.updateUser({ 
        password: newPassword 
      })

      if (passwordError) throw passwordError

      setMessage('Password updated successfully!')
      setShowPasswordForm(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase mb-2">
            User Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your account settings and personal information
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-lg">
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              {message}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Debug Info:</h4>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 font-mono">
              <div>User ID: {user?.id || 'null'}</div>
              <div>User Email: {user?.email || 'null'}</div>
              <div>Profile Loaded: {profile ? 'Yes' : 'No'}</div>
              <div>Profile ID: {profile?.id || 'null'}</div>
              <div>Profile Email: {profile?.email || 'null'}</div>
              <div>Profile Full Name: {profile?.full_name || 'null'}</div>
              <div>Profile Last Sign In: {profile?.last_sign_in_at || 'null'}</div>
              <div>Form Full Name Value: {fullName || 'null'}</div>
            </div>
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase">
                Profile Information
              </h3>
              <button
                onClick={() => {
                  if (editing) {
                    handleUpdateProfile()
                  } else {
                    setEditing(true)
                    setFullName(profile?.full_name || '')
                  }
                }}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary hover:bg-primary/90 text-white rounded transition-colors font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : editing ? (
                  <>
                    <Save className="h-3 w-3" />
                    Save
                  </>
                ) : (
                  'Edit'
                )}
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              {/* Email */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <Mail className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Email Address</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              {/* Full Name */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <UserIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Full Name</span>
                </div>
                {editing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className={!fullName
                    ? "text-sm text-gray-500 dark:text-gray-400 italic" 
                    : "text-sm font-medium text-gray-900 dark:text-white"
                  }>
                    {fullName || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-3 sm:p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase mb-4">
              Account Information
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              {/* User ID */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <UserIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">User ID</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block">
                  {user?.id}
                </p>
              </div>

              {/* Created Date */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <UserIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Member Since</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString()
                    : user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'Unknown'}
                </p>
              </div>

              {/* Last Sign In */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <UserIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Last Sign In</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile?.last_sign_in_at
                    ? new Date(profile.last_sign_in_at).toLocaleDateString()
                    : user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>

              {/* Email Confirmed */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <Mail className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Email Status</span>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.email_confirmed_at
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                }`}>
                  {user?.email_confirmed_at ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Password Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase">
                Password Settings
              </h3>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Lock className="h-3 w-3" />
                {showPasswordForm ? 'Cancel' : 'Change'}
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              {showPasswordForm ? (
                <>
                  {/* New Password */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <Lock className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">New Password</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-2 py-1.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Confirm Password */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <Lock className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Confirm Password</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-2 py-1.5 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="p-3 flex gap-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading || !newPassword || !confirmPassword}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary hover:bg-primary/90 text-white rounded transition-colors font-medium disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" />
                          Update
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordForm(false)
                        setNewPassword('')
                        setConfirmPassword('')
                      }}
                      className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <Lock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your password is secure and encrypted</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Click "Change" above to update your password</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}