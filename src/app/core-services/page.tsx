'use client'

import { ExternalLink } from 'lucide-react'
import Layout from '../../components/Layout'

const coreServices = [
  {
    title: "Snow Plowing",
    badge: "Snow",
    description: "Snowplowing of parking lots and/or roadways after 1.5\" of new snow has accumulated.",
    details: [
      "1.5\" trigger balances accessibility with operational efficiency",
      "Strategic snow placement to prevent unnecessary hauling",
      "Multiple services when needed during ongoing storms to maintain clear conditions",
      "Equipment matched to property characteristics"
    ]
  },
  {
    title: "Shoveling",
    badge: "Snow",
    description: "Hand shoveling, snow blowing, and/or plowing of sidewalks, overhead doors, and dumpster enclosure doors after 1.5\" of new snow.",
    details: [
      "Prioritizes pedestrian safety and slip-fall liability prevention",
      "Methods matched to each area (shoveling, blowing, small equipment)",
      "Systematic clearing of critical access points",
      "Cleared full-width wherever possible"
    ]
  },
  {
    title: "Ice Melt Services",
    badge: "Snow",
    description: "Tiered service levels to match client risk tolerance and budget.",
    levels: [
      {
        level: "Level 1",
        description: "Most frequent applications. Proactive service including pretreatment before predicted snow/ice. Multiple reservice visits throughout the day (4-8+ applications)."
      },
      {
        level: "Level 2",
        description: "Clear and wet conditions maintained. Generally no pretreatment. Continued reservice throughout the day (3-7+ applications)."
      },
      {
        level: "Level 3",
        description: "Moderately high service. Less proactive than Levels 1-2. Clear and wet not always the goal. Multiple applications during events (3-6 applications)."
      },
      {
        level: "Level 4",
        description: "Limited service with specific caps. Early applications with limited return visits. May have do-not-exceed restrictions."
      }
    ],
    details: [
      "Pretreatment prevents snow/ice bonding to pavement",
      "\"Clear and wet\" standard = all snow/ice removed, only liquid brine remaining",
      "Application timing based on temperature, precipitation, traffic, and time of day"
    ]
  },
  {
    title: "Irrigation Startup & Shutdown",
    badge: "Lawn",
    description: "Spring startup and fall winterization of irrigation systems.",
    details: [
      "Spring: Zone-by-zone testing and damage identification",
      "Fall: Compressed air winterization to prevent freeze damage",
      "$700 repair threshold allows immediate minor repairs without delays",
      "Timing optimized based on weather patterns and mow schedules"
    ]
  },
  {
    title: "Spring Cleanup",
    badge: "Lawn",
    description: "Removal of leaves and natural debris from lawn areas and planting beds.",
    details: [
      "Removes winter debris before growth begins",
      "Prevents smothering of turf and perennials",
      "Timing targets optimal conditions (not too early, not too late)"
    ],
    link: "https://docs.google.com/presentation/d/1rWdvRh6gbUfFtt3ff44tYXwTtsa6y3_WEp9MItWQu9s/edit?slide=id.p#slide=id.p",
    buttonText: "View Ops Training Slides"
  },
  {
    title: "Lawn Weed Control & Fertilizer Program",
    badge: "Lawn",
    description: "Comprehensive weed control and fertilization program to maintain healthy, weed-free turf.",
    components: [
      {
        name: "Crabgrass Control",
        details: "One pre-emergent application in spring. Water within 5 days for maximum effectiveness."
      },
      {
        name: "Broadleaf Weed Control",
        details: "Three applications throughout the season. Spot treatments for post-emergent crabgrass and nutsedge available on T&M basis."
      },
      {
        name: "Fertilizer",
        details: "Three applications (spring, summer, fall) using slow-release formulations for steady growth and deep green color."
      }
    ],
    details: [
      "Licensed and trained in proper chemical use",
      "Pre-emergent timing critical for crabgrass prevention",
      "Slow-release fertilizers prevent surge growth and burning"
    ]
  },
  {
    title: "Weekly Lawn Mowing",
    badge: "Lawn",
    description: "Regular mowing, trimming, and edging to maintain professional appearance.",
    details: [
      "Weekly visits during active growing season",
      "Mow, trim, edge, and blow all hard surfaces",
      "Height maintained at optimal level for turf health",
      "Equipment selection based on property size and terrain"
    ]
  },
  {
    title: "Mulch Installation",
    badge: "Lawn",
    description: "Annual application of mulch to planting beds for weed suppression, moisture retention, and aesthetic appeal.",
    details: [
      "1 inch depth recommended for annual weed suppression",
      "Edge beds before mulching for clean appearance",
      "Multiple mulch types available (hardwood, cedar, rubber)",
      "Prevents soil erosion and regulates soil temperature"
    ]
  },
  {
    title: "Fall Cleanup",
    badge: "Lawn",
    description: "Removal of leaves and debris to prepare property for winter.",
    details: [
      "Two visits as leaves fall throughout season",
      "Removes leaves from beds, lawns, and hard surfaces",
      "Final cleanup after leaf drop is complete",
      "Prevents turf smothering and disease issues"
    ]
  },
  {
    title: "Bed Weeding",
    badge: "Lawn",
    description: "Hand weeding of planting beds to maintain clean, professional appearance.",
    details: [
      "Biweekly hand-pulling and spraying throughout growing season",
      "Remove unsightly weeds and kill them through the root system",
      "Frequency based on weed pressure and client expectations",
      "Pre-emergent applications can reduce weeding needs (applied prior to mulch installation)"
    ]
  },
  {
    title: "Pruning & Trimming",
    badge: "Lawn",
    description: "Selective pruning of shrubs and ornamental trees to maintain health and appearance.",
    details: [
      "Timing based on plant type and flowering schedule",
      "Removes dead, diseased, and crossing branches",
      "Maintains desired size and shape",
      "Promotes healthy growth and flowering"
    ]
  }
]

