'use client'

import Layout from '../../components/Layout'

const addOnServices = [
  {
    title: "Container Filling",
    badge: "Snow",
    description: "Filling of salt/sand containers at building entrances for spot treatment between service visits.",
    details: [
      "Gives building occupants ability to address icy conditions",
      "Reduces slip-and-fall liability during business hours",
      "Scheduled weekly, bi-weekly, or monthly based on usage"
    ],
    opportunities: [
      "Properties with multiple building entrances",
      "High foot traffic facilities",
      "Sites with steep ramps or stairs",
      "Buildings with 24-hour operations"
    ]
  },
  {
    title: "Pile Moving",
    badge: "Snow",
    description: "Relocation or removal of snow piles that encroach on parking areas, loading zones, or functional spaces.",
    details: [
      "Preserves usable parking and functional areas",
      "Prevents spring flooding and drainage issues",
      "Scheduled mid-season or when functionality problems arise",
      "Off-site hauling available when needed"
    ],
    opportunities: [
      "Properties with limited pile storage areas",
      "Piles reducing available parking spaces",
      "Sites with piles blocking fire lanes or delivery zones",
      "Heavy snowfall years with above-average accumulation"
    ]
  },
  {
    title: "Mole Trapping",
    badge: "Lawn",
    description: "Comprehensive mole control program with property evaluation, trap placement, and weekly monitoring.",
    details: [
      "Most effective long-term control method",
      "Program runs May through October",
      "Weekly monitoring and trap adjustment",
      "Prevents turf damage and trip hazards"
    ],
    opportunities: [
      "Visible surface tunnels in lawn areas",
      "Properties near wooded areas or golf courses",
      "High-visibility properties where aesthetics are critical",
      "Sites with irrigation systems"
    ]
  },
  {
    title: "Goose Repellent",
    badge: "Lawn",
    description: "Application of EPA-registered grape-based repellent to deter geese from grazing on turf areas.",
    details: [
      "Addresses sanitation and aesthetic problems",
      "Safe for humans and pets",
      "Applications every 2-4 weeks during season",
      "Early spring through fall migration"
    ],
    opportunities: [
      "Properties near water features or ponds",
      "Sports fields and athletic complexes",
      "Sites with visible goose droppings",
      "High foot-traffic gathering areas"
    ]
  },
  {
    title: "Soil Testing & Lawn Analysis",
    badge: "Lawn",
    description: "Professional soil testing to determine pH, nutrient levels, and amendment needs.",
    details: [
      "Identifies specific soil deficiencies",
      "Creates data-driven treatment plans",
      "Prevents wasted applications",
      "Optimizes turf health and appearance"
    ],
    opportunities: [
      "Poor turf performance despite regular maintenance",
      "Properties with known soil issues",
      "New construction sites",
      "Areas with consistent weed or disease problems"
    ]
  },
  {
    title: "Flea & Tick Control",
    badge: "Lawn",
    description: "Targeted applications to reduce flea and tick populations in outdoor areas.",
    details: [
      "Focuses on high-risk areas (edges, tall grass, shaded zones)",
      "Multiple applications throughout season",
      "Reduces disease transmission risk",
      "Safe when applied properly"
    ],
    opportunities: [
      "Properties adjacent to wooded areas",
      "Sites with frequent outdoor activities",
      "Areas with known tick populations",
      "Client health concerns or requests"
    ]
  },
  {
    title: "Post-Emergent Crabgrass Treatment",
    badge: "Lawn",
    description: "Targeted treatment of crabgrass that emerged despite pre-emergent applications.",
    details: [
      "Multiple applications may be required",
      "Most effective on young crabgrass",
      "Prevents seed production and spread",
      "Time & Material basis"
    ],
    opportunities: [
      "Visible crabgrass in turf areas",
      "Properties that missed pre-emergent window",
      "Hot, stressed turf with crabgrass breakthrough",
      "Sites with irrigation issues allowing weed growth"
    ]
  },
  {
    title: "Preventative Grub Control",
    badge: "Lawn",
    description: "Preventative insecticide application to stop grub damage before it occurs.",
    details: [
      "Applied June-July before egg hatch",
      "Prevents turf damage and brown patches",
      "More effective than curative treatment",
      "Single application provides season-long control"
    ],
    opportunities: [
      "Properties with history of grub damage",
      "Sites near wooded areas or fields",
      "High-value turf areas",
      "Areas with Japanese beetle activity"
    ]
  },
  {
    title: "Post-Emergent Grub Control",
    badge: "Lawn",
    description: "Curative treatment for active grub infestations causing visible turf damage.",
    details: [
      "Applied late summer/early fall when grubs are feeding",
      "Addresses active damage situations",
      "Less effective than preventative approach",
      "May require turf renovation after treatment"
    ],
    opportunities: [
      "Visible brown patches in late summer",
      "Turf that pulls up easily",
      "Increased skunk, raccoon, or bird activity digging for grubs",
      "White C-shaped larvae visible in soil"
    ]
  },
  {
    title: "Core Aeration",
    badge: "Lawn",
    description: "Mechanical removal of soil cores to reduce compaction and improve root development.",
    details: [
      "Improves water and nutrient penetration",
      "Reduces soil compaction",
      "Enhances root development",
      "Typically performed spring and/or fall"
    ],
    opportunities: [
      "Compacted turf in high-traffic areas",
      "Poor water infiltration or standing water",
      "Thin or struggling turf",
      "Properties that haven't been aerated recently"
    ]
  },
  {
    title: "Pre-Emergent Weed Control",
    badge: "Lawn",
    description: "Additional pre-emergent applications for beds or turf areas with heavy weed pressure.",
    details: [
      "Prevents annual weed germination",
      "Applied before soil temperature triggers weed growth",
      "Multiple applications may be needed",
      "Significantly reduces hand weeding needs"
    ],
    opportunities: [
      "Bed areas with heavy annual weed pressure",
      "Properties without regular mulch applications",
      "Sites with persistent weed problems",
      "Areas where hand weeding is cost-prohibitive"
    ]
  },
  {
    title: "Brush Hogging",
    badge: "Lawn",
    description: "Mechanical cutting of overgrown fields, fence lines, or natural areas with heavy-duty equipment.",
    details: [
      "Clears tall grass, weeds, and light brush",
      "Prevents woody plant establishment",
      "Maintains clean property perimeters",
      "Often required by municipalities or fire codes"
    ],
    opportunities: [
      "Overgrown natural areas or buffer zones",
      "Properties with fence lines needing clearing",
      "Sites with municipal weed ordinance issues",
      "Large parcels with unmaintained acreage"
    ]
  },
  {
    title: "Tree Insect/Pest Treatment (Root Drench)",
    badge: "Lawn",
    description: "Systemic insecticide applied to soil around tree base for absorption through roots.",
    details: [
      "Provides long-lasting protection (full season)",
      "Controls boring insects and sucking pests",
      "Less visible than foliar sprays",
      "Minimal impact on beneficial insects"
    ],
    opportunities: [
      "Trees with boring insect problems (Emerald Ash Borer, etc.)",
      "High-value specimen trees",
      "Properties preferring low-visibility treatments",
      "Sites with beneficial insect considerations"
    ]
  },
  {
    title: "Tree Insect/Pest Treatment (Foliar)",
    badge: "Lawn",
    description: "Direct spray application to tree foliage for immediate pest control.",
    details: [
      "Fast-acting for visible pest problems",
      "Targets leaf-feeding insects",
      "May require multiple applications",
      "Weather-dependent timing"
    ],
    opportunities: [
      "Trees with visible leaf damage or defoliation",
      "Active pest infestations needing immediate control",
      "Ornamental trees in high-visibility areas",
      "Caterpillar or aphid outbreaks"
    ]
  },
  {
    title: "Deep Root Tree Fertilization",
    badge: "Lawn",
    description: "Injection of liquid fertilizer into root zone to improve tree health and vigor.",
    details: [
      "Delivers nutrients directly to root zone",
      "Improves color, growth, and stress tolerance",
      "Bypasses compacted or poor surface soils",
      "Typically performed spring or fall"
    ],
    opportunities: [
      "Trees showing stress symptoms (yellowing, poor growth)",
      "Compacted soils preventing surface fertilizer uptake",
      "High-value trees needing health boost",
      "Trees in poor soil conditions"
    ]
  },
  {
    title: "Soil Sterilization",
    badge: "Lawn",
    description: "Application of non-selective herbicide to prevent all vegetation growth in specific areas.",
    details: [
      "Eliminates weeds along curbs, fence lines, gravel areas",
      "Residual control prevents regrowth",
      "Reduces maintenance labor significantly",
      "Multiple applications may be needed"
    ],
    opportunities: [
      "Gravel parking areas or pathways",
      "Fence lines and property perimeters",
      "Areas where vegetation creates safety issues",
      "Sites where hand weeding is impractical"
    ]
  },
  {
    title: "Gypsum/Beet Juice Salt Repair",
    badge: "Lawn",
    description: "Application of soil amendments to remediate winter salt damage to turf and plant material.",
    details: [
      "Helps displace sodium from soil",
      "Improves soil structure and drainage",
      "Applied spring after salt damage is visible",
      "May require multiple applications for severe damage"
    ],
    opportunities: [
      "Turf showing salt burn near roadways or walks",
      "Plants with brown needles or foliage after winter",
      "Properties adjacent to heavily salted roads",
      "Sites with high ice melt usage"
    ]
  }
]

