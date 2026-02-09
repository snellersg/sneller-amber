'use client'

import Link from 'next/link'
import Layout from '@/components/Layout'
import { Users, Briefcase, DollarSign, Calendar, FileText, ArrowRight, Construction } from 'lucide-react'

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
        title: 'ACM/Sales - Client Handoff Meeting Prep',
        description: 'Complete workflow for transitioning new clients from sales to account management',
        updated: 'January 2026',
        hasContent: true,
        live: true,
        category: 'Meetings',
        season: 'GENERAL'
      },
      {
        slug: 'use-the-l10-document',
        title: 'How to use the L10 Document',
        description: 'Complete guide for utilizing L10 documentation in operations',
        updated: 'February 2026',
        hasContent: true,
        live: true,
        category: 'Meetings',
        season: 'GENERAL'
      }
    ]
  },
  {
    title: 'Operational',
    description: 'Daily operations, estimating, work orders, contracts, and process management',
    icon: Briefcase,
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    iconColor: 'text-blue-600 dark:text-blue-400',
    guides: [
      {
        slug: 'create-a-construction-work-order',
        title: 'Create a Construction Work Order (CWO)',
        description: 'Process for creating construction work orders in BossLM',
        updated: 'January 2026',
        hasContent: true,
        live: false,
        category: 'Operational',
        season: 'GENERAL'
      },
      {
        slug: 'create-a-work-order',
        title: 'Create a Work Order (WO)',
        description: 'Standard work order creation and management procedures',
        updated: 'January 2026',
        hasContent: true,
        live: false,
        category: 'Operational',
        season: 'GENERAL'
      },
      {
        slug: 'create-a-lawn-contract',
        title: 'Create a Lawn Contract',
        description: 'Complete process for lawn service contract creation and setup',
        updated: 'January 2026',
        hasContent: true,
        live: false,
        category: 'Operational',
        season: 'LM'
      },
      {
        slug: 'create-a-winter-contract',
        title: 'Create a Winter Contract',
        description: 'Winter service contract creation with service level specifications',
        updated: 'January 2026',
        hasContent: true,
        live: false,
        category: 'Operational',
        season: 'WR'
      },
      {
        slug: 'work-a-snow-event',
        title: 'Work a Snow Event',
        description: 'Complete workflow for managing snow event operations from morning to evening',
        updated: 'January 2026',
        hasContent: true,
        live: false,
        category: 'Operational',
        season: 'WR'
      },
      {
        slug: 'measure-maps-in-sitefotos',
        title: 'Create/Edit LM & SP Maps',
        description: 'Map creation and editing procedures using SiteFotos platform',
        updated: 'January 2026',
        hasContent: true,
        live: false,
        category: 'Operational',
        season: 'LM'
      },
      {
        slug: 'create-tickets-for-ops',
        title: 'Create Tickets for Ops',
        description: 'Ticket creation workflow for operational requests and issues',
        updated: 'January 2026',
        hasContent: true,
        live: false,
        category: 'Operational',
        season: 'GENERAL'
      },
      {
        slug: 'work-through-lm-renewals',
        title: 'LM Renewal Walkthrough',
        description: 'Complete process for managing landscape maintenance contract renewals',
        updated: 'February 2026',
        hasContent: true,
        live: true,
        category: 'Operational',
        season: 'LM'
      },
      {
        slug: 'wr-renewal-walkthrough',
        title: 'WR Renewal Walkthrough',
        description: 'Coming soon: workflow for managing WR renewal processes',
        updated: 'February 2026',
        hasContent: false,
        live: false,
        category: 'Operational',
        season: 'WR'
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
        updated: 'January 2026',
        hasContent: true,
        live: false,
        category: 'Financial',
        season: 'GENERAL'
      }
    ]
  }
]

export default function GuidesPage() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 uppercase dark:text-white">
            Process Guides
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Comprehensive guides for daily operations, best practices, and step-by-step workflows. 
            These guides provide detailed procedures to execute processes efficiently and consistently.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-12">
          {guideCategories.map((category) => {
            // Group guides by season
            const guidesByseason = category.guides.reduce((acc, guide) => {
              if (!acc[guide.season]) {
                acc[guide.season] = [];
              }
              acc[guide.season].push(guide);
              return acc;
            }, {});

            // Define season order
            const seasonOrder = ['GENERAL', 'WR', 'LM'];
            const orderedSeasons = seasonOrder.filter(season => guidesByseason[season]?.length > 0);

            return (
              <div key={category.title} className="space-y-4">
                {/* Category Header */}
                <div className="pb-3">
                  <h2 className="mb-2 text-2xl font-bold text-gray-900 uppercase dark:text-white">
                    {category.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {category.description}
                  </p>
                </div>

                {/* Season Subsections */}
                <div className="space-y-4">
                  {orderedSeasons.map((season) => (
                    <div key={season} className="space-y-3">
                      {/* Season Header */}
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 uppercase">
                          {season}
                        </div>
                        <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                      </div>

                      {/* Season Guides Grid */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {guidesByseason[season].map((guide) => (
                          <Card 
                            key={guide.slug} 
                            className={`flex flex-col h-full ${!guide.live ? 'opacity-60' : ''}`}
                          >
                            <CardHeader className="flex-shrink-0">
                              <div className="space-y-3">
                                <CardTitle className="leading-snug">
                                  {guide.title}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <Calendar className="flex-shrink-0 w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Updated {guide.updated}
                                  </span>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="flex flex-col justify-between flex-1 space-y-3">
                              <CardDescription className="flex-1">
                                {guide.description}
                              </CardDescription>

                              {guide.live ? (
                                guide.hasContent ? (
                                  <Button 
                                    href={`/guides/${guide.slug}`}
                                    className="w-full mt-auto"
                                  >
                                    <FileText className="w-3 h-3" />
                                    View Guide
                                    <ArrowRight className="w-3 h-3" />
                                  </Button>
                                ) : (
                                  <div className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg text-sm font-medium px-3 py-1.5 w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
                                    <Construction className="w-3 h-3" />
                                    Under Development
                                  </div>
                                )
                              ) : (
                                <div className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg text-sm font-medium px-3 py-1.5 w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed">
                                  <Construction className="w-3 h-3" />
                                  Coming Soon
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-4 text-center border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Need a New Guide?
          </h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            If you need a process guide that doesn't exist yet, or have suggestions for improvements,
            please reach out to brendon.dalaba@snellersg.com or submit a request through Asana.
          </p>
        </div>
      </div>
    </Layout>
  )
}
