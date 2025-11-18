'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import Layout from '@/components/Layout'
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Save,
  Lock,
  Eye,
  EyeOff,
  Check,
  XCircle,
  Loader2
} from 'lucide-react'

interface UserProfile {
  id: string
  full_name: string
  department: string
  phone: string
  created_at: string
  updated_at: string
  last_active?: string
}

export default function UserProfile() {
  // Force reload - compact styling update
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Profile form state
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [phone, setPhone] = useState('')

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)
        await fetchProfile(user.id)
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/login')
      }
    }

    checkUser()
  }, [router])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setDepartment(data.department || '')
        setPhone(data.phone || '')
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
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          department: department,
          phone: phone,
          updated_at: new Date().toISOString()
        })

      if (updateError) throw updateError

      setMessage('Profile updated successfully!')
      setEditing(false)

      // Refresh profile data
      if (user) {
        await fetchProfile(user.id)
      }
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
                    setDepartment(profile?.department || '')
                    setPhone(profile?.phone || '')
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
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
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
                  <p className={!profile?.full_name 
                    ? "text-sm text-gray-500 dark:text-gray-400 italic" 
                    : "text-sm font-medium text-gray-900 dark:text-white"
                  }>
                    {profile?.full_name || 'Not set'}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <Building2 className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Department</span>
                </div>
                {editing ? (
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your department"
                  />
                ) : (
                  <p className={!profile?.department 
                    ? "text-sm text-gray-500 dark:text-gray-400 italic" 
                    : "text-sm font-medium text-gray-900 dark:text-white"
                  }>
                    {profile?.department || 'Not set'}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <Phone className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Phone Number</span>
                </div>
                {editing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className={!profile?.phone 
                    ? "text-sm text-gray-500 dark:text-gray-400 italic" 
                    : "text-sm font-medium text-gray-900 dark:text-white"
                  }>
                    {profile?.phone || 'Not set'}
                  </p>
                )}
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

              {/* Last Updated */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <UserIcon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Last Updated</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}
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
      </div>
    </Layout>
  )
}