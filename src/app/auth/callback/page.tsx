'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { supabase } = await import('@/lib/supabase')
        
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Auth callback error:', error)
            setStatus('error')
            setTimeout(() => router.push('/login'), 3000)
            return
          }
        }
        
        setStatus('success')
        router.push('/active-accounts')
      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('error')
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  if (status === 'error') {
    return (
      <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="px-4 py-8 bg-white shadow dark:bg-gray-800 sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mb-4 text-red-500">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Authentication Error</h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Authentication failed. Please try again.</p>
              <p className="text-xs text-gray-400">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow dark:bg-gray-800 sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Confirming your email...</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we complete your registration.</p>
          </div>
        </div>
      </div>
    </div>
  )
}