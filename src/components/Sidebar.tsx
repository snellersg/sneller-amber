'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Building2, 
  Table, 
  Phone, 
  AlertTriangle,
  Calculator,
  FileText,
  Settings,
  Users,
  ExternalLink,
  X,
  ChevronRight,
  ChevronDown,
  Shield,
  Plus,
  FlaskConical,
  ListTodo,
  Target,
  User,
  Wrench,
  Waypoints,
  File,
  ShieldCheck
} from 'lucide-react'

interface SidebarProps {
  onClose?: () => void
  isAdmin?: boolean
}

const sidebarSections = [
  {
    title: 'Quick Access',
    items: [
      { label: 'Active Accounts', icon: Building2, path: '/active-accounts' },
      { label: 'Sheets & Docs', icon: Table, path: '/sheets-and-docs' },
      {
        label: 'Customer Call Log',
        icon: Phone,
        external: true,
        href: 'https://docs.google.com/a/snellerslandscaping.com/forms/d/e/1FAIpQLSeXUYSgm1wqnY2nrTV2jmprBaikGoVcsOskGfEyrIQGiQk02w/viewform'
      },
      {
        label: 'Damage Report',
        icon: AlertTriangle,
        external: true,
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSeu_A3tDfCg9wiLiFVbm09DygZ3IjQJY3Bus3ZDnCt9GqzV3A/viewform'
      }
    ]
  },
  {
    title: 'Resources',
    items: [
      { label: 'Platforms', icon: Wrench, path: '/tools-platforms' },
      {
        label: 'Ops Hub',
        icon: Waypoints,
        external: true,
        href: 'https://sites.google.com/snellerslandscaping.com/opshub/home'
      },
      { label: 'Cheatsheets & PDFs', icon: File, path: '/pdf-templates', comingSoon: true }
    ]
  },
  {
    title: 'Knowledge',
    items: [
      { label: 'Core Processes', icon: Settings, path: '/core-processes' },
      { label: 'Core Services', icon: Shield, path: '/core-services' },
      { label: 'Add-On Services', icon: Plus, path: '/add-on-services' },
      { label: 'Product Info', icon: FlaskConical, path: '/product-knowledge' }
    ]
  },
  {
    title: 'Training',
    items: [
      { label: 'Process Guides', icon: ListTodo, path: '/guides' },
      { label: 'Practice Workflows', icon: Target, path: '/practice-workflows', comingSoon: true },
      { label: 'Armstrong Coaching', icon: User, path: '/kirk-armstrong', comingSoon: true }
    ]
  }
]

export default function Sidebar({ onClose, isAdmin = false }: SidebarProps) {
  const pathname = usePathname()

  // Initialize collapsed state - only Quick Access is open by default
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sidebar-collapsed-sections');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        // Failed to load sidebar state, use defaults
      }
    }

    const initial: Record<string, boolean> = {};
    sidebarSections.forEach(section => {
      initial[section.title] = section.title !== 'Quick Access';
    });
    return initial;
  });

  // Persist collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sidebar-collapsed-sections', JSON.stringify(collapsedSections));
      } catch (error) {
        console.error('Failed to save sidebar state:', error);
      }
    }
  }, [collapsedSections]);

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile close button */}
      {onClose && (
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        {/* Admin Panel Section for Admin Users - Show at top */}
        {isAdmin && (
          <div>
            <button
              onClick={() => toggleSection('Admin Panel')}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            >
              Admin Panel
              {collapsedSections['Admin Panel'] ? 
                <ChevronRight className="h-3 w-3" /> : 
                <ChevronDown className="h-3 w-3" />
              }
            </button>
            
            {!collapsedSections['Admin Panel'] && (
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/admin"
                    className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive('/admin')
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={onClose}
                  >
                    <ShieldCheck className={`h-5 w-5 ${
                      isActive('/admin') ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span>Admin Panel</span>
                  </Link>
                </li>
              </ul>
            )}
          </div>
        )}

        {sidebarSections.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            >
              {section.title}
              {collapsedSections[section.title] ? 
                <ChevronRight className="h-3 w-3" /> : 
                <ChevronDown className="h-3 w-3" />
              }
            </button>
            
            {!collapsedSections[section.title] && (
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isItemActive = item.path && isActive(item.path)

                  if (item.external) {
                    return (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 rounded-md group"
                          onClick={onClose}
                        >
                          <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                          <span className="flex-1">{item.label}</span>
                          <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </a>
                      </li>
                    )
                  }

                  // Internal links
                  if (item.path) {
                    const isItemActive = isActive(item.path)
                    
                    // Coming Soon items - non-clickable and grayed out
                    if (item.comingSoon) {
                      return (
                        <li key={item.label} className="relative">
                          <div className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md cursor-not-allowed opacity-60">
                            <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              Soon
                            </span>
                          </div>
                        </li>
                      )
                    }
                    
                    // Regular clickable items
                    return (
                      <li key={item.label} className="relative">
                        <Link
                          href={item.path!}
                          className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                            isItemActive
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                          }`}
                          onClick={onClose}
                        >
                          <Icon className={`h-5 w-5 ${
                            isItemActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                          }`} />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    )
                  }
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full bg-green-500"
            title="Connected - Native routing active"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Connected
          </span>
        </div>
      </div>
    </div>
  )
}
