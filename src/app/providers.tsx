'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Global error handler for unhandled promise rejections and JS errors
function setupGlobalErrorHandling() {
  if (typeof window === 'undefined') return

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Global] Unhandled promise rejection:', event.reason)
    
    // Check if it's a session/auth related error
    const errorMessage = event.reason?.message || String(event.reason)
    const isSessionError = /session|auth|refresh.*token|Invalid.*Token|unauthorized/i.test(errorMessage)
    
    if (isSessionError) {
      console.log('[Global] Session error detected, redirecting to login')
      event.preventDefault() // Prevent default error handling
      
      // Show user-friendly message and redirect
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
      
      return
    }
    
    // Check if it's a network error
    const isNetworkError = /network|fetch|timeout|connection/i.test(errorMessage)
    if (isNetworkError) {
      console.log('[Global] Network error detected, will retry automatically')
      event.preventDefault()
      return
    }
    
    // For other errors, let the error boundary handle them
    event.preventDefault()
    
    // Dispatch a custom event to trigger error boundary
    window.dispatchEvent(new CustomEvent('app-error', {
      detail: {
        error: event.reason,
        source: 'unhandled-promise'
      }
    }))
  })

  // Handle uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('[Global] Uncaught error:', event.error)
    
    const errorMessage = event.error?.message || event.message
    const isSessionError = /session|auth|refresh.*token|Invalid.*Token|unauthorized/i.test(errorMessage)
    
    if (isSessionError) {
      console.log('[Global] Session error detected, redirecting to login')
      event.preventDefault()
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
      return
    }
    
    // Dispatch custom event for error boundary
    window.dispatchEvent(new CustomEvent('app-error', {
      detail: {
        error: event.error || new Error(event.message),
        source: 'uncaught-error'
      }
    }))
  })
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error: any) => {
              // Don't retry on auth errors
              if (error?.status === 401 || error?.status === 403) {
                return false
              }
              // Don't retry on session errors
              if (error?.message && /session|auth|refresh.*token/i.test(error.message)) {
                return false
              }
              // Retry up to 2 times for other errors
              return failureCount < 2
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  )

  // Setup global error handling on mount
  useEffect(() => {
    setupGlobalErrorHandling()
  }, [])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
