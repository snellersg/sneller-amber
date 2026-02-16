'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import TableOfContents from './TableOfContents'

// Helper function to ensure user record exists in database
const ensureUserRecord = async (authUser: User) => {
  try {
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking user record:', existingError)
      return false
    }

    if (existing) return true

    const payload = {
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name || '',
      role: 'user'
    }

    const { error: insertError } = await supabase
      .from('users')
      .insert(payload)

    if (insertError) {
      if (insertError.code === '23505') {
        // Duplicate key error - user already exists
        console.log('User record already exists (duplicate key):', authUser.email)
        return true
      }
      console.error('Error ensuring user record in Layout:', insertError)
      return false
    }
    
    console.log('User record ensured for:', authUser.email)
    return true
  } catch (error) {
    console.error('Error in ensureUserRecord:', error)
    return false
  }
}

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error
        
        if (user) {
          setUserEmail(user.email || null)
          
          // Ensure user record exists in database (backup mechanism)
          ensureUserRecord(user).catch(err => {
            console.warn('Non-critical: Could not ensure user record:', err)
          })
          
          // Check if user is admin from the users table in database
          let adminStatus = false
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('role')
              .eq('email', user.email)
              .single()
            
            if (!userError && userData?.role === 'admin') {
              adminStatus = true
            }
          } catch (roleError) {
            console.error('Error checking user role:', roleError)
            // Fallback to checking user metadata
            adminStatus = user.user_metadata?.isAdmin || user.user_metadata?.is_admin || false
          }
          
          setIsAdmin(adminStatus)
          
          // Update last_sign_in_at for existing sessions
          try {
            const timestamp = new Date().toISOString()
            const { error: updateByIdError } = await supabase
              .from('users')
              .update({ last_sign_in_at: timestamp })
              .eq('id', user.id)

            if (updateByIdError) {
              console.error('Error updating last_sign_in_at by id:', updateByIdError)
            }

            if (user.email) {
              const { error: updateByEmailError } = await supabase
                .from('users')
                .update({ last_sign_in_at: timestamp })
                .eq('email', user.email)

              if (updateByEmailError) {
                console.error('Error updating last_sign_in_at by email:', updateByEmailError)
              }
            }
          } catch (updateErr) {
            console.error('Error in last_sign_in_at update:', updateErr)
          }
        } else {
          setUserEmail(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error checking user:', error)
        setUserEmail(null)
        setIsAdmin(false)
      }
    }

    // Check user on mount
    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserEmail(session.user.email || null)
          
          // Ensure user record exists in database (backup mechanism)
          ensureUserRecord(session.user).catch(err => {
            console.warn('Non-critical: Could not ensure user record:', err)
          })
          
          // Check if user is admin from the users table in database
          let adminStatus = false
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('role')
              .eq('email', session.user.email)
              .single()
            
            if (!userError && userData?.role === 'admin') {
              adminStatus = true
            }
          } catch (roleError) {
            console.error('Error checking user role:', roleError)
            // Fallback to checking user metadata
            adminStatus = session.user.user_metadata?.isAdmin || session.user.user_metadata?.is_admin || false
          }
          
          setIsAdmin(adminStatus)
          
          // Update last_sign_in_at when user session is detected
          try {
            const timestamp = new Date().toISOString()
            const { error: updateByIdError } = await supabase
              .from('users')
              .update({ last_sign_in_at: timestamp })
              .eq('id', session.user.id)
            
            if (updateByIdError) {
              console.error('Error updating last_sign_in_at by id:', updateByIdError)
            }

            if (session.user.email) {
              const { error: updateByEmailError } = await supabase
                .from('users')
                .update({ last_sign_in_at: timestamp })
                .eq('email', session.user.email)

              if (updateByEmailError) {
                console.error('Error updating last_sign_in_at by email:', updateByEmailError)
              }
            }
          } catch (error) {
            console.error('Error in last_sign_in_at update:', error)
          }
        } else {
          setUserEmail(null)
          setIsAdmin(false)
        }
      }
    )

    // Cleanup subscription
    return () => subscription.unsubscribe()
  }, [])

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  // Check if current page should show special layout (documentation pages)
  const isDocumentationPage = pathname.startsWith('/core-services') ||
    pathname.startsWith('/add-on-services') ||
    pathname.startsWith('/product-knowledge') ||
    pathname.startsWith('/guides') ||
    pathname.startsWith('/core-processes') ||
    pathname.startsWith('/tools') ||
    pathname.startsWith('/sheets-and-docs')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed TopBar */}
      <TopBar onSidebarToggle={handleSidebarToggle} />

      {/* Content with top padding for fixed header */}
      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:shrink-0 md:fixed md:left-0 md:top-16 md:h-[calc(100vh-64px)] md:border-r md:border-gray-200 dark:md:border-gray-700 md:bg-white dark:md:bg-gray-800">
          <div className="h-full overflow-x-hidden overflow-y-auto custom-scrollbar">
            <Sidebar isAdmin={isAdmin} />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 top-16 md:hidden"
            onClick={handleSidebarClose}
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <div
              className="relative flex flex-col w-64 h-full overflow-y-auto bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onClose={handleSidebarClose} isAdmin={isAdmin} />
            </div>
          </div>
        )}

        {/* Main Content Container */}
        <div className="flex flex-1 overflow-x-hidden md:ml-64">
          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden">
            <div className={isDocumentationPage ? "max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:px-8" : "max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:px-8"}>
              {/* Mobile Table of Contents */}
              {isDocumentationPage && (
                <div className="mb-6 xl:hidden">
                  <TableOfContents mobile={true} />
                </div>
              )}
              {children}
            </div>
          </main>

          {/* Right Sidebar for documentation (future feature) */}
          {isDocumentationPage && (
            <aside className="hidden xl:block w-72 shrink-0 sticky top-20 self-start max-h-[calc(100vh-80px)]">
              <div className="pr-8">
                <TableOfContents />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
