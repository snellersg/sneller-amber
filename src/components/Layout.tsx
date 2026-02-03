'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import TableOfContents from './TableOfContents'

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
          // Check if user is admin from metadata (support both property names)
          const adminStatus = user.user_metadata?.isAdmin || user.user_metadata?.is_admin || false
          setIsAdmin(adminStatus)
          
          // Update last_sign_in_at for existing sessions
          try {
            console.log('Checking user record existence for:', user.id)
            const { data: existingUser, error: fetchError } = await supabase
              .from('users')
              .select('id')
              .eq('id', user.id)
              .single()

            if (fetchError && fetchError.code === 'PGRST116') {
              // User doesn't exist in users table, create them
              console.log('Creating user record in Layout for:', user.id, user.email)
              const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                  id: user.id,
                  email: user.email,
                  full_name: '',
                  created_at: new Date().toISOString(),
                  last_sign_in_at: new Date().toISOString(),
                  role: 'user'
                })
                .select()
                .single()

              if (insertError) {
                console.error('Error creating user record in Layout:', insertError)
                if (insertError.code === '42501') {
                  console.error('Permission denied - check RLS policies for users table')
                }
              } else {
                console.log('User record created successfully in Layout:', newUser)
              }
            } else if (!fetchError) {
              // User exists, update last sign-in
              console.log('Updating last sign-in for existing user:', user.id)
              const { error: updateError } = await supabase
                .from('users')
                .update({ last_sign_in_at: new Date().toISOString() })
                .eq('id', user.id)
              
              if (updateError) {
                console.error('Error updating last_sign_in_at:', updateError)
              } else {
                console.log('Last sign-in updated successfully')
              }
            } else {
              console.error('Error checking user existence:', fetchError)
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
          const adminStatus = session.user.user_metadata?.isAdmin || session.user.user_metadata?.is_admin || false
          setIsAdmin(adminStatus)
          
          // Update last_sign_in_at when user session is detected
          try {
            const { data: existingUser, error: fetchError } = await supabase
              .from('users')
              .select('id')
              .eq('id', session.user.id)
              .single()

            if (fetchError && fetchError.code === 'PGRST116') {
              // User doesn't exist in users table, create them
              console.log('Creating user record in auth handler for:', session.user.id)
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  full_name: '',
                  created_at: new Date().toISOString(),
                  last_sign_in_at: new Date().toISOString(),
                  role: 'user'
                })

              if (insertError) {
                console.error('Error creating user record:', insertError)
              }
            } else if (!fetchError) {
              // User exists, update last sign-in
              const { error } = await supabase
                .from('users')
                .update({ last_sign_in_at: new Date().toISOString() })
                .eq('id', session.user.id)
              
              if (error) {
                console.error('Error updating last_sign_in_at:', error)
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
