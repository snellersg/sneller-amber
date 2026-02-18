'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        // Authenticated users go to Sheets & Docs, unauthenticated to login
        if (user) {
          router.push('/sheets-and-docs')
        } else {
          router.push('/login')
        }
      } catch {
        // On error, redirect to login
        router.push('/login')
      }
    }

    checkAuthAndRedirect()
  }, [router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg text-gray-600 dark:text-gray-300">Checking authentication...</p>
      </div>
    </div>
  )
}
