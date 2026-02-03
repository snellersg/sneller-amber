'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, FileText, Construction, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Copy button component for template text
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 ml-auto"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          Copy
        </>
      )}
    </Button>
  )
}

// Format text with basic markdown-like styling
const formatText = (text: string) => {
  // Handle code blocks
  if (text.includes('```')) {
    const parts = text.split('```')
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <div key={index} className="mt-4 mb-4">
            <Card className="bg-muted">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Template Text</span>
                  <CopyButton text={part.trim()} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {part.trim()}
                </pre>
              </CardContent>
            </Card>
          </div>
        )
      }
      return <span key={index}>{formatInlineText(part)}</span>
    })
  }
  return formatInlineText(text)
}

// Format inline text elements
const formatInlineText = (text: string) => {
  // Handle paragraph breaks (double newlines)
  if (text.includes('\n\n')) {
    const paragraphs = text.split('\n\n')
    return (
      <>
        {paragraphs.map((paragraph, index) => (
          <div key={index} className={index > 0 ? "mt-3" : ""}>
            {formatSingleParagraph(paragraph.trim())}
          </div>
        ))}
      </>
    )
  }
  
  return formatSingleParagraph(text)
}

// Format a single paragraph with inline elements
const formatSingleParagraph = (text: string) => {
  // Handle inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>')
  
  // Handle bold text
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
  
  // Handle arrows
  text = text.replace(/→/g, '<span class="text-primary">→</span>')
  
  return <span dangerouslySetInnerHTML={{ __html: text }} />
}

