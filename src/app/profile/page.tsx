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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              USER PROFILE
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your account settings and personal information
            </p>
          </div>
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
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                PROFILE INFORMATION
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
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : editing ? (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                ) : (
                  'Edit Profile'
                )}
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-x-8 sm:gap-y-6">
                {/* Email */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">EMAIL ADDRESS</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{user?.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                {/* Full Name */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">FULL NAME</span>
                  </div>
                  {editing ? (
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className={!profile?.full_name 
                      ? "text-gray-500 dark:text-gray-400 italic" 
                      : "text-gray-900 dark:text-white font-medium"
                    }>
                      {profile?.full_name || 'Not set'}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">DEPARTMENT</span>
                  </div>
                  {editing ? (
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your department"
                    />
                  ) : (
                    <p className={!profile?.department 
                      ? "text-gray-500 dark:text-gray-400 italic" 
                      : "text-gray-900 dark:text-white font-medium"
                    }>
                      {profile?.department || 'Not set'}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">PHONE NUMBER</span>
                  </div>
                  {editing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className={!profile?.phone 
                      ? "text-gray-500 dark:text-gray-400 italic" 
                      : "text-gray-900 dark:text-white font-medium"
                    }>
                      {profile?.phone || 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-3 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                PASSWORD SETTINGS
              </h3>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Lock className="h-4 w-4" />
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
              {showPasswordForm ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <Lock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">NEW PASSWORD</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <Lock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">CONFIRM PASSWORD</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading || !newPassword || !confirmPassword}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordForm(false)
                        setNewPassword('')
                        setConfirmPassword('')
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Your password is secure and encrypted</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Click "Change Password" above to update your password</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-3 sm:p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              ACCOUNT INFORMATION
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-x-8 sm:gap-y-6">
                {/* User ID */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">USER ID</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {user?.id}
                  </p>
                </div>

                {/* Created Date */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">MEMBER SINCE</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString()
                      : user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : 'Unknown'}
                  </p>
                </div>

                {/* Last Updated */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">LAST UPDATED</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>

                {/* Email Confirmed */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">EMAIL STATUS</span>
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
      </div>
    </Layout>
  )
}