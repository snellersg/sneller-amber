'use client'

import Layout from '../../components/Layout'

// Type definitions
interface Composition {
  component?: string
  nutrient?: string
  percentage: string
  function: string
}

interface Round {
  round: string
  fertilizer: string
  description: string
}

interface ProductItem {
  title: string
  badge: string
  productName?: string
  description: string
  composition?: Composition[]
  keyProperties?: string[]
  rounds?: Round[]
}

interface ProductCategory {
  category: string
  items: ProductItem[]
}

const products: ProductCategory[] = [
  {
    category: 'Ice Melt Products',
    items: [
      {
        title: 'IM Ice Melt',
        badge: 'Snow',
        productName: 'Great Lakes Rock Salt',
        description:
          'Natural rock salt mined from underground deposits in the Great Lakes region (Michigan, Ohio, Ontario).',
        composition: [
          {
            component: 'Sodium Chloride (NaCl)',
            percentage: '95-99%',
            function: 'Primary de-icing agent',
          },
          {
            component: 'Insoluble Minerals',
            percentage: '1-5%',
            function: 'Naturally occurring impurities (gypsum, limestone)',
          },
        ],
        keyProperties: [
          'Effective melting temperature: Down to 5°F (-15°C)',
          'Optimal performance: Over 15°F (-9°C)',
          'Source: Underground mines in Michigan, Ohio, Ontario',
          'Appearance: White to off-white crystalline rock',
        ],
      },
      {
        title: 'SW Ice Melt',
        badge: 'Snow',
        productName: 'Icinator Premium Ice Melt',
        description:
          'Scientifically engineered blend where pure sodium chloride is uniformly infused with calcium and magnesium chlorides. Screened to uniform ¼" granule size for consistent melting performance.',
        composition: [
          {
            component: 'Sodium Chloride (NaCl)',
            percentage: '~90-95%',
            function: 'Primary de-icing agent',
          },
          {
            component: 'Calcium Chloride (CaCl₂)',
            percentage: 'Proprietary blend',
            function: 'Fast-acting low-temp melter, releases heat',
          },
          {
            component: 'Magnesium Chloride (MgCl₂)',
            percentage: 'Proprietary blend',
            function: 'Enhances melt and brine formation',
          },
        ],
        keyProperties: [
          'Effective melting temperature: Down to -22°F (-30°C)',
          '  Melts 18% more ice vs. rock salt at 14°F',
          '  Melts 88% more ice at -4°F',
          '  Melts 100% more ice at -22°F',
          'Uniform ¼" granule size for consistent application',
          'Homogenous infusion (not coated or blended)',
          'Minimal tracking and residue',
        ],
      },
    ],
  },
  {
    category: 'Lawn Care Products',
    items: [
      {
        title: 'Default Weed & Feed Program',
        badge: 'Lawn',
        description:
          'Three-round program delivering fertilization and weed control throughout the growing season.',
        rounds: [
          {
            round: 'Round 1 (Early Spring)',
            fertilizer: '13-0-3 with Prodiamine pre-emergent and Triad Select post-emergent',
            description:
              'Early season fertilization with crabgrass prevention and broadleaf weed control',
          },
          {
            round: 'Round 2 (Late Spring/Early Summer)',
            fertilizer: '27-0-8 with post-emergent broadleaf control',
            description: 'High nitrogen for active growing season with continued weed control',
          },
          {
            round: 'Round 3 (Summer/Fall)',
            fertilizer: '27-0-8 with post-emergent broadleaf control',
            description: 'Continued high nitrogen feeding and weed control for season-long health',
          },
        ],
      },
      {
        title: 'Starter Fertilization',
        badge: 'Lawn',
        productName: 'Lesco 18-24-12 with NOS Technology',
        description:
          'Applied to newly seeded or sodded lawns to promote rapid establishment and robust root development.',
        composition: [
          {
            nutrient: 'Nitrogen (N)',
            percentage: '18%',
            function: 'Promotes early shoot growth and green-up',
          },
          {
            nutrient: 'Phosphorus (P₂O₅)',
            percentage: '24%',
            function: 'Critical for root development and seedling establishment',
          },
          {
            nutrient: 'Potassium (K₂O)',
            percentage: '12%',
            function: 'Improves seedling hardiness and disease tolerance',
          },
        ],
        keyProperties: [
          '30% polymer-coated slow-release nitrogen (PolyPlus technology)',
          'NOS (Nitrogen Optimization System) prevents nitrogen loss',
          'Provides continuous feeding for up to 8 weeks',
          'High phosphorus accelerates establishment and root development',
          'Coverage: 50 lb bag covers approximately 12,000 sq ft',
          'Apply at seeding/sodding, before or immediately after installation',
        ],
      },
    ],
  },
]

