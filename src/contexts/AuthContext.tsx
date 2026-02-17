'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isLoading: boolean
  userEmail: string | null
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
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

  const checkAdminStatus = useCallback(async (authUser: User) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', authUser.email)
        .single()
      
      if (!userError && userData?.role === 'admin') {
        setIsAdmin(true)
      } else {
        // Fallback to user metadata
        const metadataAdmin = authUser.user_metadata?.isAdmin || authUser.user_metadata?.is_admin || false
        setIsAdmin(metadataAdmin)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }, [])

  const refreshAuth = useCallback(async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (error || !authUser) {
        setUser(null)
        setIsAdmin(false)
        setUserEmail(null)
        return
      }

      setUser(authUser)
      setUserEmail(authUser.email || null)
      await checkAdminStatus(authUser)
    } catch (error) {
      console.error('Error refreshing auth:', error)
      setUser(null)
      setIsAdmin(false)
      setUserEmail(null)
    }
  }, [checkAdminStatus])

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null
    let subscription: any = null

    // Initial auth check
    const initAuth = async () => {
      setIsLoading(true)
      await refreshAuth()
      setIsLoading(false)
    }

    initAuth()

    // Set up session refresh (every 50 minutes) - only in browser
    if (typeof window !== 'undefined') {
      refreshInterval = setInterval(async () => {
        try {
          console.log('Auto-refreshing session...')
          const { error } = await supabase.auth.refreshSession()
          if (error) {
            console.error('Session refresh failed:', error)
          }
        } catch (error) {
          console.error('Error during session refresh:', error)
        }
      }, 50 * 60 * 1000) // 50 minutes
    }

    // Listen for auth state changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session?.user)
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null)
          setIsAdmin(false)
          setUserEmail(null)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
          setUserEmail(session.user.email || null)
          await checkAdminStatus(session.user)
        }

        setIsLoading(false)
      }
    )
    
    subscription = authSubscription

    return () => {
      subscription?.unsubscribe()
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [refreshAuth, checkAdminStatus])

  const contextValue = useMemo(() => ({
    user,
    isAdmin,
    isLoading,
    userEmail,
    refreshAuth
  }), [user, isAdmin, isLoading, userEmail, refreshAuth])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}