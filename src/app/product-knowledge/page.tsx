'use client'

import Layout from '../../components/Layout'

const products = [
  {
    category: "Ice Melt Products",
    items: [
      {
        title: "IM Ice Melt",
        badge: "Snow",
        productName: "Great Lakes Rock Salt",
        description: "Natural rock salt mined from underground deposits in the Great Lakes region (Michigan, Ohio, Ontario).",
        composition: [
          { component: "Sodium Chloride (NaCl)", percentage: "95-99%", function: "Primary de-icing agent" },
          { component: "Insoluble Minerals", percentage: "1-5%", function: "Naturally occurring impurities (gypsum, limestone)" }
        ],
        keyProperties: [
          "Effective melting temperature: Down to 5°F (-15°C)",
          "Optimal performance: Around 15°F (-9°C)",
          "Source: Underground mines in Michigan, Ohio, Ontario",
          "Appearance: White to off-white crystalline rock"
        ]
      },
      {
        title: "SW Ice Melt",
        badge: "Snow",
        productName: "Icinator Premium Ice Melt",
        description: "Scientifically engineered blend where pure sodium chloride is uniformly infused with calcium and magnesium chlorides. Screened to uniform ¼\" granule size for consistent melting performance.",
        composition: [
          { component: "Sodium Chloride (NaCl)", percentage: "~90-95%", function: "Primary de-icing agent" },
          { component: "Calcium Chloride (CaCl₂)", percentage: "Proprietary blend", function: "Fast-acting low-temp melter, releases heat" },
          { component: "Magnesium Chloride (MgCl₂)", percentage: "Proprietary blend", function: "Enhances melt and brine formation" }
        ],
        keyProperties: [
          "Effective melting temperature: Down to -22°F (-30°C)",
          "Melts 18% more ice vs. rock salt at 14°F",
          "Melts 88% more ice at -4°F",
          "Melts 100% more ice at -22°F",
          "Uniform ¼\" granule size for consistent application",
          "Homogenous infusion (not coated or blended)",
          "Minimal tracking and residue"
        ]
      }
    ]
  },
  {
    category: "Lawn Care Products",
    items: [
      {
        title: "Default Weed & Feed Program",
        badge: "Lawn",
        description: "Three-round program delivering fertilization and weed control throughout the growing season.",
        rounds: [
          {
            round: "Round 1 (Early Spring)",
            fertilizer: "13-0-3 with Prodiamine pre-emergent and Triad Select post-emergent",
            description: "Early season fertilization with crabgrass prevention and broadleaf weed control"
          },
          {
            round: "Round 2 (Late Spring/Early Summer)",
            fertilizer: "27-0-8 with post-emergent broadleaf control",
            description: "High nitrogen for active growing season with continued weed control"
          },
          {
            round: "Round 3 (Summer/Fall)",
            fertilizer: "27-0-8 with post-emergent broadleaf control",
            description: "Continued high nitrogen feeding and weed control for season-long health"
          }
        ]
      },
      {
        title: "Starter Fertilization",
        badge: "Lawn",
        productName: "Lesco 18-24-12 with NOS Technology",
        description: "Applied to newly seeded or sodded lawns to promote rapid establishment and robust root development.",
        composition: [
          { nutrient: "Nitrogen (N)", percentage: "18%", function: "Promotes early shoot growth and green-up" },
          { nutrient: "Phosphorus (P₂O₅)", percentage: "24%", function: "Critical for root development and seedling establishment" },
          { nutrient: "Potassium (K₂O)", percentage: "12%", function: "Improves seedling hardiness and disease tolerance" }
        ],
        keyProperties: [
          "30% polymer-coated slow-release nitrogen (PolyPlus technology)",
          "NOS (Nitrogen Optimization System) prevents nitrogen loss",
          "Provides continuous feeding for up to 8 weeks",
          "High phosphorus accelerates establishment and root development",
          "Coverage: 50 lb bag covers approximately 12,000 sq ft",
          "Apply at seeding/sodding, before or immediately after installation"
        ]
      }
    ]
  }
]

export default function ProductKnowledgePage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase mb-4">
            Product Info
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Detailed specifications for products and materials used in Sneller's services.
          </p>
        </div>

        {/* Product Categories */}
        <div className="space-y-16">
          {products.map((category, catIdx) => (
            <div key={catIdx}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase mb-8 border-b border-gray-200 dark:border-gray-700 pb-2">
                {category.category}
              </h2>

              <div className="space-y-12">
                {category.items.map((product, prodIdx) => (
                  <section key={prodIdx} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    {/* Product Title and Badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white uppercase">
                        {product.title}
                      </h3>
                      {product.badge && (
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            product.badge === 'Snow'
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              : 'bg-secondary dark:bg-secondary/30 text-primary dark:text-primary ring-primary/20'
                          }`}
                        >
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    {product.productName && (
                      <p className="text-base mb-3 text-gray-900 dark:text-white">
                        <strong>Product Name:</strong> {product.productName}
                      </p>
                    )}

                    {/* Description */}
                    {product.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {product.description}
                      </p>
                    )}

                    {/* Composition Table */}
                    {product.composition && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          Composition
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-gray-700">
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                                  Component
                                </th>
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                                  Percentage
                                </th>
                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">
                                  Function
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.composition.map((comp, compIdx) => (
                                <tr key={compIdx}>
                                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">
                                    {(comp as any).component || (comp as any).nutrient}
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">
                                    {comp.percentage}
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                    {comp.function}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Key Properties */}
                    {product.keyProperties && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Key Properties
                        </h4>
                        <ul className="space-y-2">
                          {product.keyProperties.map((prop, propIdx) => (
                            <li key={propIdx} className="flex items-start">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300">{prop}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Program Rounds */}
                    {(product as any).rounds && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          Application Schedule
                        </h4>
                        <div className="space-y-3">
                          {(product as any).rounds.map((round: any, roundIdx: number) => (
                            <div key={roundIdx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {round.round}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <strong>Product:</strong> {round.fertilizer}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {round.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
