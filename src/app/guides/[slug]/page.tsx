'use client'

import { useState, useEffect, useRef } from 'react'
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
  const headingCounterRef = useRef<{[key: string]: number}>({})
  
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [guideExists, setGuideExists] = useState(false)

  // Reset heading counter when content changes
  useEffect(() => {
    headingCounterRef.current = {}
  }, [content])

  const generateUniqueId = (text: string) => {
    const baseId = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
    
    // Track how many times we've seen this base ID
    if (headingCounterRef.current[baseId] === undefined) {
      headingCounterRef.current[baseId] = 0
    } else {
      headingCounterRef.current[baseId]++
    }
    
    // Return unique ID with counter suffix if needed
    return headingCounterRef.current[baseId] === 0 
      ? baseId 
      : `${baseId}-${headingCounterRef.current[baseId]}`
  }

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
              'working-through-lm-renewals': 'Working Through LM Renewals',
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
      'working-through-lm-renewals': 'Working Through LM Renewals',
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
              <ArrowLeft className="w-4 h-4" />
              Back to Guides
            </button>
          </div>
          
          <div className="p-8 text-center bg-white border rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="w-8 h-8 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
            <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Loading Guide...</h1>
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
              <ArrowLeft className="w-4 h-4" />
              Back to Guides
            </button>
          </div>
          
          <div className="p-8 text-center bg-white border rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <h1 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">Error Loading Guide</h1>
            <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
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
              <ArrowLeft className="w-4 h-4" />
              Back to Guides
            </button>
          </div>
          
          <div className="p-8 text-center bg-white border rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Guide Not Found</h1>
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
            <ArrowLeft className="w-4 h-4" />
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
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : null}
              
              <div className="flex items-center p-1 bg-gray-100 rounded-lg dark:bg-gray-700">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`inline-flex items-center gap-2 px-2 py-1 text-xs rounded-md transition-colors ${
                    !isEditing 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Eye className="w-3 h-3" />
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
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <main>
          <div className="bg-white border rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
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
                Use <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Markdown formatting</a>. Preview your changes by switching to View mode.
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="p-6 prose prose-gray dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({children}) => {
                    const text = children?.toString() || ''
                    const id = generateUniqueId(text)
                    return <h1 id={id} className="pb-2 mb-6 text-3xl font-bold text-gray-900 border-b border-gray-200 dark:text-white dark:border-gray-700">{children}</h1>
                  },
                  h2: ({children}) => {
                    const text = children?.toString() || ''
                    const id = generateUniqueId(text)
                    return <h2 id={id} className="mt-8 mb-4 text-2xl font-semibold text-gray-900 dark:text-white">{children}</h2>
                  },
                  h3: ({children}) => {
                    const text = children?.toString() || ''
                    const id = generateUniqueId(text)
                    return <h3 id={id} className="mt-6 mb-3 text-xl font-semibold text-gray-900 dark:text-white">{children}</h3>
                  },
                  h4: ({children}) => {
                    const text = children?.toString() || ''
                    const id = generateUniqueId(text)
                    return <h4 id={id} className="mt-4 mb-2 text-lg font-semibold text-gray-900 dark:text-white">{children}</h4>
                  },
                  h5: ({children}) => {
                    const text = children?.toString() || ''
                    const id = generateUniqueId(text)
                    return <h5 id={id} className="mt-4 mb-2 text-base font-semibold text-gray-900 dark:text-white">{children}</h5>
                  },
                  h6: ({children}) => {
                    const text = children?.toString() || ''
                    const id = generateUniqueId(text)
                    return <h6 id={id} className="mt-4 mb-2 text-sm font-semibold text-gray-900 dark:text-white">{children}</h6>
                  },
                  p: ({children}) => <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>,
                  ul: ({children}) => <ul className="mb-4 space-y-1 text-gray-700 list-disc list-inside dark:text-gray-300">{children}</ul>,
                  ol: ({children}) => <ol className="mb-4 space-y-1 text-gray-700 list-decimal list-inside dark:text-gray-300">{children}</ol>,
                  li: ({children}) => <li className="ml-4">{children}</li>,
                  strong: ({children}) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
                  a: ({children, href}) => <a href={href} className="text-gray-700 dark:text-gray-300 underline hover:text-primary transition-colors" target={href?.startsWith('http') ? '_blank' : '_self'} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}>{children}</a>,
                  code: ({children}) => <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-primary">{children}</code>,
                  pre: ({children}) => <pre className="p-4 mb-4 overflow-x-auto font-mono text-sm text-primary bg-gray-100 rounded-lg dark:bg-gray-800">{children}</pre>,
                  blockquote: ({children}) => <blockquote className="py-2 pl-4 mb-4 text-gray-700 border-l-4 border-primary bg-gray-50 dark:bg-gray-800 dark:text-gray-300">{children}</blockquote>,
                  table: ({children}) => <div className="mb-4 overflow-x-auto"><table className="w-full border border-collapse border-gray-300 dark:border-gray-600">{children}</table></div>,
                  th: ({children}) => <th className="px-4 py-2 font-semibold text-left text-gray-900 bg-gray-100 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">{children}</th>,
                  td: ({children}) => <td className="px-4 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 dark:text-gray-300">{children}</td>
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