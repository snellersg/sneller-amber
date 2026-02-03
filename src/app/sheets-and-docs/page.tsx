'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, HelpCircle } from 'lucide-react'
import Layout from '../../components/Layout'
import { Badge } from '../../components/ui/badge'

const sections = [
  {
    title: "General",
    items: [
      {
        title: "ACM L10 Doc",
        url: "https://docs.google.com/spreadsheets/d/1tsiXNRoYKHpPSj-GsZjh4mB1o9bHYy-8Q0O7jSiivkk/edit?gid=253066623#gid=253066623",
        description: "Track priorities, issues, and metrics for weekly EOS Level 10 meetings.",
      },
      {
        title: "Compliments/Appreciation From Customers",
        url: "https://docs.google.com/document/d/10AUX53jS8q_ynwDgUFaZhlo6iOiryC5bllqRVcbxEgw/edit?tab=t.0",
        description: "Living record of positive feedback received about our services and operations team.",
      },
      {
        title: "Customer Master List (CML)",
        url: "https://docs.google.com/spreadsheets/d/1foWuc4sUsoP8lNTq5dVULEQ5iTlLG9jVb1o7EzYJ77w/edit?gid=1491987735#gid=1491987735",
        description: "Master spreadsheet containing detailed information on all current and former accounts.",
      },
      {
        title: "Universal Pricing Sheet",
        url: "https://docs.google.com/spreadsheets/d/1DMtHsAKHUT8m0hUF6iU0dRzeazOwDkm4ipieM3_6CjQ/edit?gid=12786416#gid=12786416",
        description: "Contains current pricing for all Sneller services.",
      }
    ]
  },
  {
    title: "WR",
    items: [
      {
        title: "25/26 Data for Customer Reporting",
        url: "https://lookerstudio.google.com/u/0/reporting/935959fe-0330-4a4d-a088-7ceb4b0757e2/page/p_aywo571rod",
        description: "Looker Studio dashboard with data for 2025/2026 customer reporting and analytics.",
      },
      {
        title: "ACM/Steve Snow Convo Cheat Sheet",
        url: "https://docs.google.com/spreadsheets/d/1LHZlUNa7WHBkcgjHm9fW-MDlvpxMpHlBAm5_s0s3O6M/edit?gid=1070268231#gid=1070268231",
        description: "Cheat sheet for key snow conversation points between ACMs and Steve.",
      },
      {
        title: "Average Services Per Service Level",
        url: "https://docs.google.com/spreadsheets/d/1fENwJfi0TfAquaYj9MQ4htjxzLVOUpr3vot1CBPmr7g/edit?gid=0#gid=0",
        description: "Analysis of average service quantities by service level to help with pricing and service planning.",
      },
      {
        title: "Map Making Spreadsheet",
        url: "https://docs.google.com/spreadsheets/d/1fKmMN_cNfEsFcgHaJILRFGpEXLEftVDoFv-5i8EFRxQ/edit?gid=0#gid=0",
        description: "Contains the data used to create and update winter service maps.",
      },
      {
        title: "Snow Piling and Hauling Prices",
        url: "https://docs.google.com/spreadsheets/d/1esplPDkliSwdfGSSHDrBbWXdAFKB5xx5mT5F7AFY3cc/edit?gid=0#gid=0",
        description: "Rate sheet for hauling or relocating snow piles around sites and to dump locations.",
      },
      {
        title: "Snow and Ice Management Updates",
        url: "https://docs.google.com/spreadsheets/d/16_jDPJg-iK2kQb_TMAQreA8-xAK5wTtlXJ0yq3p42Tw/edit?gid=1964679955#gid=1964679955",
        description: "Log of Dan's emails for updating customers each snow event.",
      },
      {
        title: "Snow Event Notes",
        url: "https://docs.google.com/spreadsheets/d/1M25vDPi1y7_ZaXgQgL5Vcom_sCtLoatdiD1-qf-W-Y8/edit?gid=1281422397#gid=1281422397",
        description: "Notes and details recorded during snow events for follow-up and tracking.",
      },
      {
        title: "Snow Pile Removal Master Doc",
        url: "https://docs.google.com/spreadsheets/d/1Ccjc-G7sTADrnp7fa6KX-rmbIfulJOW0z9xohievZr4/edit?gid=1858114008#gid=1858114008",
        description: "Master tracker for snow pile removal planning, scheduling, and execution.",
      },
      {
        title: "SP Renewals/Retentions",
        url: "https://docs.google.com/spreadsheets/d/1LRwLfKNUNuxr5LJ0P7ULn-96oA5TLuHI2dJkPwUiNWc/edit?gid=0#gid=0",
        description: "Tracks the status of winter renewals and retentions for all accounts.",
      }
    ]
  },
  {
    title: "LM",
    items: [
      {
        title: "GRR Mulch Doc",
        url: "https://docs.google.com/spreadsheets/d/1FE1kCkjMlhDUDDAJEFsrCQ5Gj4Wdhx2hnMNLnR5iKBU/edit?gid=1191137942#gid=1191137942",
        description: "Tracks mulch services for properties managed by the Grand Rapids branch.",
      },
      {
        title: "Irrigation Doc",
        url: "https://docs.google.com/spreadsheets/d/14UVKCJNAXQyT0npiRXSwBGqnYLfOZw7AWky7Q5tiTu0/edit?gid=1764257423#gid=1764257423",
        description: "Tracks irrigation service details for all accounts company-wide.",
      },
      {
        title: "KZOO Mulch Doc",
        url: "https://docs.google.com/spreadsheets/d/1IiEb5Vai_p_GC0bBUk-VhpA1R9NXnsG4QDXwZAdQg_8/edit?gid=77878928#gid=77878928",
        description: "Tracks mulch services for properties managed by the Kalamazoo branch.",
      },
      {
        title: "LAN Mulch Doc",
        url: "https://docs.google.com/spreadsheets/d/1PRVM5pWHkk637ZktW54ijzDVbexzmwOY7K_hom1dZNs/edit?gid=70033876#gid=70033876",
        description: "Tracks mulch services for properties managed by the Lansing branch.",
      },
      {
        title: "LM Renewals/Retentions",
        url: "https://docs.google.com/spreadsheets/d/1o2gnNWpQ7E5IlngWE2MArfXZn-IlrKF05aNlVQxpdto/edit?gid=644878389#gid=644878389",
        description: "Tracks the status of LM renewals and retentions for all accounts.",
      },
      {
        title: "PE Cheat Sheet",
        url: "https://docs.google.com/spreadsheets/d/1PPFemVzptGsJTWIL_-tl64x-5xuZi7zGSzCAQPCJRcI/edit?gid=2145458084#gid=2145458084",
        description: "Contains helpful links and key metrics used for bidding new property enhancement opportunities.",
      },
      {
        title: "Property Estimation Sheet (PES)",
        url: "https://docs.google.com/spreadsheets/d/1aEdgfF3gneoxxnxJngI6siX9H7fOYjaonrH8ue9HJW8/edit?gid=960469792#gid=960469792",
        description: "Used to estimate lawn maintenance pricing and provides the figures needed for entry into BossLM.",
      }
    ]
  }
]

