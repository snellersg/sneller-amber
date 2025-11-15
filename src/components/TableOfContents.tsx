'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  mobile?: boolean
}

export default function TableOfContents({ mobile = false }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Small delay to ensure the page content has rendered
    const updateHeadings = () => {
      // Only get headings from the main content area (exclude sidebar, topbar, etc.)
      const mainContent = document.querySelector('main')
      if (!mainContent) return

      const headingElements = mainContent.querySelectorAll('h2, h3')
      const headingArray = Array.from(headingElements)
        .filter((heading) => {
          const text = heading.textContent || ''
          return (
            text !== 'Sneller Contract Service Description' &&
            text !== 'Sneller Contract Description' &&
            text !== 'Opportunity Indicators' &&
            !text.startsWith('Round 1') &&
            !text.startsWith('Round 2') &&
            !text.startsWith('Round 3') &&
            !text.startsWith('Rounds 2') &&
            text !== 'Failed to load accounts' &&
            text !== 'No accounts found'
          )
        })
        .map((heading, index) => {
          const id = heading.id || `heading-${index}`
          if (!heading.id) {
            heading.id = id
          }
          // Remove badge text (Snow, Lawn) from heading text
          let text = heading.textContent || ''
          text = text.replace(/\s*(Snow|Lawn)\s*$/, '').trim()

          return {
            id,
            text,
            level: parseInt(heading.tagName[1])
          }
        })

      setHeadings(headingArray)
    }

    // Update headings when pathname changes
    const timeoutId = setTimeout(updateHeadings, 100)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      if (headings.length === 0) return

      const scrollPosition = window.scrollY + 80 // Match the scroll offset
      let foundActiveId = ''

      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id)
        if (element && element.offsetTop <= scrollPosition) {
          foundActiveId = headings[i].id
          break
        }
      }

      if (foundActiveId !== activeId) {
        setActiveId(foundActiveId)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Set initial active heading

    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings, activeId])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const topOffset = 80 // Account for fixed top bar (64px) plus some padding
      const elementPosition = element.offsetTop - topOffset

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })

      // Close mobile dropdown after navigation
      if (mobile) {
        setIsOpen(false)
      }
    }
  }

  if (headings.length === 0) return null

  // Mobile version - collapsible dropdown
  if (mobile) {
    return (
      <div className="w-full mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600 rounded-lg"
        >
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase">On This Page</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isOpen && (
          <nav className="border-x border-b border-gray-200 dark:border-gray-600 rounded-b-lg p-3 bg-white dark:bg-gray-800 max-h-[60vh] overflow-y-auto">
            <ul className="space-y-1">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={`text-left w-full px-2 py-1 rounded transition-colors cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      heading.level === 2 ? 'text-xs font-medium' : 'text-xs pl-4 font-normal'
                    } ${
                      activeId === heading.id
                        ? 'font-medium text-white bg-blue-600'
                        : heading.level === 2
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className={heading.text === 'Ice Melt Products' || heading.text === 'Lawn Care Products' ? 'uppercase' : ''}>
                      {heading.text}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    )
  }

  // Desktop version - sidebar
  return (
    <div className="w-full border-l border-gray-200 dark:border-gray-700 pl-4">
      <div className="pb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 uppercase pt-8">On This Page</h4>
        <nav style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }} className="pr-2">
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li key={heading.id}>
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={`text-left w-full px-2 py-1 rounded transition-colors cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    heading.level === 2 ? 'text-xs font-medium' : 'text-xs pl-4 font-normal'
                  } ${
                    activeId === heading.id
                      ? 'font-medium text-white bg-blue-600'
                      : heading.level === 2
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span className={heading.text === 'Ice Melt Products' || heading.text === 'Lawn Care Products' ? 'uppercase' : ''}>
                    {heading.text}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}