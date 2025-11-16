'use client'

import Layout from '../../components/Layout'

const processes = [
  {
    title: "Client Onboarding & Orientation",
    purpose: "Set up new clients in systems, ensure expectations are aligned, and document key info.",
    steps: [
      "Create client profile in CRM (Boss/CML)",
      "Upload signed contracts, maps, and notes",
      "Schedule introductory call or site visit within 1 week",
      "Assign and record CFL (Contact Frequency Level)"
    ],
    bestPractice: "Mirror Sneller's \"Ease of Communication\" unique by being clear, fast, and proactive from day one."
  },
  {
    title: "Proactive Communication & Relationship Management",
    purpose: "Build trust and stay ahead of issues.",
    steps: [
      "Respond to all client communications within 4 business hours",
      "Provide proactive weather updates during storm events",
      "Conduct regular site walks based on CFL",
      "Log all feedback, issues, and updates in Asana/Helpdesk",
      "Conduct mid-season and end-of-season reviews"
    ],
    bestPractice: "Be the client's eyes in the field. Take initiative and follow up thoroughly."
  },
  {
    title: "Enhancement Sales & Value Add",
    purpose: "Identify and sell impactful improvement opportunities.",
    steps: [
      "Identify enhancement opportunities during site visits",
      "Log each opportunity in Asana",
      "Collaborate with PE Division Manager for scope and pricing",
      "Send proposal and follow up within 3 business days",
      "Confirm client satisfaction after completion"
    ],
    bestPractice: "Focus on solving real problems with creative, cost-effective solutions."
  },
  {
    title: "Contract Management & Renewals",
    purpose: "Retain profitable business and align scope with client expectations.",
    steps: [
      "Review service history, time studies, and profitability",
      "Adjust scope or pricing based on performance and client goals",
      "Propose renewals or multi-year extensions",
      "Finalize contracts and file signed copies in Boss",
      "Ensure winter and landscape scopes are aligned with target margins"
    ],
    bestPractice: "Be prepared, be strategic, and be early."
  },
  {
    title: "Icemelt & Winter Service Oversight",
    purpose: "Maintain safety and quality during winter operations.",
    steps: [
      "Confirm icemelt service level with each client before winter",
      "Communicate and document any changes to service levels",
      "Review snow event tracking logs and follow up on issues",
      "Update and confirm maps for plow, shovel, and icemelt areas",
      "Coordinate any loader work or special requests during events"
    ],
    bestPractice: "Transparency and responsiveness are essential during winter."
  },
  {
    title: "Lawn & Landscape Oversight",
    purpose: "Deliver year-round value and maintain site appearance.",
    steps: [
      "Monitor spring cleanups and irrigation startup",
      "Plan and coordinate mulch installs",
      "Oversee mowing, edging, pruning, and weeding services",
      "Track service timelines and note delays or issues",
      "Confirm irrigation shutdown and end-of-season closeout"
    ],
    bestPractice: "Walk the site regularly and communicate expectations clearly."
  },
  {
    title: "Service Provider Coordination (MSP/SSP)",
    purpose: "Maintain consistency and quality on subcontracted properties.",
    steps: [
      "Confirm scope and expectations with each service provider",
      "Monitor site conditions and service quality via reports or photos",
      "Address any concerns quickly and directly",
      "Document performance notes in Asana"
    ],
    bestPractice: "Set expectations early and follow through with accountability."
  },
  {
    title: "Issue Resolution & Documentation",
    purpose: "Resolve client concerns quickly and thoroughly.",
    steps: [
      "Enter the issue into Asana",
      "Tag relevant team members for resolution",
      "Follow up on progress and confirm completion",
      "Notify client and confirm their satisfaction with the solution"
    ],
    bestPractice: "Every issue deserves a closed loop. Don't assume—follow up."
  },
  {
    title: "Data Tracking & Reporting",
    purpose: "Make informed decisions and report on key metrics.",
    steps: [
      "Maintain L10 scorecard metrics (renewals, PE sales, etc.)",
      "Track visit counts, missed services, and service history",
      "Log updates and notes in Boss/Asana",
      "Prepare summaries or recaps for seasonal reviews"
    ],
    bestPractice: "Clean data enables better service and stronger decisions."
  },
  {
    title: "EOS/Traction & Internal Meetings",
    purpose: "Stay aligned and drive continuous improvement.",
    steps: [
      "Attend weekly L10 with prepared updates",
      "Report on metrics, issues, and Rocks",
      "Contribute to IDS discussions",
      "Complete weekly to-dos and priorities",
      "Collaborate across departments on shared initiatives"
    ],
    bestPractice: "Be prepared, stay accountable, and contribute solutions."
  },
  {
    title: "Admin Tasks & Compliance",
    purpose: "Ensure all systems, paperwork, and files are accurate and up to date.",
    steps: [
      "Send clients current COIs and other compliance documents as needed",
      "Enter job notes and review invoices in Boss",
      "Maintain up-to-date contact info and maps using Boss/Sitefotos",
      "Double-check contract details, scope, and signed documents"
    ],
    bestPractice: "Prevent problems with attention to detail and documentation."
  },
  {
    title: "Training, SOP Buildout & Mentorship",
    purpose: "Strengthen the team through shared knowledge and systems.",
    steps: [
      "Update SOPs or workflow guides when processes change",
      "Mentor new ACMs or support staff when assigned",
      "Provide feedback to improve tools and processes",
      "Contribute to training materials or onboarding sessions"
    ],
    bestPractice: "Set others up to succeed by sharing what works."
  }
]

export default function CoreProcessesPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase mb-4">
            Core Processes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Essential workflows and responsibilities that define the Account Manager role at Sneller.
          </p>
        </div>

        {/* Processes */}
        <div className="space-y-12">
          {processes.map((process, idx) => (
            <section key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white uppercase mb-6">
                {process.title}
              </h2>

              {/* Purpose */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Purpose
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {process.purpose}
                </p>
              </div>

              {/* Steps */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Steps
                </p>
                <ul className="space-y-2">
                  {process.steps.map((step, stepIdx) => (
                    <li key={stepIdx} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best Practice */}
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Best Practice
                </p>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  {process.bestPractice}
                </p>
              </div>
            </section>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-secondary dark:bg-secondary/20 border border-primary/30 dark:border-primary/30 rounded-lg">
          <p className="text-sm text-primary dark:text-primary">
            <strong>Remember:</strong> These processes are the foundation of exceptional account management. 
            Consistency in execution builds trust and delivers results.
          </p>
        </div>
      </div>
    </Layout>
  )
}