export default function SheetsDocsPage() {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null)

  // Close tooltip on outside click
  useEffect(() => {
    const handleClick = () => setOpenTooltip(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  const toggleTooltip = (key: string) => {
    setOpenTooltip(openTooltip === key ? null : key)
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 uppercase dark:text-white">
            Sheets & Docs
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            A collection of our most used spreadsheets and documents.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="px-4 py-3 border-b border-gray-200 rounded-t-lg bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <h2 className="text-sm font-semibold text-gray-900 uppercase dark:text-white">
                  {section.title}
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {section.items.map((item, index) => {
                  const key = `${section.title}-${index}`
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      {/* Title and Info */}
                      <div className="flex items-center flex-1 min-w-0 gap-3">
                        {item.badge && (
                          <Badge
                            variant="destructive"
                            className="px-2 py-1 text-xs text-white bg-amber-500 hover:bg-amber-600"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        <span className="text-sm font-medium text-gray-900 break-words dark:text-white">
                          {item.title}
                        </span>
                        
                        {/* Info Button */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleTooltip(key)
                            }}
                            className="w-5 h-5 text-gray-400 transition-colors shrink-0 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="Show description"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                          
                          {/* Tooltip */}
                          {openTooltip === key && (
                            <div
                              className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 text-xs leading-relaxed text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg min-w-[18rem] max-w-3xl whitespace-normal"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p>{item.description}</p>
                              <div className="absolute -translate-x-1/2 border-4 border-transparent top-full left-1/2 border-t-gray-900 dark:border-t-gray-700"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Open Button */}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded-md transition-colors"
                      >
                        Open
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