export default function CoreServicesPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase mb-4">
            Core Services
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Foundational services that form the backbone of Sneller's maintenance programs.
          </p>
        </div>

        {/* Services grouped by type */}
        <div className="space-y-16">
          {/* Winter (WR) Services */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase mb-8 border-b border-gray-200 dark:border-gray-700 pb-2">
              Winter (WR)
            </h2>
            <div className="space-y-12">
              {coreServices.filter(service => service.badge === 'Snow').map((service, idx) => (
                <section key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0">
                  {/* Title and Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {service.title}
                    </h3>
                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-blue-600/20">
                      WR
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {service.description}
                  </p>

                  {/* Service Details or Levels */}
                  {service.details && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Key Details
                      </h4>
                      <ul className="space-y-2">
                        {service.details.map((detail, detailIdx) => (
                          <li key={detailIdx} className="flex items-start">
                            <span className="text-blue-500 dark:text-blue-400 mr-2">•</span>
                            <span className="text-gray-600 dark:text-gray-300">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {service.levels && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Service Levels
                      </h4>
                      <div className="grid gap-4">
                        {service.levels.map((level, levelIdx) => (
                          <div key={levelIdx} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{level.level}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{level.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>

          {/* Lawn Maintenance (LM) Services */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase mb-8 border-b border-gray-200 dark:border-gray-700 pb-2">
              Lawn Maintenance (LM)
            </h2>
            <div className="space-y-12">
              {coreServices.filter(service => service.badge === 'Lawn').map((service, idx) => (
                <section key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0">
                  {/* Title and Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {service.title}
                    </h3>
                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-green-600/20">
                      LM
                    </span>
                  </div>

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-base leading-relaxed">
                {service.description}
              </p>

              {/* Service Levels */}
              {service.levels && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Service Levels
                  </p>
                  <div className="space-y-3">
                    {service.levels.map((level, levelIdx) => (
                      <div key={levelIdx} className="border-l-4 border-indigo-300 dark:border-indigo-600 pl-4">
                        <p className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">
                          {level.level}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {level.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Program Components */}
              {service.components && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Program Components
                  </p>
                  <div className="space-y-3">
                    {service.components.map((component, compIdx) => (
                      <div key={compIdx} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <p className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
                          {component.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {component.details}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Details */}
              {service.details && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Key Details
                  </p>
                  <ul className="space-y-2">
                    {service.details.map((detail, detailIdx) => (
                      <li key={detailIdx} className="flex items-start">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Link Button */}
              {service.link && (
                <div className="mt-4">
                  <a
                    href={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    {service.buttonText || "Learn More"}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </section>
          ))}
        </div>
          </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Note:</strong> All services are delivered by licensed and insured professionals 
            following industry best practices and client-specific requirements.
          </p>
        </div>
      </div>
    </div>
    </Layout>
  )
}