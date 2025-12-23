'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import TableOfContents from '@/components/TableOfContents'
import { ArrowLeft, Eye, Edit3, Save, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { supabase } from '@/lib/supabase'

interface GuideData {
  id?: number
  slug: string
  title: string
  content: string
  updated_at?: string
  updated_by?: string
}

export default function GuidePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [guideExists, setGuideExists] = useState(false)

  useEffect(() => {
    // Check user admin status
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error
        
        if (user) {
          setUser(user)
          // Check if user is admin from metadata
          const adminStatus = user.user_metadata?.isAdmin || user.user_metadata?.is_admin || false
          setIsAdmin(adminStatus)
        }
      } catch (error) {
        console.error('Error checking user status:', error)
        setUser(null)
        setIsAdmin(false)
      }
    }

    checkUser()
  }, [])

  useEffect(() => {
    // Load guide content from database
    const loadGuide = async () => {
      if (!slug) return
      
      setLoading(true)
      setError(null)
      
      try {
        // First try to load from database
        const { data: guide, error } = await supabase
          .from('guides')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (guide) {
          // Guide exists in database
          setTitle(guide.title)
          setContent(guide.content)
          setGuideExists(true)
        } else {
          // Guide doesn't exist - wait for user to be loaded before creating
          if (user) {
            await createDefaultGuide(slug)
          } else {
            // User not loaded yet, show default content without creating in DB
            console.log('User not loaded yet, showing default content for:', slug)
            const defaultTitles: Record<string, string> = {
              'acm-sales-client-handoff-meeting': 'ACM/Sales - Client Handoff Meeting',
              'use-the-l10-document': 'How to use the L10 Document',
              'identifying-pe-opportunities': 'Identifying PE Opportunities',
              'working-a-snow-event': 'Working a Snow Event',
              'cascading-customer-communication-to-ops': 'Cascading Customer Communication to Ops',
              'create-a-construction-work-order': 'Create a Construction Work Order (CWO)',
              'create-a-work-order': 'Create a Work Order (WO)',
              'create-a-lawn-contract': 'Create a Lawn Contract',
              'create-a-winter-contract': 'Create a Winter Contract',
              'measure-maps-in-sitefotos': 'Creating/Editing LM & SP Maps',
              'create-tickets-for-ops': 'Create Tickets for Ops',
              'submitting-pos': 'Submitting PO\'s'
            }

            const defaultTitle = defaultTitles[slug] || slug.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')

            const defaultContent = `# ${defaultTitle}

## Overview
This guide is currently being developed. Please check back later for complete content.

## Getting Started
Add your process steps and guidelines here.

## Best Practices
- Document step-by-step procedures
- Include examples and screenshots where helpful
- Add checklists for complex processes
- Reference related tools and resources

## Resources
- Link to related guides
- Reference external tools
- Contact information for questions

---
*This guide was auto-generated. Please edit to add your specific process information.*`

            setTitle(defaultTitle)
            setContent(defaultContent)
            setGuideExists(false) // Mark as not yet created in DB
          }
        }
      } catch (error) {
        console.error('Error loading guide:', error)
        setError('Failed to load guide content')
        setTitle('Error Loading Guide')
        setContent('# Error\n\nFailed to load guide content. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadGuide()
  }, [slug, user]) // Add user as dependency

  const createDefaultGuide = async (slug: string) => {
    // Default guide titles based on slug
    const defaultTitles: Record<string, string> = {
      'acm-sales-client-handoff-meeting': 'ACM/Sales - Client Handoff Meeting',
      'use-the-l10-document': 'How to use the L10 Document',
      'identifying-pe-opportunities': 'Identifying PE Opportunities',
      'working-a-snow-event': 'Working a Snow Event',
      'cascading-customer-communication-to-ops': 'Cascading Customer Communication to Ops',
      'create-a-construction-work-order': 'Create a Construction Work Order (CWO)',
      'create-a-work-order': 'Create a Work Order (WO)',
      'create-a-lawn-contract': 'Create a Lawn Contract',
      'create-a-winter-contract': 'Create a Winter Contract',
      'measure-maps-in-sitefotos': 'Creating/Editing LM & SP Maps',
      'create-tickets-for-ops': 'Create Tickets for Ops',
      'submitting-pos': 'Submitting PO\'s'
    }

    const defaultTitle = defaultTitles[slug] || slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')

    const defaultContent = `# ${defaultTitle}

## Overview
This guide is currently being developed. Please check back later for complete content.

## Getting Started
Add your process steps and guidelines here.

## Best Practices
- Document step-by-step procedures
- Include examples and screenshots where helpful
- Add checklists for complex processes
- Reference related tools and resources

## Resources
- Link to related guides
- Reference external tools
- Contact information for questions

---
*This guide was auto-generated. Please edit to add your specific process information.*`

    try {
      // Check if user is authenticated
      if (!user?.id) {
        console.log('User not authenticated, cannot create guide')
        throw new Error('User not authenticated')
      }

      console.log('Creating default guide for slug:', slug, 'by user:', user.id)

      const { data: newGuide, error } = await supabase
        .from('guides')
        .insert({
          slug,
          title: defaultTitle,
          content: defaultContent,
          updated_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          error: error
        })
        throw error
      }

      console.log('Successfully created guide:', newGuide)
      setTitle(newGuide.title)
      setContent(newGuide.content)
      setGuideExists(true)
    } catch (error) {
      console.error('Error creating default guide:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      // Fall back to showing error message
      setTitle('Guide Not Found')
      setContent(`# Guide Not Found\n\nThe guide "${slug}" could not be found or created.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleSave = async () => {
    if (!isAdmin || !user) return
    
    setSaving(true)
    setError(null)
    
    try {
      if (!guideExists) {
        // Guide doesn't exist in database yet, create it first
        console.log('Creating guide in database for first save:', slug)
        const { error: insertError } = await supabase
          .from('guides')
          .insert({
            slug,
            title,
            content,
            updated_by: user.id
          })
        
        if (insertError) throw insertError
        setGuideExists(true)
      } else {
        // Guide exists, update it
        const { error } = await supabase
          .from('guides')
          .update({
            content,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('slug', slug)
        
        if (error) throw error
      }
      
      setIsEditing(false)
      
      // Show success message (you could replace this with a toast notification)
      alert('Guide saved successfully!')
    } catch (error) {
      console.error('Error saving guide:', error)
      setError('Failed to save guide. Please try again.')
      alert('Error saving guide. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    // Reset content to database version
    setLoading(true)
    try {
      const { data: guide, error } = await supabase
        .from('guides')
        .select('content')
        .eq('slug', slug)
        .single()

      if (error) throw error
      
      setContent(guide.content)
    } catch (error) {
      console.error('Error reloading guide content:', error)
    } finally {
      setLoading(false)
    }
    
    setIsEditing(false)
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Guides
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Guide...</h1>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we load the guide content.</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Guides
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Guide</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  if (!slug) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Guides
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Guide Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400">The requested guide could not be found.</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Guides
          </button>

          {/* View/Edit Toggle - Admin Only */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : null}
              
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`inline-flex items-center gap-2 px-2 py-1 text-xs rounded-md transition-colors ${
                    !isEditing 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  View
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`inline-flex items-center gap-2 px-2 py-1 text-xs rounded-md transition-colors ${
                    isEditing 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <main>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
          {isEditing && isAdmin ? (
            /* Edit Mode */
            <div className="p-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[600px] p-4 text-sm font-mono border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                placeholder="Enter markdown content..."
              />
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Use Markdown formatting. Preview your changes by switching to View mode.
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="prose prose-gray dark:prose-invert max-w-none p-6">
              <ReactMarkdown
                components={{
                  h1: ({children}) => {
                    const text = children?.toString() || ''
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
                    return <h1 id={id} className="text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">{children}</h1>
                  },
                  h2: ({children}) => {
                    const text = children?.toString() || ''
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
                    return <h2 id={id} className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">{children}</h2>
                  },
                  h3: ({children}) => {
                    const text = children?.toString() || ''
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
                    return <h3 id={id} className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">{children}</h3>
                  },
                  h4: ({children}) => {
                    const text = children?.toString() || ''
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
                    return <h4 id={id} className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">{children}</h4>
                  },
                  h5: ({children}) => {
                    const text = children?.toString() || ''
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
                    return <h5 id={id} className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-4">{children}</h5>
                  },
                  h6: ({children}) => {
                    const text = children?.toString() || ''
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
                    return <h6 id={id} className="text-sm font-semibold text-gray-900 dark:text-white mb-2 mt-4">{children}</h6>
                  },
                  p: ({children}) => <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{children}</p>,
                  ul: ({children}) => <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">{children}</ol>,
                  li: ({children}) => <li className="ml-4">{children}</li>,
                  strong: ({children}) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
                  code: ({children}) => <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100">{children}</code>,
                  pre: ({children}) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-900 dark:text-gray-100 mb-4">{children}</pre>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 mb-4">{children}</blockquote>,
                  table: ({children}) => <div className="overflow-x-auto mb-4"><table className="w-full border-collapse border border-gray-300 dark:border-gray-600">{children}</table></div>,
                  th: ({children}) => <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">{children}</th>,
                  td: ({children}) => <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">{children}</td>
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        </main>
        
        {/* Standard TOC Component */}
        <TableOfContents />
      </div>
    </Layout>
  )
}