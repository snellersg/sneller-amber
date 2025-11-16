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
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error
        
        if (user) {
          setUser(user)
          // Check if user is admin from metadata (support both property names)
          const adminStatus = user.user_metadata?.isAdmin || user.user_metadata?.is_admin || false
          setIsAdmin(adminStatus)
        }
      } catch (error) {
        setUser(null)
        setIsAdmin(false)
      }
    }

    checkUser()
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
        <div className="hidden md:flex md:w-64 md:flex-col md:shrink-0 md:sticky md:top-16 md:h-[calc(100vh-64px)] md:border-r md:border-gray-200 dark:md:border-gray-700 md:bg-white dark:md:bg-gray-800">
          <div className="overflow-y-auto overflow-x-hidden h-full custom-scrollbar">
            <Sidebar isAdmin={isAdmin} />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-16 z-50 md:hidden"
            onClick={handleSidebarClose}
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <div
              className="relative flex w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onClose={handleSidebarClose} isAdmin={isAdmin} />
            </div>
          </div>
        )}

        {/* Main Content Container */}
        <div className="flex-1 flex">
          {/* Main Content */}
          <main className="flex-1">
            <div className={isDocumentationPage ? "max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:px-8" : "max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:px-8"}>
              {/* Mobile Table of Contents */}
              {isDocumentationPage && (
                <div className="xl:hidden mb-6">
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
