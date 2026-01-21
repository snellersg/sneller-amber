'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, FileText, Construction } from 'lucide-react'
import Link from 'next/link'
import Layout from '@/components/Layout'

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
  category: string;
  isComplete: boolean;
  estimatedTime: string;
  difficulty: string;
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
    title: 'ACM/Sales - Client Handoff Meeting',
    description: 'Complete workflow for transitioning new clients from sales to account management',
    category: 'Meetings',
    isComplete: true,
    estimatedTime: '10-15 minutes',
    difficulty: 'Beginner',
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
        ],
        images: [
          {
            src: '/images/guides/handoff-meeting-agenda.jpg',
            alt: 'Sample handoff meeting agenda template',
            caption: 'Example meeting agenda template for client handoffs'
          }
        ],
        videos: [
          {
            src: '/videos/guides/effective-handoff-meetings.mp4',
            title: 'Effective Client Handoff Meetings',
            description: 'Watch this 5-minute video on conducting successful handoff meetings'
          }
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
    ],
    resources: [
      { title: 'Client Handoff Checklist', url: '#', description: 'Printable checklist for handoff meetings' },
      { title: 'BossLM Client Setup Guide', url: '#', description: 'Step-by-step client setup in BossLM' }
    ],
    contacts: [
      { role: 'Sales Director', name: 'Contact Sales', email: 'sales@snellersg.com' },
      { role: 'ACM Lead', name: 'Contact ACM', email: 'acm@snellersg.com' }
    ]
  },
  'use-the-l10-document': {
    title: 'How to use the L10 Document',
    description: 'Complete guide for utilizing L10 documentation in operations',
    category: 'Meetings',
    isComplete: true,
    estimatedTime: '15 minutes',
    difficulty: 'Beginner',
    lastUpdated: 'January 2026',
    live: false,
    sections: [
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
    ],
    resources: [
      { title: 'L10 Meeting Scorecard Template', url: '#', description: 'Weekly scorecard tracking template' },
      { title: 'EOS L10 Meeting Guide', url: '#', description: 'Complete Entrepreneurial Operating System meeting guide' }
    ],
    contacts: [
      { role: 'Operations Manager', name: 'Steve Sneller', email: 'steve@snellersg.com' }
    ]
  },
  'identifying-pe-opportunities': {
    title: 'Identifying PE Opportunities',
    description: 'Proactive identification and tracking of property enhancement opportunities',
    category: 'Estimating & Contracting',
    isComplete: true,
    estimatedTime: '25 minutes',
    difficulty: 'Intermediate',
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
    ],
    resources: [
      { title: 'PE Opportunity Assessment Form', url: '#', description: 'Standardized form for documenting opportunities' },
      { title: 'Photo Documentation Guidelines', url: '#', description: 'Best practices for property enhancement photos' }
    ],
    contacts: [
      { role: 'Business Development', name: 'BD Team', email: 'bd@snellersg.com' },
      { role: 'Estimating Department', name: 'Estimating', email: 'estimates@snellersg.com' }
    ]
  },
  'create-a-construction-work-order': {
    title: 'Create a Construction Work Order (CWO)',
    description: 'Process for creating construction work orders in BossLM',
    category: 'Estimating & Contracting',
    isComplete: true,
    estimatedTime: '20 minutes',
    difficulty: 'Intermediate',
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
    ],
    resources: [
      { title: 'BossLM CWO Tutorial', url: '#', description: 'Step-by-step video guide for BossLM' },
      { title: 'Construction Estimating Guidelines', url: '#', description: 'Standard pricing and timing references' }
    ],
    contacts: [
      { role: 'Construction Manager', name: 'Construction Dept', email: 'construction@snellersg.com' },
      { role: 'BossLM Support', name: 'IT Support', email: 'support@snellersg.com' }
    ]
  },
  'create-a-work-order': {
    title: 'Create a Work Order (WO)',
    description: 'Standard work order creation and management procedures',
    category: 'Estimating & Contracting',
    isComplete: true,
    estimatedTime: '15 minutes',
    difficulty: 'Beginner',
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
    ],
    resources: [
      { title: 'BossLM Work Order Quick Reference', url: '#', description: 'Fast reference guide for common tasks' },
      { title: 'Crew Assignment Matrix', url: '#', description: 'Guide for matching crews to work types' }
    ],
    contacts: [
      { role: 'Operations Coordinator', name: 'Operations', email: 'ops@snellersg.com' },
      { role: 'Crew Scheduler', name: 'Scheduling', email: 'scheduling@snellersg.com' }
    ]
  },
  'create-a-lawn-contract': {
    title: 'Create a Lawn Contract',
    description: 'Complete process for lawn service contract creation and setup',
    category: 'Estimating & Contracting',
    isComplete: true,
    estimatedTime: '30 minutes',
    difficulty: 'Intermediate',
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
    ],
    resources: [
      { title: 'Lawn Service Pricing Calculator', url: '#', description: 'Standardized pricing tool for lawn services' },
      { title: 'Contract Template Library', url: '#', description: 'Standard contract templates for different service levels' }
    ],
    contacts: [
      { role: 'Landscape Manager', name: 'Landscape Dept', email: 'landscape@snellersg.com' },
      { role: 'Sales Manager', name: 'Sales Team', email: 'sales@snellersg.com' }
    ]
  },
  'create-a-winter-contract': {
    title: 'Create a Winter Contract',
    description: 'Winter service contract creation with service level specifications',
    category: 'Estimating & Contracting',
    isComplete: true,
    estimatedTime: '35 minutes',
    difficulty: 'Advanced',
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
    ],
    resources: [
      { title: 'Winter Service Estimating Guide', url: '#', description: 'Comprehensive pricing and service level guide' },
      { title: 'Snow Contract Templates', url: '#', description: 'Standard contract formats for different service types' }
    ],
    contacts: [
      { role: 'Snow Operations Manager', name: 'Snow Ops', email: 'snow@snellersg.com' },
      { role: 'Contract Specialist', name: 'Contracts', email: 'contracts@snellersg.com' }
    ]
  },
  'working-a-snow-event': {
    title: 'Working a Snow Event',
    description: 'Complete workflow for managing snow event operations from morning to evening',
    category: 'Workflows',
    isComplete: true,
    estimatedTime: '20-30 minutes',
    difficulty: 'Intermediate',
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
    ],
    resources: [
      { title: 'Weather Monitoring Dashboard', url: 'https://pro.accuweather.com', description: 'Professional weather forecasting tools' },
      { title: 'Crew Communication System', url: '#', description: 'Internal notification and tracking system' }
    ],
    contacts: [
      { role: 'Operations Manager', name: 'Steve Sneller', email: 'steve@snellersg.com' },
      { role: 'Emergency Dispatch', name: 'Dispatch Team', email: 'dispatch@snellersg.com' }
    ]
  },
  'cascading-customer-communication-to-ops': {
    title: 'Cascading Customer Communication to Ops',
    description: 'Process for effectively communicating customer needs to operations teams',
    category: 'Workflows',
    isComplete: true,
    estimatedTime: '20 minutes',
    difficulty: 'Intermediate',
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
    ],
    resources: [
      { title: 'Customer Communication Log Template', url: '#', description: 'Standardized tracking form for customer requests' },
      { title: 'Operations Notification Checklist', url: '#', description: 'Checklist ensuring complete information transfer' }
    ],
    contacts: [
      { role: 'Customer Service Manager', name: 'CS Team', email: 'service@snellersg.com' },
      { role: 'Operations Coordinator', name: 'Operations', email: 'ops@snellersg.com' }
    ]
  },
  'measure-maps-in-sitefotos': {
    title: 'Creating/Editing LM & SP Maps',
    description: 'Guide for measuring and editing landscape maintenance and snow plow maps',
    category: 'Workflows',
    isComplete: true,
    estimatedTime: '40 minutes',
    difficulty: 'Advanced',
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
    ],
    resources: [
      { title: 'SiteFotos User Manual', url: '#', description: 'Complete guide to SiteFotos mapping software' },
      { title: 'Map Standardization Guide', url: '#', description: 'Company standards for map creation and formatting' }
    ],
    contacts: [
      { role: 'GIS Specialist', name: 'Mapping Team', email: 'mapping@snellersg.com' },
      { role: 'IT Support', name: 'Technical Support', email: 'support@snellersg.com' }
    ]
  },
  'create-tickets-for-ops': {
    title: 'Create Tickets for Ops',
    description: 'Process for creating operational tickets and work assignments',
    category: 'Workflows',
    isComplete: true,
    estimatedTime: '15 minutes',
    difficulty: 'Beginner',
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
    ],
    resources: [
      { title: 'Ticketing System Quick Start Guide', url: '#', description: 'Fast reference for common ticket operations' },
      { title: 'Priority Level Guidelines', url: '#', description: 'Standards for determining ticket priority levels' }
    ],
    contacts: [
      { role: 'Dispatch Coordinator', name: 'Dispatch', email: 'dispatch@snellersg.com' },
      { role: 'Operations Manager', name: 'Operations', email: 'ops@snellersg.com' }
    ]
  },
  'working-through-lm-renewals': {
    title: 'Working Through LM Renewals',
    description: 'Complete process for managing landscape maintenance contract renewals',
    category: 'Business Development',
    isComplete: true,
    estimatedTime: '45 minutes',
    difficulty: 'Advanced',
    lastUpdated: 'January 2026',
    live: false,
    sections: [
      {
        title: 'Renewal Planning and Timeline',
        content: 'Strategic planning and timeline management for successful contract renewals.',
        steps: [
          '• Begin renewal process 90 days before contract expiration',
          '• Review current contract performance and service history',
          '• Analyze pricing adjustments needed for inflation and costs',
          '• Schedule site visits to assess any property changes',
          '• Prepare renewal proposal with updated terms and pricing'
        ]
      },
      {
        title: 'Client Relationship Management',
        content: 'Building and maintaining strong client relationships for successful renewals.',
        steps: [
          '• Schedule face-to-face meetings with key decision makers',
          '• Present annual service review highlighting achievements',
          '• Address any service issues or concerns proactively',
          '• Demonstrate value added through the contract period',
          '• Gather feedback on service satisfaction and improvement areas'
        ]
      },
      {
        title: 'Renewal Negotiation Process',
        content: 'Professional approach to negotiating contract terms and pricing.',
        steps: [
          '• Present renewal proposal with clear value proposition',
          '• Justify any pricing increases with market data and costs',
          '• Offer flexible terms or service modifications if needed',
          '• Address competitive concerns with service differentiation',
          '• Negotiate win-win solutions that benefit both parties'
        ]
      },
      {
        title: 'Contract Finalization',
        content: 'Steps to finalize renewed contracts and ensure smooth transition.',
        steps: [
          '• Prepare final contract documents with agreed terms',
          '• Schedule contract signing with appropriate stakeholders',
          '• Update service specifications and crew assignments',
          '• Communicate renewal success to operations team',
          '• Plan service improvements or changes for new contract period'
        ]
      }
    ],
    resources: [
      { title: 'Contract Renewal Checklist', url: '#', description: 'Complete checklist for renewal process management' },
      { title: 'Market Pricing Analysis Tool', url: '#', description: 'Competitive analysis and pricing benchmarking' }
    ],
    contacts: [
      { role: 'Account Manager', name: 'Account Management', email: 'accounts@snellersg.com' },
      { role: 'Business Development Director', name: 'BD Director', email: 'bd@snellersg.com' }
    ]
  },
  'submitting-pos': {
    title: 'Submitting PO\'s',
    description: 'Process for submitting purchase orders and procurement requests',
    category: 'Business Development',
    isComplete: true,
    estimatedTime: '20 minutes',
    difficulty: 'Intermediate',
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
    ],
    resources: [
      { title: 'PO Submission Guidelines', url: '#', description: 'Complete guide to purchase order procedures' },
      { title: 'Approved Vendor Directory', url: '#', description: 'List of pre-approved suppliers and contact information' }
    ],
    contacts: [
      { role: 'Purchasing Manager', name: 'Purchasing', email: 'purchasing@snellersg.com' },
      { role: 'Finance Department', name: 'Accounting', email: 'accounting@snellersg.com' }
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
              className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Guides
            </button>
          </div>
          
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Guide Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The guide you're looking for doesn't exist or may have been moved.
            </p>
            <Link 
              href="/guides" 
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
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
              className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Guides
            </button>
          </div>
          
          <div className="text-center py-16">
            <Construction className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h1>
            <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              {guide.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              This guide is currently under development and will be available soon. 
              Check back later for comprehensive step-by-step instructions.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left max-w-md mx-auto mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Guide Details</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Category:</strong> {guide.category}</p>
                <p><strong>Estimated Time:</strong> {guide.estimatedTime}</p>
                <p><strong>Difficulty:</strong> {guide.difficulty}</p>
              </div>
            </div>
            <Link 
              href="/guides" 
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
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
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Guides
          </button>
        </div>

        {/* Guide Header */}
        <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/20">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {guide.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            {guide.description}
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Category: {guide.category}</span>
            </div>
            {guide.estimatedTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Time: {guide.estimatedTime}</span>
              </div>
            )}
            {guide.difficulty && (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  guide.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  guide.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {guide.difficulty}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Status: {guide.isComplete ? 'Complete' : 'In Development'}
              </span>
            </div>
          </div>
        </div>

        {/* Guide Content */}
        {guide.isComplete && guide.sections ? (
          <div className="space-y-8">
            {guide.sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  {section.title}
                </h2>
                {section.content && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {section.content}
                  </p>
                )}
                {section.steps && (
                  <div className="ml-4">
                    <ul className="space-y-2">
                      {section.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-gray-700 dark:text-gray-300">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Images */}
                {section.images && (
                  <div className="mt-6 space-y-4">
                    {section.images.map((image, imgIndex) => (
                      <div key={imgIndex} className="space-y-2">
                        <img 
                          src={image.src} 
                          alt={image.alt}
                          className="w-full max-w-2xl rounded-lg shadow-md"
                        />
                        {image.caption && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Videos */}
                {section.videos && (
                  <div className="mt-6 space-y-4">
                    {section.videos.map((video, vidIndex) => (
                      <div key={vidIndex} className="space-y-2">
                        <video 
                          controls 
                          className="w-full max-w-2xl rounded-lg shadow-md"
                        >
                          <source src={video.src} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        {video.title && (
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {video.title}
                          </h4>
                        )}
                        {video.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {video.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Resources and Contacts */}
            {(guide.resources || guide.contacts) && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                {guide.resources && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Resources
                      </h3>
                      <div className="space-y-3">
                        {guide.resources.map((resource, idx) => (
                          <div key={idx}>
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              {resource.title}
                            </a>
                            {resource.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {resource.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {guide.contacts && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Contacts
                      </h3>
                      <div className="space-y-3">
                        {guide.contacts.map((contact, idx) => (
                          <div key={idx}>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {contact.role}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {contact.name} • 
                              <a href={`mailto:${contact.email}`} className="text-primary hover:text-primary/80">
                                {contact.email}
                              </a>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Coming Soon Content for incomplete guides */
          <div className="text-center py-16">
            <div className="mb-6">
              <Construction className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Coming Soon
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                This guide is currently under development. We're working to provide you with 
                comprehensive, step-by-step instructions for <strong>{guide.title.toLowerCase()}</strong>.
              </p>
            </div>
            
            {/* Development Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-2xl mx-auto mb-8">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                What to Expect
              </h3>
              <ul className="text-left text-blue-800 dark:text-blue-200 space-y-2">
                <li>• Step-by-step process documentation</li>
                <li>• Screenshots and visual guides</li>
                <li>• Best practices and tips</li>
                <li>• Related resources and contacts</li>
              </ul>
            </div>

            {/* Back to Guides */}
            <Link 
              href="/guides" 
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Other Guides
            </Link>
          </div>
        )}

        {/* Additional Info for incomplete guides */}
        {!guide.isComplete && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Need Help Now?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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