// Render numbered steps
const renderSteps = (steps: string[]) => {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const trimmedStep = step.trim()
        
        // Check if it's a numbered step
        const numberedMatch = trimmedStep.match(/^(\d+)\.\s*(.*)$/)
        if (numberedMatch) {
          const [, number, content] = numberedMatch
          
          // Check for sub-bullets, but ignore bullets inside code blocks
          const lines = content.split('\n')
          const mainContent = lines[0]
          
          // Only look for sub-bullets if we're not in a code block
          let subItems: string[] = []
          let contentToRender = content // Default to full content
          
          if (!content.includes('```')) {
            subItems = lines.slice(1).filter(part => part.trim().match(/^[\s]*[•\-\*]\s/))
            // If we have sub-bullets, only render the main content
            if (subItems.length > 0) {
              contentToRender = mainContent
            }
          }
          
          return (
            <li key={index} className="flex items-start gap-3">
              <span className="text-primary font-semibold flex-shrink-0 mt-0.5">
                {number}.
              </span>
              <div className="flex-1">
                <div className="text-gray-700 dark:text-gray-300 leading-6">{formatText(contentToRender)}</div>
                {subItems.length > 0 && (
                  <ul className="mt-2 ml-0 space-y-2">
                    {subItems.map((subItem, subIndex) => (
                      <li key={subIndex} className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2.5 mr-3 shrink-0"></div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatText(subItem.replace(/^\s*[•\-\*]\s*/, ''))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          )
        }
        
        // Handle bullet points
        if (trimmedStep.match(/^[•\-\*]\s/)) {
          const content = trimmedStep.replace(/^[•\-\*]\s*/, '')
          return (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
              <div className="text-gray-700 dark:text-gray-300">{formatText(content)}</div>
            </li>
          )
        }
        
        // Fallback
        return (
          <li key={index} className="flex items-start gap-3">
            <span className="text-primary font-semibold flex-shrink-0 mt-0.5">
              {index + 1}.
            </span>
            <div className="text-gray-700 dark:text-gray-300">{formatText(trimmedStep)}</div>
          </li>
        )
      })}
    </ol>
  )
}

// Type definitions
interface GuideImage {
  src: string;
  alt: string;
  caption: string;
}

interface GuideVideo {
  src: string;
  title: string;
  description: string;
}

interface GuideSection {
  title: string;
  content: string;
  steps: string[];
  images?: GuideImage[];
  videos?: GuideVideo[];
}

interface GuideResource {
  title: string;
  url: string;
  description: string;
}

interface GuideContact {
  role: string;
  name: string;
  email: string;
}

interface Guide {
  title: string;
  description: string;
  isComplete: boolean;
  lastUpdated: string;
  live: boolean;
  sections: GuideSection[];
  resources?: GuideResource[];
  contacts?: GuideContact[];
}

type GuidesData = Record<string, Guide>;

// All available guides with basic info
const guides: GuidesData = {
  'acm-sales-client-handoff-meeting': {
    title: 'ACM/Sales - Client Handoff Meeting Prep',
    description: 'Complete workflow for transitioning new clients from sales to account management',
    isComplete: true,
    lastUpdated: 'January 2026',
    live: true,
    sections: [
      {
        title: 'Pre-Meeting Preparation',
        content: 'Before the handoff meeting, gather all relevant client documentation and prepare transition materials.',
        steps: [
          '• Review signed contract and service specifications',
          '• Collect property maps, site photos, and special notes',
          '• Prepare client contact information and communication preferences',
          '• Note any special requests or concerns from the sales process'
        ]
      },
      {
        title: 'Meeting Agenda',
        content: 'The handoff meeting should cover these key areas to ensure smooth client transition.',
        steps: [
          '• Sales team provides comprehensive client overview',
          '• Review all contracted services and pricing',
          '• Discuss timeline for service implementation',
          '• Address any client concerns or special requirements',
          '• Establish ongoing communication protocols'
        ]
      },
      {
        title: 'Post-Meeting Actions',
        content: 'Complete these steps immediately after the handoff meeting.',
        steps: [
          '• Update client information in management system',
          '• Schedule initial site visit or service start date',
          '• Send welcome email to client with ACM contact details',
          '• Create any necessary work orders or service tickets'
        ]
      }
    ]
  },
  'use-the-l10-document': {
    title: 'How to use the L10 Document',
    description: 'Complete guide for utilizing L10 documentation in operations',
    isComplete: true,
    lastUpdated: 'January 2026',
    live: true,
    sections: [
      {
        title: 'Our L10 Document System',
        content: 'Our L10 document is the shared system we use to track, assign, and resolve issues across all L10 teams—so everyone can see what\'s being worked on, by whom, and what the current status is. When an issue is added, it stays connected to its related to-dos, ownership, and progress, which builds confidence that concerns will be addressed and that you\'ll receive an answer back (even if the outcome isn\'t exactly what you hoped for).\n\nThe document also makes it easy to share issues between different L10s without losing context. To keep issues clear and healthy for team morale, we prefer linking issues to an Asana task when context is needed—rather than relying on short, contextless "spreadsheet issues" that can be misread. L10 to-dos can sync with Asana so they live alongside our other work, helping us prioritize throughout the week (not just right before the meeting), increasing collaboration and visibility. L10 items are coded to match the L10 agenda so they\'re searchable later, and we keep a permanent record of past issues and solutions to understand what was solved, how, and by who.',
        steps: [
          '• All L10 teams use the shared document for transparency and accountability',
          '• Issues remain connected to their to-dos, ownership, and progress tracking',
          '• Link issues to Asana tasks for additional context when needed',
          '• L10 to-dos sync with Asana for better weekly prioritization',
          '• Items are coded to match L10 agenda for easy searching',
          '• Keep permanent record of past issues and solutions',
          '• Asana Note: Use Asana for one-off issues. Don\'t use it to manage systemic or recurring annual work—bring systemic issues to Gavin or Henry.'
        ],
        videos: [
          {
            src: 'https://drive.google.com/file/d/1EK-PrISaq6oOriyb9Z5v8kxwh7ns5M46/preview',
            title: 'L10 Document System Overview',
            description: 'Visual walkthrough of how our L10 document system works for tracking and resolving issues across all teams.'
          }
        ]
      },
      {
        title: 'Understanding the L10 Format',
        content: 'The Level 10 Meeting format is designed for efficient weekly leadership meetings.',
        steps: [
          '• Scorecard: Review key metrics and numbers for the week',
          '• Rock Review: Check progress on quarterly priorities',
          '• Customer/Employee Headlines: Share important updates',
          '• To-Do List: Review action items from previous meetings',
          '• IDS (Identify, Discuss, Solve): Address key issues'
        ]
      },
      {
        title: 'Meeting Preparation',
        content: 'Proper preparation ensures productive and efficient L10 meetings.',
        steps: [
          '• Review scorecard data before the meeting',
          '• Update rock progress percentages',
          '• Prepare customer and employee headlines',
          '• Complete to-do items from previous week',
          '• Identify issues that need team discussion'
        ]
      },
      {
        title: 'Leading the Meeting',
        content: 'Best practices for facilitating effective L10 meetings.',
        steps: [
          '• Start and end on time (90 minutes maximum)',
          '• Keep scorecard review to 5 minutes',
          '• Spend most time on IDS (Issue, Discussion, Solution)',
          '• Assign clear action items with owners and due dates',
          '• Document decisions and next steps'
        ]
      }
    ]
  },
  'identifying-pe-opportunities': {
    title: 'Identifying PE Opportunities',
    description: 'Proactive identification and tracking of property enhancement opportunities',
    isComplete: true,
    lastUpdated: 'January 2026',
    live: false,
    sections: [
      {
        title: 'During Regular Service Visits',
        content: 'Train crews to identify enhancement opportunities during routine maintenance.',
        steps: [
          '• Look for areas needing landscape improvements or repairs',
          '• Identify irrigation system issues or upgrade needs',
          '• Note hardscape repairs or installation opportunities',
          '• Document with photos using mobile device',
          '• Record location details and client contact information'
        ]
      },
      {
        title: 'Assessment and Documentation',
        content: 'Systematic approach to evaluating and documenting potential projects.',
        steps: [
          '• Measure areas requiring work for accurate estimates',
          '• Take before photos from multiple angles',
          '• Research material costs and availability',
          '• Assess timeline and crew requirements',
          '• Calculate preliminary cost estimates'
        ]
      },
      {
        title: 'Client Presentation',
        content: 'Professional approach to presenting enhancement opportunities to clients.',
        steps: [
          '• Prepare visual presentation with photos and diagrams',
          '• Present clear benefits and ROI to the client',
          '• Provide detailed written estimates with timelines',
          '• Offer multiple options (good/better/best approach)',
          '• Follow up within 48 hours for decision timeline'
        ]
      }
    ]
  },
  'create-a-construction-work-order': {
    title: 'Create a Construction Work Order (CWO)',
    description: 'Process for creating construction work orders in BossLM',
    isComplete: true,
    lastUpdated: 'January 2026',
    live: false,
    sections: [
      {
        title: 'Initial Setup in BossLM',
        content: 'Start the CWO creation process in the BossLM system.',
        steps: [
          '• Log into BossLM and navigate to Work Orders section',
          '• Select "Create New Construction Work Order"',
          '• Enter client information and property details',
          '• Assign unique CWO number following company format',
          '• Set priority level and estimated completion date'
        ]
      },
      {
        title: 'Project Details and Specifications',
        content: 'Document comprehensive project requirements and specifications.',
        steps: [
          '• Upload site plans, drawings, and reference photos',
          '• List all materials needed with quantities and specifications',
          '• Detail labor requirements and estimated hours',
          '• Include any special equipment or subcontractor needs',
          '• Add client-specific requirements or restrictions'
        ]
      },
      {
        title: 'Scheduling and Resource Allocation',
        content: 'Coordinate timing and assign appropriate resources to the project.',
        steps: [
          '• Check crew availability for proposed timeline',
          '• Reserve necessary equipment and tools',
          '• Coordinate material delivery dates',
          '• Schedule any required permits or inspections',
          '• Notify client of confirmed start and completion dates'
        ]
      }
    ]
  },
  'create-a-work-order': {
    title: 'Create a Work Order (WO)',
    description: 'Standard work order creation and management procedures',
    isComplete: true,
    lastUpdated: 'January 2026',
    live: false,
    sections: [
      {
        title: 'Work Order Creation',
        content: 'Basic steps for creating standard maintenance work orders.',
        steps: [
          '• Access BossLM work order module',
          '• Select client and property from database',
          '• Choose work order type (maintenance, repair, enhancement)',
          '• Enter detailed description of work required',
          '• Set priority level and requested completion date'
        ]
      },
      {
        title: 'Task Assignment and Scheduling',
        content: 'Assign appropriate crews and schedule work completion.',
        steps: [
          '• Select crew based on skill requirements and availability',
          '• Estimate time required for completion',
          '• Check for conflicts with existing schedule',
          '• Assign backup crew if primary crew unavailable',
          '• Send notifications to assigned crew members'
        ]
      },
      {
        title: 'Documentation and Follow-up',
        content: 'Proper documentation and completion tracking procedures.',
        steps: [
          '• Include any special client instructions or access requirements',
          '• Attach relevant photos or diagrams',
          '• Set up automatic progress notifications',
          '• Schedule quality check after completion',
          '• Prepare billing documentation upon completion'
        ]
      }
    ]
  },
  'create-a-lawn-contract': {
    title: 'Create a Lawn Contract',
    description: 'Complete process for lawn service contract creation and setup',
    isComplete: true,
    lastUpdated: 'January 2026',
    live: false,
    sections: [
      {
        title: 'Site Assessment and Measurement',
        content: 'Accurate property assessment is essential for proper pricing and service planning.',
        steps: [
          '• Measure all turf areas using GPS or measuring tools',
          '• Identify different grass types and condition',
          '• Note any obstacles, slopes, or challenging areas',
          '• Document irrigation system details',
          '• Take photos of property for reference'
        ]
      },
      {
        title: 'Service Specification Development',
        content: 'Define specific services and frequency based on client needs and property requirements.',
        steps: [
          '• Determine mowing frequency (weekly, bi-weekly)',
          '• Specify edging and trimming requirements',
          '• Plan fertilization schedule (4-6 applications per season)',
          '• Include weed control and pest management services',
          '• Add seasonal services (aeration, overseeding, leaf cleanup)'
        ]
      },
      {
        title: 'Contract Preparation and Pricing',
        content: 'Create comprehensive contract with accurate pricing and clear terms.',
        steps: [
          '• Calculate base service pricing using company rates',
          '• Add pricing for additional services and materials',
          '• Include seasonal adjustments and payment terms',
          '• Specify service boundaries and exclusions',
          '• Review contract with client and obtain signature'
        ]
      }
    ]
  },
  'create-a-winter-contract': {
    title: 'Create a Winter Contract',
    description: 'Winter service contract creation with service level specifications',
    isComplete: true,
    lastUpdated: 'January 2026',
    live: false,
    sections: [
      {
        title: 'Property Assessment for Snow Services',
        content: 'Comprehensive evaluation of property for winter service planning.',
        steps: [
          '• Measure all areas requiring snow removal (drives, walks, parking)',
          '• Identify priority areas (fire lanes, main entrances, ADA access)',
          '• Map salt/ice melt application areas',
          '• Note any obstacles, elevation changes, or access limitations',
          '• Document storm water management and snow storage areas'
        ]
      },
      {
        title: 'Service Level Specifications',
        content: 'Define specific service triggers, timing, and quality standards.',
        steps: [
          '• Set snow accumulation triggers (2", 4", 6" etc.)',
          '• Establish response times for different priority levels',
          '• Specify salt/ice melt application standards',
          '• Define acceptance criteria for completed work',
          '• Include ice management and re-treatment protocols'
        ]
      },
      {
        title: 'Pricing and Contract Terms',
        content: 'Develop accurate pricing structure and comprehensive contract terms.',
        steps: [
          '• Calculate base pricing using per-push or seasonal rates',
          '• Add salt/ice melt costs with current market pricing',
          '• Include additional services (sidewalks, hand work, hauling)',
          '• Set seasonal caps and overage pricing',
          '• Define payment terms, insurance requirements, and liability'
        ]
      }
    ]
  },
  'working-a-snow-event': {
    title: 'Working a Snow Event',
    description: 'Complete workflow for managing snow event operations from morning to evening',
    isComplete: true,
    lastUpdated: 'January 2026',
    live: false,
    sections: [
      {
        title: 'Pre-Event Preparation',
        content: 'Critical tasks to complete before snow begins falling to ensure smooth operations.',
        steps: [
          '• Monitor weather forecasts from multiple sources (AccuWeather, NOAA)',
          '• Notify all crew members 12-24 hours in advance',
          '• Verify equipment readiness: fuel, salt supplies, blade conditions',
          '• Review route assignments and any special client requirements',
          '• Check emergency contact lists and backup crew availability'
        ]
      },
      {
        title: 'Event Management (During Snow)',
        content: 'Active monitoring and coordination during the snow event.',
        steps: [
          '• Deploy crews to commercial properties first (4:00 AM - 8:00 AM)',
          '• Monitor snow accumulation every 2 hours',
          '• Coordinate with crew leaders for status updates',
          '• Adjust routes based on accumulation patterns and priority',
          '• Communicate proactively with customers about delays or issues'
        ]
      },
      {
        title: 'Post-Event Wrap-up',
        content: 'Essential tasks to complete after the snow event concludes.',
        steps: [
          '• Conduct final site inspections for quality assurance',
          '• Document any equipment issues or maintenance needs',
          '• Complete service tickets and billing documentation',
          '• Debrief with crew leaders on lessons learned',
          '• Prepare equipment for next event (fuel, salt, repairs)'
        ]
      }
    ]
  },
  'cascading-customer-communication-to-ops': {
    title: 'Cascading Customer Communication to Ops',
    description: 'Process for effectively communicating customer needs to operations teams',
    isComplete: true,
    lastUpdated: 'January 2026',
    live: false,
    sections: [
      {
        title: 'Customer Communication Intake',
        content: 'Systematic approach to capturing and documenting customer communications.',
        steps: [
          '• Document all customer requests with date, time, and contact person',
          '• Categorize communication type (service request, complaint, change order)',
          '• Record urgency level and requested completion timeline',
          '• Capture specific details, locations, and any special requirements',
          '• Assign unique tracking number for follow-up purposes'
        ]
      },
      {
        title: 'Operations Team Notification',
        content: 'Efficient methods for communicating customer needs to field operations.',
        steps: [
          '• Send immediate notification for urgent or time-sensitive requests',
          '• Use standardized communication templates for consistency',
          '• Include all relevant details: location, scope, timeline, contacts',
          '• Attach photos, maps, or diagrams when applicable',
          '• Confirm receipt and understanding with operations team lead'
        ]
      },
      {
        title: 'Follow-up and Completion Tracking',
        content: 'Ensure customer requests are completed and properly documented.',
        steps: [
          '• Schedule follow-up checks based on requested timeline',
          '• Monitor work order status and completion progress',
          '• Communicate any delays or issues back to customer',
          '• Verify work completion meets customer expectations',
          '• Document resolution and update customer communication log'
        ]
      }
    ]
  },
  'measure-maps-in-sitefotos': {
    title: 'Creating/Editing LM & SP Maps',
    description: 'Guide for measuring and editing landscape maintenance and snow plow maps',
    isComplete: true,
    lastUpdated: 'January 2026',
    live: false,
    sections: [
      {
        title: 'Using SiteFotos for Property Mapping',
        content: 'Essential steps for creating accurate property maps using SiteFotos software.',
        steps: [
          '• Import aerial imagery or satellite photos of the property',
          '• Calibrate measurement scale using known reference points',
          '• Trace property boundaries and service areas accurately',
          '• Mark all landscape maintenance zones (turf, beds, hardscape)',
          '• Save map with standardized naming convention'
        ]
      },
      {
        title: 'Landscape Maintenance Map Creation',
        content: 'Detailed mapping for lawn care and landscape maintenance services.',
        steps: [
          '• Outline all turf areas requiring mowing services',
          '• Define bed areas for mulching, weeding, and plant care',
          '• Mark irrigation zones and sprinkler head locations',
          '• Identify tree care areas and specialty landscape features',
          '• Add notes for access points, gates, and service restrictions'
        ]
      },
      {
        title: 'Snow Plow Route Mapping',
        content: 'Specialized mapping for efficient snow removal operations.',
        steps: [
          '• Map all paved areas requiring snow plowing',
          '• Define priority routes (fire lanes, main drives, ADA access)',
          '• Mark salt/ice melt application areas',
          '• Identify snow storage and stacking locations',
          '• Note obstacles, elevation changes, and equipment limitations'
        ]
      },
      {
        title: 'Map Quality Control and Updates',
        content: 'Ensuring map accuracy and maintaining current information.',
        steps: [
          '• Review maps with field crews for accuracy verification',
          '• Update maps when property changes or service modifications occur',
          '• Maintain version control for map revisions',
          '• Share updated maps with all relevant team members',
          '• Archive old versions for reference and comparison'
        ]
      }
    ]
  },
  'create-tickets-for-ops': {
    title: 'Create Tickets for Ops',
    description: 'Process for creating operational tickets and work assignments',
    isComplete: true,
    lastUpdated: 'January 2026',
    live: false,
    sections: [
      {
        title: 'Ticket Creation Process',
        content: 'Step-by-step process for creating operational work tickets.',
        steps: [
          '• Access the ticketing system through company portal',
          '• Select appropriate ticket type (maintenance, repair, emergency)',
          '• Enter client and property information from database',
          '• Provide detailed description of work required',
          '• Set priority level and requested completion timeframe'
        ]
      },
      {
        title: 'Assignment and Scheduling',
        content: 'Proper assignment and scheduling of tickets for efficient completion.',
        steps: [
          '• Review crew availability and skill requirements',
          '• Assign ticket to appropriate crew or individual',
          '• Coordinate with existing schedule to minimize conflicts',
          '• Send automatic notifications to assigned personnel',
          '• Set up progress tracking and status updates'
        ]
      },
      {
        title: 'Completion and Documentation',
        content: 'Ensuring proper completion documentation and client communication.',
        steps: [
          '• Monitor ticket progress through completion',
          '• Verify work quality meets company standards',
          '• Update ticket with completion notes and photos',
          '• Process billing information and time tracking',
          '• Close ticket and notify customer of completion'
        ]
      }
    ]
  },
  'work-through-lm-renewals': {
    title: 'LM Renewal Walkthrough',
    description: 'Complete process for managing landscape maintenance contract renewals',
    isComplete: true,
    lastUpdated: 'February 2026',
    live: true,
    sections: [
      {
        title: 'Phase 1: Research + PES Setup',
        content: 'Begin the renewal process by researching historical data and creating Property Estimating Sheets (PES) for each property.',
        steps: [
          '1. Open the **LM Renewals/Retentions** document.',
          '2. Go to the `onsitehourstakeoff` tab.',
          '3. Scroll to columns `Z–AH` and begin filling in the `?` cells using the average data found in columns `D–T`.',
          '4. **Flag questionable numbers:**\n   • Verify anything that looks off with the team\n   • Review carefully before finalizing any property → LM Budgets that seem incorrect or clearly need adjusting',
          '5. For each property you review in the `onsitehourstakeoff` tab:\n   • Find the same property on the `LM {YEAR}` tab\n   • In `Column O`, mark the status as **InProgress**',
          '6. Open the **PES Template** `Template 00 LM {YEAR} Sheet with Takeoffs` and create a new copy for each property:\n   • Click `File → Make a copy`\n   • Name the file: `{BOSS PROPERTY NAME} - PES Takeoffs {YEAR}`',
          '7. In the new PES file, enter the data from columns `Z–AH` in the `onsitehourstakeoff` tab for the corresponding property.',
          '8. Save the completed PES file in the `{YEAR} LM PES Sheets` Google Drive folder.',
          '9. After the PES file is completed and saved:\n   • Return to the renewal document\n   • In the `LM {YEAR}` tab, change `Column O` to **Researched** for that property'
        ]
      },
      {
        title: 'Phase 2: BossLM Updates + Contract Prep',
        content: 'Update BossLM with new takeoffs and prepare updated contracts with proper pricing and terms.',
        steps: [
          '1. Compare the renewal document **onsite takeoffs** against the new PES sheet you created to confirm they match.',
          '2. Update the takeoffs in **BossLM** for that property.',
          '3. Once BossLM takeoffs are updated, pull the **new LM contract**.',
          '4. Compare against last year\'s contract and update as needed:\n   • Drive times\n   • Minimums\n   • Any extra services\n   • **Pricing should be 3% higher**, unless it\'s already increased by 3% or more',
          '5. Verify map accuracy against the BossLM takeoffs.',
          '6. In the renewal spreadsheet:\n   • Add notes describing what changed\n   • Highlight changes in **yellow**\n   • Add links in the spreadsheet for quick access:\n     • Link to the new contract\n     • Link to the new PES'
        ]
      },
      {
        title: 'Phase 3: Delivery + Client Email',
        content: 'Prepare and send renewal contracts to clients with professional communication and clear expectations.',
        steps: [
          '1. Create a new email in **Helpdesk** for each renewal\'s primary contact.',
          '2. Add renewal messaging using the template below:\n\n```\nGood afternoon,\n\nI hope you\'re doing well. It\'s that time of year when we prepare and send out our Landscape Maintenance renewal contracts, and your current contract has expired.\n\nThank you for being a loyal Sneller client — we truly appreciate the opportunity to continue working with you. Attached to this email is your lawn maintenance proposal for the upcoming season. To help us plan for spring cleanups and mulch prep, we ask that signed renewals be returned by Friday, March 6. As the weather permits, we hope to begin work the first full week of March.\n\nA couple of quick notes as you review the proposal:\n- If mulch is deferred this season, pricing may increase. We\'ve found that reduced mulch leads to higher labor and material needs to maintain the same level of weed control.\n- Please mark each optional service as Yes or No. If you select Yes but would like to delay or discuss the service, just note that for us. Selecting No does not prevent you from adding the service later — it simply won\'t be included in this contract without your authorization.\n\nWe appreciate your continued partnership and look forward to another great season.\n\nThank you,\n```',
          '3. Attach all new contracts pertaining to the account.',
          '4. Send the email, then update the renewal document status to **Delivered** for each respective property once completed.'
        ]
      }
    ]
  },
  'submitting-pos': {
    title: 'Submitting PO\'s',
    description: 'Process for submitting purchase orders and procurement requests',
    isComplete: true,
    lastUpdated: 'January 2026',
    live: false,
    sections: [
      {
        title: 'Purchase Order Preparation',
        content: 'Proper preparation and documentation for purchase order submissions.',
        steps: [
          '• Verify all item specifications, quantities, and pricing',
          '• Obtain required quotes from approved vendors',
          '• Check budget approval and available funding',
          '• Complete purchase requisition form with all details',
          '• Attach supporting documentation (quotes, specifications)'
        ]
      },
      {
        title: 'Approval Process Management',
        content: 'Navigating the approval workflow for purchase order requests.',
        steps: [
          '• Submit PO through proper approval channels',
          '• Follow up with department managers for review',
          '• Address any questions or requested modifications',
          '• Track approval status through company system',
          '• Notify vendor of approved PO and delivery timeline'
        ]
      },
      {
        title: 'Order Tracking and Receipt',
        content: 'Managing orders from submission through delivery and receipt.',
        steps: [
          '• Monitor order status and delivery schedules',
          '• Coordinate delivery logistics with receiving team',
          '• Verify received items match PO specifications',
          '• Process invoices and payment authorization',
          '• Update inventory systems with received items'
        ]
      }

    ]
  }
}

export default function GuidePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const guide = guides[slug as keyof typeof guides]
  
  if (!guide) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 mb-4 transition-colors text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Guides
            </button>
          </div>
          
          <div className="py-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Guide Not Found
            </h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              The guide you're looking for doesn't exist or may have been moved.
            </p>
            <Link 
              href="/guides" 
              className="inline-flex items-center px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
            >
              Browse All Guides
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  // If guide is not live, show coming soon message
  if (!guide.live) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 mb-4 transition-colors text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Guides
            </button>
          </div>
          
          <div className="py-16 text-center">
            <Construction className="w-24 h-24 mx-auto mb-6 text-gray-300" />
            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Coming Soon
            </h1>
            <h2 className="mb-4 text-xl text-gray-600 dark:text-gray-400">
              {guide.title}
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-gray-600 dark:text-gray-300">
              This guide is currently under development and will be available soon. 
              Check back later for comprehensive step-by-step instructions.
            </p>

            <Link 
              href="/guides" 
              className="inline-flex items-center px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
            >
              Browse Other Guides
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4 transition-colors text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guides
          </button>
        </div>

        {/* Guide Header */}
        <div className="px-4 mb-8 md:px-8">
          <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white uppercase">
            {guide.title}
          </h1>
          <div className="text-lg text-gray-600 dark:text-gray-300">
            {formatText(guide.description)}
          </div>
        </div>

        {/* Guide Content */}
        {guide.isComplete && guide.sections ? (
          <div className="px-4 md:px-8">
            {guide.sections.map((section, index) => (
              <div key={index} className="mb-12">
                <div className="mb-6">
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white uppercase">
                    {section.title}
                  </h2>
                  {section.content && (
                    <div className="mb-6 text-gray-700 dark:text-gray-300 leading-7">
                      {formatText(section.content)}
                    </div>
                  )}
                </div>
                
                <div>
                  {section.steps && renderSteps(section.steps)}
                  
                  {/* Images */}
                  {section.images && (
                    <div className="mt-8 space-y-8">
                      {section.images.map((image, imgIndex) => (
                        <div key={imgIndex} className="space-y-3">
                          <img 
                            src={image.src} 
                            alt={image.alt}
                            className="w-full max-w-4xl border rounded-lg shadow-sm"
                          />
                          {image.caption && (
                            <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                              {image.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Videos */}
                  {section.videos && (
                    <div className="mt-8 space-y-8">
                      {section.videos.map((video, vidIndex) => (
                        <div key={vidIndex} className="space-y-4">
                          {video.src.includes('drive.google.com') ? (
                            <iframe
                              src={video.src}
                              className="w-full max-w-4xl border rounded-lg shadow-sm aspect-video"
                              allowFullScreen
                              frameBorder="0"
                            ></iframe>
                          ) : (
                            <video 
                              src={video.src} 
                              controls
                              className="w-full max-w-4xl border rounded-lg shadow-sm"
                            />
                          )}
                          {video.title && (
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{video.title}</h4>
                          )}
                          {video.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {video.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Coming Soon Content for incomplete guides */
          <div className="py-16 text-center">
            <div className="mb-6">
              <Construction className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
                Coming Soon
              </h2>
              <p className="max-w-2xl mx-auto mb-6 text-lg text-gray-600 dark:text-gray-400">
                This guide is currently under development. We're working to provide you with 
                comprehensive, step-by-step instructions for <strong>{guide.title.toLowerCase()}</strong>.
              </p>
            </div>
            
            {/* Development Info */}
            <div className="max-w-2xl p-6 mx-auto mb-8 border rounded-md status-info">
              <h3 className="mb-2 text-lg font-semibold font-heading text-primary">
                What to Expect
              </h3>
              <ul className="space-y-2 text-left text-blue-800 dark:text-blue-200">
                <li>• Step-by-step process documentation</li>
                <li>• Screenshots and visual guides</li>
                <li>• Best practices and tips</li>
                <li>• Related resources and contacts</li>
              </ul>
            </div>

            {/* Back to Guides */}
            <Link 
              href="/guides" 
              className="inline-flex items-center px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
            >
              Browse Other Guides
            </Link>
          </div>
        )}

        {/* Additional Info for incomplete guides */}
        {!guide.isComplete && (
          <div className="mt-12">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Need Help Now?
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              While this guide is being developed, you can still get assistance with {guide.title.toLowerCase()}.
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Email:</strong> <a href="mailto:support@snellersg.com" className="text-primary hover:text-primary/80">support@snellersg.com</a>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Phone:</strong> Contact your direct supervisor or operations manager
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}