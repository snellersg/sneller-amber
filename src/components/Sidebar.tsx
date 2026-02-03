'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Table, 
  Phone, 
  FileText,
  Settings,
  ExternalLink,
  X,
  Shield,
  Plus,
  FlaskConical,
  ListTodo,
  Wrench,
  Waypoints,
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
      { label: 'Sheets & Docs', icon: Table, path: '/sheets-and-docs' },
      { label: 'Process Guides', icon: ListTodo, path: '/guides' }
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
      {
        label: 'Customer Call Log',
        icon: Phone,
        external: true,
        href: 'https://docs.google.com/a/snellerslandscaping.com/forms/d/e/1FAIpQLSeXUYSgm1wqnY2nrTV2jmprBaikGoVcsOskGfEyrIQGiQk02w/viewform'
      },
      {
        label: 'Equipment Form',
        icon: FileText,
        external: true,
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSe-LCaB9ZgoQjoYbJ0Hhd2yfAqTJOdWW9sKsdfIxXRJ1fdV5Q/viewform'
      }
    ]
  },
  {
    title: 'Information',
    items: [
      { label: 'Core Processes', icon: Settings, path: '/core-processes' },
      { label: 'Core Services', icon: Shield, path: '/core-services' },
      { label: 'Add-On Services', icon: Plus, path: '/add-on-services' },
      { label: 'Product Info', icon: FlaskConical, path: '/product-knowledge' }
    ]
  }
]

export default function Sidebar({ onClose, isAdmin = false }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile close button */}
      {onClose && (
        <div className="flex justify-end p-4 md:hidden">
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
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
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Admin Panel
            </h3>
            
            <ul className="space-y-1">
              <li>
                <Link
                  href="/admin"
                  className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive('/admin')
                      ? 'bg-muted text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={onClose}
                >
                  <ShieldCheck className={`h-5 w-5 ${
                    isActive('/admin') ? 'text-foreground' : 'text-muted-foreground'
                  }`} />
                  <span>Admin Panel</span>
                </Link>
              </li>
            </ul>
          </div>
        )}

        {sidebarSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            
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
                        className="flex items-center space-x-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-md group"
                        onClick={onClose}
                      >
                        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                        <span className="flex-1 whitespace-nowrap">{item.label}</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    </li>
                  )
                }

                // Internal links
                if (item.path) {
                  const isItemActive = isActive(item.path)
                  
                  // Regular clickable items
                  return (
                    <li key={item.label} className="relative">
                      <Link
                        href={item.path!}
                        className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                          isItemActive
                            ? 'bg-muted text-foreground font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        onClick={onClose}
                      >
                        <Icon className={`h-5 w-5 ${
                          isItemActive ? 'text-foreground' : 'text-muted-foreground'
                        }`} />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </Link>
                    </li>
                  )
                }
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full bg-green-500"
            title="Connected - Native routing active"
          />
          <span className="text-xs text-muted-foreground">
            Connected
          </span>
        </div>
      </div>
    </div>
  )
}
