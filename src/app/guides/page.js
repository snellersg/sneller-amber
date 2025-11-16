'use client'

import React from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { Construction, Calendar, ArrowRight, FileText, Users, Calculator, Briefcase, DollarSign } from 'lucide-react'

// Simple Badge component
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    outline: 'border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Simple Button component
const Button = ({ children, className = '', onClick, href, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg text-sm font-medium px-3 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50'
  const buttonClasses = `${baseClasses} bg-primary hover:bg-primary/90 text-white ${className}`
  
  if (href) {
    return (
      <Link href={href} className={buttonClasses} {...props}>
        {children}
      </Link>
    )
  }
  
  return (
    <button className={buttonClasses} onClick={onClick} {...props}>
      {children}
    </button>
  )
}

// Simple Card components
const Card = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold leading-snug text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
)

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${className}`}>
    {children}
  </p>
)

const CardContent = ({ children, className = '' }) => (
  <div className={`px-4 pb-4 ${className}`}>
    {children}
  </div>
)

// Guides data
const guideCategories = [
  {
    title: 'Meetings',
    description: 'Meeting templates, agendas, and best practices',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    iconColor: 'text-blue-600 dark:text-blue-400',
    guides: [
      {
        slug: 'acm-sales-client-handoff-meeting',
        title: 'ACM/Sales - Client Handoff Meeting',
        description: 'Complete workflow for transitioning new clients from sales to account management',
        updated: 'June 2025',
        hasContent: true
      },
      {
        slug: 'use-the-l10-document',
        title: 'How to use the L10 Document',
        description: 'L10 meeting structure integrated with Asana task management system',
        updated: 'June 2025',
        hasContent: true
      }
    ]
  },
  {
    title: 'Bidding',
    description: 'Estimating, work orders, and contract creation',
    icon: Calculator,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    iconColor: 'text-gray-600 dark:text-gray-400',
    guides: [
      {
        slug: 'identifying-pe-opportunities',
        title: 'Identifying PE Opportunities',
        description: 'Proactive identification and tracking of property enhancement opportunities',
        updated: 'June 2025',
        hasContent: true
      },
      {
        slug: 'create-a-construction-work-order',
        title: 'Create a Construction Work Order (CWO)',
        description: 'Process for creating construction work orders in BossLM',
        updated: 'June 2025',
        hasContent: false
      },
      {
        slug: 'create-a-work-order',
        title: 'Create a Work Order (WO)',
        description: 'Standard work order creation and management procedures',
        updated: 'June 2025',
        hasContent: false
      },
      {
        slug: 'create-a-lawn-contract',
        title: 'Create a Lawn Contract',
        description: 'Complete process for lawn service contract creation and setup',
        updated: 'June 2025',
        hasContent: false
      },
      {
        slug: 'create-a-winter-contract',
        title: 'Create a Winter Contract',
        description: 'Winter service contract creation with service level specifications',
        updated: 'June 2025',
        hasContent: false
      }
    ]
  },
  {
    title: 'Workflows',
    description: 'Daily operations, customer communication, and process management',
    icon: Briefcase,
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    iconColor: 'text-blue-600 dark:text-blue-400',
    guides: [
      {
        slug: 'working-a-snow-event',
        title: 'Working a Snow Event',
        description: 'Complete workflow for managing snow event operations from morning to evening',
        updated: 'June 2025',
        hasContent: true
      },
      {
        slug: 'cascading-customer-communication-to-ops',
        title: 'Cascading Customer Communication to Ops',
        description: 'Process for routing customer requests through Helpdesk to operations via Asana',
        updated: 'June 2025',
        hasContent: true
      },
      {
        slug: 'measure-maps-in-sitefotos',
        title: 'Creating/Editing LM & SP Maps',
        description: 'Map creation and editing procedures using SiteFotos platform',
        updated: 'June 2025',
        hasContent: false
      },
      {
        slug: 'create-tickets-for-ops',
        title: 'Create Tickets for Ops',
        description: 'Ticket creation workflow for operational requests and issues',
        updated: 'June 2025',
        hasContent: false
      }
    ]
  },
  {
    title: 'Financial',
    description: 'Invoicing, purchase orders, and financial processes',
    icon: DollarSign,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    iconColor: 'text-gray-600 dark:text-gray-400',
    guides: [
      {
        slug: 'submitting-pos',
        title: 'Submitting PO\'s',
        description: 'Purchase order submission process and approval workflows',
        updated: 'June 2025',
        hasContent: false
      }
    ]
  }
]

export default function GuidesPage() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Process Guides
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive guides for daily operations, best practices, and step-by-step workflows. 
            Find everything you need to execute processes efficiently and consistently.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {guideCategories.map((category) => {
            const IconComponent = category.icon
            return (
              <div key={category.title} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <IconComponent className={`h-6 w-6 ${category.iconColor}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Guides Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {category.guides.map((guide) => (
                    <Card key={guide.slug} className="h-full flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <div className="space-y-3">
                          <CardTitle className="leading-snug">
                            {guide.title}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Updated {guide.updated}
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col justify-between space-y-3">
                        <CardDescription className="flex-1">
                          {guide.description}
                        </CardDescription>

                        {guide.hasContent ? (
                          <Button 
                            href={`/guides/${guide.slug}`}
                            className="w-full mt-auto"
                          >
                            <FileText className="h-3 w-3" />
                            View Guide
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg text-sm font-medium px-3 py-1.5 w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
                            <Construction className="h-3 w-3" />
                            Under Development
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Need a New Guide?
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you need a process guide that doesn't exist yet, or have suggestions for improvements,
            please reach out to brendon.dalaba@snellersg.com or submit a request through Asana.
          </p>
        </div>
      </div>
    </Layout>
  )
}
