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
  const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50'
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
  <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
)

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
    {children}
  </p>
)

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.guides.map((guide) => (
                    <Card 
                      key={guide.slug} 
                      className="group hover:shadow-lg transition-all duration-200"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2 flex-1 min-w-0">
                            <CardTitle className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {guide.title}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Updated {guide.updated}
                              </span>
                            </div>
                          </div>
                          {guide.hasContent ? (
                            <Badge 
                              variant="outline" 
                              className="text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                            >
                              Available
                            </Badge>
                          ) : (
                            <Badge 
                              variant="outline" 
                              className="text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                            >
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <CardDescription className="leading-relaxed">
                          {guide.description}
                        </CardDescription>

                        {guide.hasContent ? (
                          <Button 
                            href={`/guides/${guide.slug}`}
                            className="w-full group/btn"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Guide
                            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        ) : (
                          <div className="bg-accent dark:bg-accent/20 border border-accent/30 dark:border-accent/30 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Construction className="h-5 w-5 mt-0.5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                  Under Development
                                </h4>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300 leading-relaxed">
                                  This guide is being created. Check back soon for detailed step-by-step instructions.
                                </p>
                              </div>
                            </div>
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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Need a New Guide?
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            If you need a process guide that doesn't exist yet, or have suggestions for improvements,
            please reach out to the team lead or submit a request through Asana.
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            All guides are regularly updated to reflect current best practices and system changes.
          </p>
        </div>
      </div>
    </Layout>
  )
}
