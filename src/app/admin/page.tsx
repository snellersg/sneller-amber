'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase, waitForHealthyConnection, isSupabaseHealthy } from '@/lib/supabase'
import { useNetworkState } from '@/lib/network-monitor'
import { useAppLifecycle } from '@/lib/mobile-lifecycle'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import { Users, Shield, Loader2, Plus, Trash2, Crown, CheckCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  last_sign_in_at: string
  status?: string // Calculated from auth data, not stored in DB
  role?: string
  email_confirmed_at?: string | null // From Supabase auth
  email_verified?: boolean // From Supabase auth
}

interface AllowedDomain {
  id: string
  domain: string
  notes?: string
  added_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const {
    user,
    isAdmin,
    userEmail,
    isLoading: authLoading,
    connectionStatus,
    forceReconnect,
  } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [allowedDomains, setAllowedDomains] = useState<AllowedDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'domains'>('users')
  const [newDomain, setNewDomain] = useState('')
  const [domainNotes, setDomainNotes] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Refs for component lifecycle and network state
  const isComponentMountedRef = useRef(true)
  const lastFetchAttemptRef = useRef(0)
  const isNetworkAvailable = useNetworkState()

  // Derive network status description
  const statusDescription = isNetworkAvailable ? 'Online' : 'Offline'

