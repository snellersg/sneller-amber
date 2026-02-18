'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from 'react'
import { supabase, waitForHealthyConnection } from '@/lib/supabase'
import { networkMonitor, waitForNetwork } from '@/lib/network-monitor'
import { appLifecycle } from '@/lib/mobile-lifecycle'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isLoading: boolean
  userEmail: string | null
  connectionStatus: 'healthy' | 'unhealthy' | 'recovering'
  refreshAuth: () => Promise<void>
  forceReconnect: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    console.warn('useAuth called outside AuthProvider - returning safe defaults')
    return {
      user: null,
      isAdmin: false,
      isLoading: false,
      userEmail: null,
      connectionStatus: 'unhealthy' as const,
      refreshAuth: async () => {},
      forceReconnect: async () => {},
    }
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'healthy' | 'unhealthy' | 'recovering'>(
    'healthy'
  )
  const [hasError, setHasError] = useState(false)

  const isInitializedRef = useRef(false)
  const currentUserRef = useRef<User | null>(null)
  const recoveryInProgressRef = useRef(false)

  // Update the ref when user changes
  useEffect(() => {
    currentUserRef.current = user
  }, [user])

  const checkAdminStatus = useCallback(async (authUser: User) => {
    if (!authUser) return

    try {
      // Wait for network and Supabase to be healthy before checking admin status
      await Promise.race([
        waitForNetwork(5000),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 5000)),
      ])

      await Promise.race([
        waitForHealthyConnection(5000),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 5000)),
      ])

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .maybeSingle()

      // Only process real errors (not empty objects)
      const hasRealError =
        userError &&
        typeof userError === 'object' &&
        (userError.message || userError.code || userError.details)

      if (hasRealError) {
        console.error('Error checking admin status:', userError)
        setIsAdmin(false)
      } else if (userData?.role === 'admin') {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      // Silently handle timeouts and network errors - just set to non-admin
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('Network')) {
          console.log('Network/timeout error during admin check - setting non-admin')
        } else {
          console.error('Unexpected error during admin check:', error)
        }
      }
      setIsAdmin(false)
    }
  }, [])

  const updateLastSignIn = useCallback(async (authUser: User) => {
    if (!authUser) return

    try {
      // Only update if network is available
      if (!networkMonitor.isNetworkAvailable()) {
        console.log('[Auth] Skipping last sign in update - network unavailable')
        return
      }

      // Update last_sign_in_at timestamp silently
      const { error } = await supabase
        .from('users')
        .update({
          last_sign_in_at: new Date().toISOString(),
        })
        .eq('id', authUser.id)

      if (error) {
        // Silent failure - don't disrupt user experience
        console.log('Could not update last sign in:', error.message)
      }
    } catch (error) {
      // Silent failure
      console.log('Error updating last sign in:', error)
    }
  }, [])

  const refreshAuth = useCallback(async () => {
    if (recoveryInProgressRef.current) {
      console.log('[Auth] Recovery already in progress, skipping refresh')
      return
    }

    try {
      setConnectionStatus('recovering')
      console.log('[Auth] Starting auth refresh...')

      // Wait for network to be available first
      try {
        await waitForNetwork(10000) // 10 second timeout
      } catch (networkError) {
        console.log('[Auth] Network not available for auth refresh')
        setConnectionStatus('unhealthy')
        return
      }

      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error('[Auth] Refresh error:', error.message)

        // Handle invalid refresh token errors gracefully
        if (
          error.message?.includes('Invalid Refresh Token') ||
          error.message?.includes('Refresh Token Not Found') ||
          error.message?.includes('refresh_token_not_found')
        ) {
          console.warn('Invalid refresh token detected, clearing auth state')
          await supabase.auth.signOut({ scope: 'local' })
          setUser(null)
          setIsAdmin(false)
          setUserEmail(null)
        }

        setConnectionStatus('unhealthy')
        return
      }

      if (!authUser) {
        console.log('[Auth] No user from refresh')
        setUser(null)
        setIsAdmin(false)
        setUserEmail(null)
        setConnectionStatus('healthy')
        return
      }

      console.log('[Auth] Auth refresh successful')
      setUser(authUser)
      setUserEmail(authUser.email || null)
      setConnectionStatus('healthy')

      // Check admin status synchronously to prevent race conditions
      try {
        await checkAdminStatus(authUser)
      } catch (err) {
        console.error('Refresh admin check failed:', err)
        setIsAdmin(false)
      }
    } catch (error: unknown) {
      // Handle different types of errors appropriately
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Auth] Critical refresh error:', errorMessage)

      if (
        errorMessage.includes('Invalid Refresh Token') ||
        errorMessage.includes('Refresh Token Not Found')
      ) {
        console.warn('Invalid refresh token detected, clearing auth state')
        await supabase.auth.signOut({ scope: 'local' })
        setUser(null)
        setIsAdmin(false)
        setUserEmail(null)
      }

      setConnectionStatus('unhealthy')
    }
  }, [checkAdminStatus])

  // Enhanced force reconnect function for mobile scenarios
  const forceReconnect = useCallback(async () => {
    if (recoveryInProgressRef.current) {
      console.log('[Auth] Recovery already in progress')
      return
    }

    recoveryInProgressRef.current = true

    try {
      setConnectionStatus('recovering')
      console.log('[Auth] Starting force reconnect...')

      // First, wait for network
      await waitForNetwork(15000)

      // Wait for Supabase to be healthy
      await waitForHealthyConnection(10000)

      // Try to refresh the session
      const { error: refreshError } = await supabase.auth.refreshSession()

      if (refreshError) {
        console.error('[Auth] Session refresh failed during reconnect:', refreshError)

        // Clear session and try to get a fresh one
        await supabase.auth.signOut({ scope: 'local' })

        // Check if we have any stored session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          console.log('[Auth] Found session after reconnect')
          setUser(session.user)
          setUserEmail(session.user.email || null)
          checkAdminStatus(session.user).catch(console.error)
        } else {
          console.log('[Auth] No session available after reconnect')
          setUser(null)
          setIsAdmin(false)
          setUserEmail(null)
        }
      } else {
        console.log('[Auth] Session refresh successful during reconnect')
        // Refresh auth to get updated user data
        await refreshAuth()
      }

      setConnectionStatus('healthy')
    } catch (error) {
      console.error('[Auth] Force reconnect failed:', error)
      setConnectionStatus('unhealthy')
    } finally {
      recoveryInProgressRef.current = false
    }
  }, [refreshAuth, checkAdminStatus])

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null
    let subscription:
      | ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription']
      | null = null
    let initTimeout: NodeJS.Timeout | null = null

    // Wrap everything in try-catch to prevent provider crashes
    try {
      // Enhanced initialization with better mobile support
      const initAuth = async () => {
        console.log('Starting enhanced auth initialization...')

        try {
          // Wait a bit for app lifecycle to stabilize on mobile
          if (typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }

          const {
            data: { session },
          } = await supabase.auth.getSession()
          console.log('Got session:', !!session?.user)

          if (session?.user) {
            setUser(session.user)
            setUserEmail(session.user.email || null)
            setConnectionStatus('healthy')

            // Check admin status synchronously to prevent race conditions
            try {
              await checkAdminStatus(session.user)
            } catch (err) {
              console.error('Initial admin check failed:', err)
              setIsAdmin(false)
            }
          } else {
            setUser(null)
            setUserEmail(null)
            setIsAdmin(false)
            setConnectionStatus('healthy')
          }
        } catch (error) {
          console.error('Auth init error:', error)
          setUser(null)
          setUserEmail(null)
          setIsAdmin(false)
          setConnectionStatus('unhealthy')
        } finally {
          console.log('Setting loading to false')
          setIsLoading(false)
          isInitializedRef.current = true
        }
      }

      // Emergency timeout - 8 seconds max for mobile
      initTimeout = setTimeout(() => {
        console.warn('EMERGENCY: Auth timeout - forcing loading off')
        setIsLoading(false)
        setConnectionStatus('unhealthy')
        isInitializedRef.current = true
      }, 8000)

      // Start initialization
      initAuth()
        .catch(error => {
          console.error('Init auth failed:', error)
          setIsLoading(false)
          setConnectionStatus('unhealthy')
          isInitializedRef.current = true
        })
        .finally(() => {
          if (initTimeout) {
            clearTimeout(initTimeout)
            initTimeout = null
          }
        })

      // Set up enhanced lifecycle monitoring
      const handleAppReturnFromBackground = () => {
        console.log('[Auth] App returned from background - checking auth state')
        if (isInitializedRef.current && currentUserRef.current) {
          // Force a connection check and auth refresh
          setTimeout(() => forceReconnect(), 1000)
        }
      }

      const handleNetworkReconnected = () => {
        console.log('[Auth] Network reconnected - refreshing auth')
        if (isInitializedRef.current) {
          setTimeout(() => refreshAuth(), 500)
        }
      }

      const handleSupabaseAuthRecoveryNeeded = () => {
        console.log('[Auth] Supabase auth recovery needed')
        if (isInitializedRef.current) {
          setTimeout(() => forceReconnect(), 1000)
        }
      }

      // Add event listeners
      if (typeof window !== 'undefined') {
        window.addEventListener('app-return-from-background', handleAppReturnFromBackground)
        window.addEventListener('network-reconnected', handleNetworkReconnected)
        window.addEventListener('supabase-auth-recovery-needed', handleSupabaseAuthRecoveryNeeded)
      }

      // Set up session refresh (every 25 minutes) - more frequent for mobile
      if (typeof window !== 'undefined') {
        refreshInterval = setInterval(
          async () => {
            try {
              // Only refresh if network is available and app is active
              if (!networkMonitor.isNetworkAvailable()) {
                console.log('[Auth] Skipping auto-refresh - network unavailable')
                return
              }

              if (!appLifecycle.isActive()) {
                console.log('[Auth] Skipping auto-refresh - app not active')
                return
              }

              // Check if we have a valid session before attempting refresh
              const {
                data: { session },
                error: sessionError,
              } = await supabase.auth.getSession()

              if (sessionError) {
                console.error('Error getting session:', sessionError)
                return
              }

              if (!session) {
                console.log('No active session, skipping auto-refresh')
                return
              }

              console.log('Auto-refreshing session...')
              const { error } = await supabase.auth.refreshSession()

              if (error) {
                console.error('Session refresh failed:', error)

                // If refresh token is invalid, clear the session and stop trying
                if (
                  error.message?.includes('Invalid Refresh Token') ||
                  error.message?.includes('Refresh Token Not Found') ||
                  error.message?.includes('refresh_token_not_found')
                ) {
                  console.warn('Invalid refresh token detected, clearing session')
                  await supabase.auth.signOut({ scope: 'local' })
                  if (refreshInterval) {
                    clearInterval(refreshInterval)
                    refreshInterval = null
                  }
                }
              } else {
                console.log('Session refreshed successfully')
              }
            } catch (error) {
              console.error('Error during session refresh:', error)
            }
          },
          25 * 60 * 1000
        ) // 25 minutes - more frequent for mobile
      }

      // Listen for auth state changes with enhanced error handling
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          console.log('Auth state change:', event, !!session?.user)

          if (event === 'SIGNED_OUT' || !session?.user) {
            setUser(null)
            setIsAdmin(false)
            setUserEmail(null)
            setConnectionStatus('healthy')

            // Only set loading to false if we're initialized
            if (isInitializedRef.current) {
              setIsLoading(false)
            }
            return
          }

          if (session?.user) {
            setUser(session.user)
            setUserEmail(session.user.email || null)
            setConnectionStatus('healthy')

            // CRITICAL: Set loading to false IMMEDIATELY so UI can render
            if (isInitializedRef.current) {
              setIsLoading(false)
            }

            // Only recheck admin status if user changed or on initial sign in
            // Preserve admin status during token refresh to prevent race conditions
            const shouldRecheckAdmin = 
              event === 'SIGNED_IN' || 
              (currentUserRef.current?.id !== session.user.id)

            if (shouldRecheckAdmin) {
              console.log('[Auth] Rechecking admin status due to:', event)
              try {
                await checkAdminStatus(session.user)
              } catch (err) {
                console.error('State change admin check failed:', err)
                setIsAdmin(false)
              }
            } else {
              console.log('[Auth] Preserving admin status during', event)
            }

            // Update last sign in for SIGNED_IN events only
            if (event === 'SIGNED_IN') {
              updateLastSignIn(session.user).catch(err =>
                console.error('Failed to update last sign in:', err)
              )
            }
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error)
          setConnectionStatus('unhealthy')

          if (isInitializedRef.current) {
            setIsLoading(false)
          }
        }
      })

      subscription = authSubscription

      return () => {
        try {
          subscription?.unsubscribe()

          if (refreshInterval) {
            clearInterval(refreshInterval)
            refreshInterval = null
          }

          if (initTimeout) {
            clearTimeout(initTimeout)
            initTimeout = null
          }

          // Remove event listeners
          if (typeof window !== 'undefined') {
            window.removeEventListener('app-return-from-background', handleAppReturnFromBackground)
            window.removeEventListener('network-reconnected', handleNetworkReconnected)
            window.removeEventListener(
              'supabase-auth-recovery-needed',
              handleSupabaseAuthRecoveryNeeded
            )
          }
        } catch (error) {
          console.error('Error in auth cleanup:', error)
        }
      }
    } catch (error) {
      console.error('Critical error in auth setup:', error)
      setIsLoading(false)
      setConnectionStatus('unhealthy')
      setHasError(true)
    }
  }, [refreshAuth, checkAdminStatus, updateLastSignIn, forceReconnect])

  // If there was a critical error, still render children with safe defaults
  if (hasError) {
    console.warn('AuthProvider encountered an error but continuing with safe defaults')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        userEmail,
        connectionStatus,
        refreshAuth,
        forceReconnect,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