export default function ProductKnowledgePage() {
  return (
    <Layout>
      <div className="page-product-knowledge max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 uppercase dark:text-white">
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
              <h2 className="pb-2 mb-8 text-2xl font-bold text-gray-900 uppercase border-b border-gray-200 dark:text-white dark:border-gray-700">
                {category.category}
              </h2>

              <div className="space-y-12">
                {category.items.map((product, prodIdx) => (
                  <section
                    key={prodIdx}
                    className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0"
                  >
                    {/* Product Title and Badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 uppercase dark:text-white">
                        {product.title}
                      </h3>
                      {product.badge && (
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            product.badge === 'Snow'
                              ? 'bg-primary/10 text-primary ring-primary/20'
                              : 'bg-accent/10 text-accent-foreground ring-accent/20 dark:bg-accent/20 dark:text-accent dark:ring-accent/30'
                          }`}
                        >
                          {product.badge === 'Snow'
                            ? 'WR'
                            : product.badge === 'Lawn'
                              ? 'LM'
                              : product.badge}
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    {product.productName && (
                      <p className="mb-3 text-base text-gray-900 dark:text-white">
                        <strong>Product Name:</strong> {product.productName}
                      </p>
                    )}

                    {/* Description */}
                    {product.description && (
                      <p className="mb-6 text-gray-600 dark:text-gray-400">{product.description}</p>
                    )}

                    {/* Composition Table */}
                    {product.composition && (
                      <div className="mb-6">
                        <h4 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Composition
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-collapse border-gray-300 dark:border-gray-600">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-gray-700">
                                <th className="px-4 py-2 text-sm font-medium text-left text-gray-900 border border-gray-300 dark:border-gray-600 dark:text-white">
                                  Component
                                </th>
                                <th className="px-4 py-2 text-sm font-medium text-left text-gray-900 border border-gray-300 dark:border-gray-600 dark:text-white">
                                  Percentage
                                </th>
                                <th className="px-4 py-2 text-sm font-medium text-left text-gray-900 border border-gray-300 dark:border-gray-600 dark:text-white">
                                  Function
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.composition?.map((comp, compIdx) => (
                                <tr key={compIdx}>
                                  <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300 dark:border-gray-600 dark:text-white">
                                    {comp.component || comp.nutrient}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300 dark:border-gray-600 dark:text-white">
                                    {comp.percentage}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600 border border-gray-300 dark:border-gray-600 dark:text-gray-400">
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
                        <h4 className="mb-2 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Key Properties
                        </h4>
                        <ul className="space-y-2">
                          {product.keyProperties.map((prop, propIdx) => {
                            const isIndented = prop.startsWith('  ')
                            const displayText = isIndented ? prop.substring(2) : prop
                            return (
                              <li
                                key={propIdx}
                                className={`flex items-start ${isIndented ? 'ml-6' : ''}`}
                              >
                                <div className="w-2 h-2 mt-2 mr-3 rounded-full bg-primary shrink-0"></div>
                                <span className="text-gray-700 dark:text-gray-300">
                                  {displayText}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Program Rounds */}
                    {product.rounds && (
                      <div className="mb-6">
                        <h4 className="mb-3 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                          Application Schedule
                        </h4>
                        <div className="space-y-3">
                          {product.rounds.map((round, roundIdx) => (
                            <div
                              key={roundIdx}
                              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                            >
                              <h5 className="mb-2 font-semibold text-gray-900 dark:text-white">
                                {round.round}
                              </h5>
                              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
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