  // Enhanced error handling and retry logic
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`[Admin] ${operation} failed:`, error)

    if (!isComponentMountedRef.current) return

    let errorMessage = 'An unexpected error occurred'

    if (error?.message) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network connection issue. Please check your connection.'
      } else if (error.message.includes('unauthorized') || error.message.includes('403')) {
        errorMessage = 'You do not have permission to perform this action.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
      } else if (error.message.includes('Invalid Refresh Token') || error.message.includes('session')) {
        errorMessage = 'Your session has expired. Please log in again.'
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        errorMessage = error.message
      }
    }

    setError(errorMessage)
    setLoading(false)
  }, [])

  // Retry with exponential backoff
  const retryWithBackoff = useCallback(
    async (operation: () => Promise<void>, maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await operation()
          setRetryCount(0) // Reset on success
          return
        } catch (error) {
          console.log(`[Admin] Attempt ${attempt}/${maxRetries} failed:`, error)

          if (attempt === maxRetries) {
            handleError(error, 'Operation')
            return
          }

          // Exponential backoff: wait longer between retries
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
          console.log(`[Admin] Waiting ${delay}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    },
    [handleError]
  )

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      if (!isAdmin) {
        router.push('/')
        return
      }
    }
  }, [authLoading, user, isAdmin, router])

  // Enhanced data fetching with better error handling
  const fetchAllData = useCallback(async () => {
    if (!user || !isAdmin || !isComponentMountedRef.current) {
      console.log('[Admin] Skipping data fetch - user not admin or component unmounted')
      return
    }

    // Prevent too frequent fetches
    const now = Date.now()
    if (now - lastFetchAttemptRef.current < 5000) {
      // 5 second minimum between attempts
      console.log('[Admin] Skipping fetch - too soon since last attempt')
      return
    }
    lastFetchAttemptRef.current = now

    setLoading(true)
    setError(null)

    try {
      // Wait for network and Supabase to be healthy
      if (!isNetworkAvailable) {
        throw new Error('Network not available')
      }

      if (!isSupabaseHealthy()) {
        console.log('[Admin] Waiting for Supabase to be healthy...')
        await waitForHealthyConnection(10000)
      }

      // Fetch data in parallel
      const [usersResult, domainsResult] = await Promise.allSettled([
        fetchUsers(),
        fetchAllowedDomains(),
      ])

      // Handle results
      if (usersResult.status === 'rejected') {
        console.error('[Admin] Users fetch failed:', usersResult.reason)
      }

      if (domainsResult.status === 'rejected') {
        console.error('[Admin] Domains fetch failed:', domainsResult.reason)
      }

      // If both failed, show error
      if (usersResult.status === 'rejected' && domainsResult.status === 'rejected') {
        throw new Error('Failed to load admin data. Please check your connection and try again.')
      }
    } catch (error) {
      handleError(error, 'Data fetch')
    } finally {
      if (isComponentMountedRef.current) {
        setLoading(false)
      }
    }
  }, [user, isAdmin, isNetworkAvailable, handleError])

  // Load data when authenticated as admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      fetchAllData()
    }
  }, [authLoading, user, isAdmin, fetchAllData])

  // Handle app lifecycle changes
  useEffect(() => {
    const handleAppReturnFromBackground = () => {
      console.log('[Admin] App returned from background - refreshing data')
      if (user && isAdmin && isComponentMountedRef.current) {
        // Small delay to let connections stabilize
        setTimeout(() => {
          fetchAllData()
        }, 2000)
      }
    }

    const handleNetworkReconnected = () => {
      console.log('[Admin] Network reconnected - refreshing data')
      if (user && isAdmin && isComponentMountedRef.current) {
        setTimeout(() => {
          fetchAllData()
        }, 1000)
      }
    }

    window.addEventListener('app-return-from-background', handleAppReturnFromBackground)
    window.addEventListener('network-reconnected', handleNetworkReconnected)

    return () => {
      window.removeEventListener('app-return-from-background', handleAppReturnFromBackground)
      window.removeEventListener('network-reconnected', handleNetworkReconnected)
    }
  }, [user, isAdmin])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false
    }
  }, [])

  // Periodic session refresh for long-running admin sessions
  useEffect(() => {
    if (!user || !isAdmin) return

    const refreshInterval = setInterval(async () => {
      try {
        // Check if session is still valid
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (error || !currentUser) {
          console.log('[Admin] Session expired, redirecting to login')
          router.push('/login')
          return
        }
        
        // Refresh data if page has been open for a while
        const pageOpenTime = Date.now() - lastFetchAttemptRef.current
        if (pageOpenTime > 300000) { // 5 minutes
          console.log('[Admin] Refreshing data for long-running session')
          fetchAllData()
        }
      } catch (error) {
        console.error('[Admin] Session check error:', error)
      }
    }, 60000) // Check every minute

    return () => clearInterval(refreshInterval)
  }, [user, isAdmin, router, fetchAllData])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">
              {connectionStatus === 'recovering' ? 'Reconnecting...' : 'Checking admin access...'}
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  // Show connection issues
  if (connectionStatus === 'unhealthy' && !authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-yellow-600 dark:text-yellow-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connection Issue
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Unable to connect to the server.{' '}
                {!isNetworkAvailable
                  ? 'Please check your internet connection.'
                  : 'Please try again.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => retryWithBackoff(() => forceReconnect())}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Try to Reconnect
                </button>
                <p className="text-sm text-gray-500">
                  Network: {statusDescription} • Connection: {connectionStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Don't render anything if not authenticated or not admin (will redirect)
  if (!user || !isAdmin) {
    return null
  }

  // Show error state with retry option
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setError(null)
                    retryWithBackoff(() => fetchAllData())
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setError(null)
                    retryWithBackoff(() => forceReconnect()).then(() => {
                      setTimeout(() => retryWithBackoff(() => fetchAllData()), 1000)
                    })
                  }}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Force Reconnect
                </button>
                <p className="text-sm text-gray-500">Retry attempt: {retryCount}/3</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const fetchUsers = useCallback(async () => {
    if (!isAdmin || !isComponentMountedRef.current) {
      console.log('[fetchUsers] Skipping - user not admin or component unmounted')
      return
    }

    try {
      // Check network and Supabase health
      if (!isNetworkAvailable) {
        throw new Error('Network not available')
      }

      if (!isSupabaseHealthy()) {
        await waitForHealthyConnection(10000)
      }

      // Get auth session for API call
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session available')
      }

      console.log('[fetchUsers] Fetching users from API...')

      // Fetch users from API route with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch('/api/admin/get-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`API error: ${response.status} - ${error}`)
      }

      const { users: usersData } = await response.json()
      console.log('[fetchUsers] Received', usersData?.length || 0, 'users from API')

      // Map users with real-time email verification status from Supabase auth
      const usersWithStatus =
        usersData?.map((user: User) => {
          return {
            id: user.id,
            email: user.email,
            full_name: user.full_name || user.email.split('@')[0] || 'Unknown',
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at || 'Never',
            status: user.email_verified ? 'verified' : 'pending',
            role: user.role || 'user',
            email_confirmed_at: user.email_confirmed_at,
          }
        }) || []

      console.log('[fetchUsers] Setting', usersWithStatus.length, 'users to state')
      if (isComponentMountedRef.current) {
        setUsers(usersWithStatus)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[fetchUsers] Request was aborted')
        throw new Error('Request timed out')
      }
      console.error('[fetchUsers] Exception:', error)
      throw error // Re-throw to be handled by retry logic
    }
  }, [isAdmin, isNetworkAvailable])

  const fetchAllowedDomains = useCallback(async () => {
    if (!isAdmin || !isComponentMountedRef.current) {
      console.log('[fetchAllowedDomains] Skipping - user not admin or component unmounted')
      return
    }

    try {
      // Check network and Supabase health
      if (!isNetworkAvailable) {
        throw new Error('Network not available')
      }

      if (!isSupabaseHealthy()) {
        await waitForHealthyConnection(10000)
      }

      const { data, error } = await supabase
        .from('allowed_domains')
        .select('*')
        .order('added_at', { ascending: false })

      if (error) {
        throw error
      }

      const domains = data || []

      // Check if required domains exist (with @ prefix)
      const requiredDomains = ['@snellersg.com', '@snellerslandscaping.com']
      const existingDomains = domains.map(d => d.domain)
      const missingDomains = requiredDomains.filter(d => !existingDomains.includes(d))

      // Add missing required domains silently
      for (const domain of missingDomains) {
        if (isComponentMountedRef.current) {
          try {
            console.log(`[fetchAllowedDomains] Adding missing required domain: ${domain}`)
            await supabase.from('allowed_domains').insert({
              domain: domain,
              notes: 'Required company domain',
            })

            // Re-fetch to get the complete list
            const { data: updatedData } = await supabase
              .from('allowed_domains')
              .select('*')
              .order('added_at', { ascending: false })

            if (updatedData && isComponentMountedRef.current) {
              setAllowedDomains(updatedData)
              return
            }
          } catch (insertError) {
            console.warn(
              `[fetchAllowedDomains] Could not add required domain ${domain}:`,
              insertError
            )
          }
        }
      }

      if (isComponentMountedRef.current) {
        setAllowedDomains(domains)
      }
    } catch (error) {
      console.error('[fetchAllowedDomains] Exception:', error)
      throw error // Re-throw to be handled by retry logic
    }
  }, [isAdmin, isNetworkAvailable])

  const ensureRequiredDomains = async (missingDomains: string[]) => {
    const domainData = missingDomains.map(domain => ({
      domain,
      notes:
        domain === '@snellersg.com'
          ? 'Primary company domain'
          : 'Legacy landscaping division domain',
    }))

    try {
      for (const data of domainData) {
        const { error } = await supabase.from('allowed_domains').insert(data)

        if (error && error.code !== '23505') {
          console.error('Error ensuring domain:', data.domain, error)
        } else {
          console.log('Successfully ensured domain:', data.domain)
        }
      }
    } catch (error) {
      console.error('Error in ensureRequiredDomains:', error)
    }
  }

  const bootstrapDefaultDomains = async () => {
    const defaultDomains = [
      { domain: '@snellersg.com', notes: 'Primary company domain' },
      {
        domain: '@snellerslandscaping.com',
        notes: 'Legacy landscaping division domain',
      },
    ]

    try {
      for (const domainData of defaultDomains) {
        const { error } = await supabase.from('allowed_domains').insert(domainData)

        if (error && error.code !== '23505') {
          // Ignore duplicate key errors
          console.error('Error adding default domain:', domainData.domain, error)
        }
      }

      // Refresh the list after adding defaults
      const { data } = await supabase
        .from('allowed_domains')
        .select('*')
        .order('added_at', { ascending: false })

      setAllowedDomains(data || [])
    } catch (error) {
      console.error('Error bootstrapping default domains:', error)
    }
  }

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDomain.trim()) return

    try {
      // Ensure domain has @ prefix for consistency
      let formattedDomain = newDomain.toLowerCase().trim()
      if (!formattedDomain.startsWith('@')) {
        formattedDomain = '@' + formattedDomain
      }

      const { error } = await supabase.from('allowed_domains').insert({
        domain: formattedDomain,
        notes: domainNotes.trim() || null,
      })

      if (error) {
        console.error('Error adding domain:', error)
        return
      }

      setNewDomain('')
      setDomainNotes('')
      fetchAllowedDomains()
    } catch (error) {
      console.error('Error in addDomain:', error)
    }
  }

  const removeDomain = async (id: string, domain: string) => {
    if (!confirm(`Remove domain "${domain}"?`)) return

    try {
      const { error } = await supabase.from('allowed_domains').delete().eq('id', id)

      if (error) {
        console.error('Error removing domain:', error)
        return
      }

      fetchAllowedDomains()
    } catch (error) {
      console.error('Error in removeDomain:', error)
    }
  }

  // Admin action functions
  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const action = newRole === 'admin' ? 'promote' : 'demote'

    if (!confirm(`${action} this user to ${newRole}?`)) return

    try {
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        return
      }

      fetchUsers()
    } catch (error) {
      console.error('Error in toggleUserRole:', error)
    }
  }

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Permanently delete user "${userEmail}"? This cannot be undone.`)) return

    try {
      const { error } = await supabase.from('users').delete().eq('id', userId)

      if (error) {
        console.error('Error deleting user:', error)
        return
      }

      fetchUsers()
    } catch (error) {
      console.error('Error in deleteUser:', error)
    }
  }

  useEffect(() => {
    if (!isAdmin || authLoading) return

    if (activeTab === 'users') {
      // Users data is already loaded via fetchAllData, just ensure it's current
      if (users.length === 0) {
        fetchUsers()
      }
    } else if (activeTab === 'domains') {
      // Domains data is already loaded via fetchAllData, just ensure it's current  
      if (allowedDomains.length === 0) {
        fetchAllowedDomains()
      }
    }
  }, [activeTab, isAdmin, authLoading])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (activeTab === 'users') {
      return (
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              REGISTERED USERS
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Users can register directly at the login page. Email verification status is updated in
              real-time from Supabase.
            </p>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="-mx-6 px-6">
              <div className="overflow-x-auto max-w-full">
                <table
                  className="w-full divide-y divide-gray-200 dark:divide-gray-700"
                  style={{ minWidth: '600px' }}
                >
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        User
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Role
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Joined
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Last Sign In
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                          <div className="flex flex-col min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {user.full_name}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 truncate text-xs">
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.status === 'verified'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                              }`}
                            >
                              {user.status === 'verified' && (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              {user.status === 'verified' ? 'Verified' : 'Pending Verification'}
                            </span>
                            {user.status === 'verified' && user.email_confirmed_at && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(user.email_confirmed_at).toLocaleDateString()}
                              </span>
                            )}
                            {user.status === 'pending' && (
                              <span className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                Awaiting email confirmation
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-primary/10 text-primary border border-primary/30'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {user.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                          <span className="hidden sm:inline">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                          <span className="sm:hidden">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                          <span className="hidden sm:inline">
                            {user.last_sign_in_at && user.last_sign_in_at !== 'Never'
                              ? new Date(user.last_sign_in_at).toLocaleDateString()
                              : 'Never'}
                          </span>
                          <span className="sm:hidden">
                            {user.last_sign_in_at && user.last_sign_in_at !== 'Never'
                              ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Never'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {/* Role Toggle Button */}
                            {user.role === 'admin' ? (
                              /* Demote Button */
                              <button
                                onClick={() => toggleUserRole(user.id, user.role || 'admin')}
                                className="inline-flex items-center p-1 sm:p-1.5 rounded text-white bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                                title="Demote to User"
                              >
                                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            ) : (
                              /* Promote Button */
                              <button
                                onClick={() => toggleUserRole(user.id, user.role || 'user')}
                                className="inline-flex items-center p-2 rounded-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                                title="Promote to Admin"
                              >
                                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}

                            {/* Delete User Button */}
                            <button
                              onClick={() => deleteUser(user.id, user.email)}
                              className="inline-flex items-center p-1 sm:p-1.5 rounded text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'domains') {
      return (
        <div className="p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Allowed Domains
            </h2>
          </div>

          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white uppercase mb-2 sm:mb-3">
              Add New Domain
            </h3>
            <form
              onSubmit={addDomain}
              className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4"
            >
              <div className="flex-1">
                <input
                  placeholder="@example.com"
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div className="flex-1">
                <input
                  placeholder="Organization or purpose (optional)"
                  value={domainNotes}
                  onChange={e => setDomainNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Domain
              </button>
            </form>
          </div>

          {allowedDomains.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No allowed domains configured</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Added Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {allowedDomains.map(domain => (
                    <tr key={domain.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {domain.domain}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {domain.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(domain.added_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => removeDomain(domain.id, domain.domain)}
                          className="inline-flex items-center justify-center px-2 py-1.5 text-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove Domain"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {authLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Checking permissions...</span>
          </div>
        ) : !isAdmin ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              You don't have permission to access the admin panel.
            </p>
            {userEmail && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Signed in as: {userEmail}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white uppercase">
                ADMIN PANEL
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Manage users and configure access controls
              </p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-8">
              <nav className="-mb-px flex space-x-4 sm:space-x-8">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'users'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Users</span>
                    <span className="sm:hidden">({users.length})</span>
                    <span className="hidden sm:inline">({users.length})</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('domains')}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    activeTab === 'domains'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Allowed Domains</span>
                    <span className="sm:hidden">Domains</span>
                    <span className="hidden sm:inline">({allowedDomains.length})</span>
                    <span className="sm:hidden">({allowedDomains.length})</span>
                  </div>
                </button>
              </nav>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">{renderContent()}</div>
          </>
        )}
      </div>
    </Layout>
  )
}