export default function AddOnServicesPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase mb-4">
            Add-On Services
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Supplemental services that address specific property challenges and enhance standard maintenance programs.
          </p>
        </div>

        {/* Services */}
        <div className="space-y-12">
          {addOnServices.map((service, idx) => (
            <section key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0">
              {/* Title and Badge */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white uppercase">
                  {service.title}
                </h2>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    service.badge === 'Snow'
                      ? 'bg-[#0A93D5]/10 text-[#0A93D5] ring-[#0A93D5]/20 dark:bg-[#0A93D5]/20 dark:text-[#0A93D5] dark:ring-[#0A93D5]/30'
                      : 'bg-secondary/20 text-secondary-foreground ring-secondary/30 dark:bg-secondary/30 dark:text-secondary-foreground dark:ring-secondary/40'
                  }`}
                >
                  {service.badge === 'Snow' ? 'WR' : service.badge === 'Lawn' ? 'LM' : service.badge}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-base leading-relaxed">
                {service.description}
              </p>

              {/* Key Details */}
              {service.details && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Key Details
                  </p>
                  <ul className="space-y-2">
                    {service.details.map((detail, detailIdx) => (
                      <li key={detailIdx} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Opportunity Indicators */}
              {service.opportunities && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Opportunity Indicators
                  </p>
                  <ul className="space-y-2">
                    {service.opportunities.map((opp, oppIdx) => (
                      <li key={oppIdx} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300">{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </Layout>
  )
}
