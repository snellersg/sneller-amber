'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
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
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }

      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setDepartment(data.department || '')
        setPhone(data.phone || '')
      }
    } catch (err: any) {
      setError('Failed to load profile')
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user') }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      return { data, error }
    } catch (err: any) {
      return { error: err }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      return { error }
    } catch (err: any) {
      return { error: err }
    }
  }

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setDepartment(profile.department || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error: updateError } = await updateProfile({
        full_name: fullName,
        department,
        phone,
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
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
      const { error: passwordError } = await updatePassword(newPassword)

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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-lg text-gray-600">
            Manage your account information and settings
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              {message}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Account Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Account Information
              </CardTitle>
              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="h-4 w-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!editing}
                  placeholder="Your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Department */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="h-4 w-4" />
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={!editing}
                  placeholder="e.g., Operations, Sales, Admin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!editing}
                  placeholder="(123) 456-7890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false)
                      setFullName(profile?.full_name || '')
                      setDepartment(profile?.department || '')
                      setPhone(profile?.phone || '')
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
              {!showPasswordForm && (
                <Button
                  onClick={() => setShowPasswordForm(true)}
                  variant="outline"
                  size="sm"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showPasswordForm ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-gray-600">
                Keep your account secure by using a strong password and updating it regularly.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Account Created:</dt>
                <dd className="font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'Unknown'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last Updated:</dt>
                <dd className="font-medium">
                  {profile?.updated_at
                    ? new Date(profile.updated_at).toLocaleDateString()
                    : 'Never'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">User ID:</dt>
                <dd className="font-medium font-mono text-xs">
                  {user.id}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email Confirmed:</dt>
                <dd className="font-medium">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.email_confirmed_at
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.email_confirmed_at ? 'Yes' : 'Pending'}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}