'use client'

import { useState } from 'react'
import { ExternalLink, HelpCircle } from 'lucide-react'
import Layout from '../../components/Layout'

const quickLinks = [
  {
    title: "ACM L10 Doc",
    url: "https://docs.google.com/spreadsheets/d/1tsiXNRoYKHpPSj-GsZjh4mB1o9bHYy-8Q0O7jSiivkk/edit?gid=253066623#gid=253066623",
    description: "Where account managers track priorities, issues, and metrics for weekly EOS Level 10 meetings.",
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
    title: "Compliments/Appreciation From Customers",
    url: "https://docs.google.com/document/d/10AUX53jS8q_ynwDgUFaZhlo6iOiryC5bllqRVcbxEgw/edit?tab=t.0",
    description: "A living record where ACMs log positive feedback received about our services and operations team.",
  },
  {
    title: "Customer Master List (CML)",
    url: "https://docs.google.com/spreadsheets/d/1foWuc4sUsoP8lNTq5dVULEQ5iTlLG9jVb1o7EzYJ77w/edit?gid=1491987735#gid=1491987735",
    description: "The master spreadsheet containing detailed information on all current and former accounts.",
  },
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
    url: "https://docs.google.com/spreadsheets/d/1o2gnNWpQ7E5IlngWE2MArfXZn-IlrKF05aNlVQxpdto/edit?gid=0#gid=0",
    description: "A spreadsheet that tracks the status of LM renewals and retentions for all accounts.",
  },
  {
    title: "Map Making Spreadsheet",
    url: "https://docs.google.com/spreadsheets/d/1fKmMN_cNfEsFcgHaJILRFGpEXLEftVDoFv-5i8EFRxQ/edit?gid=0#gid=0",
    description: "Contains the data used to create and update winter service maps.",
  },
  {
    title: "PE Cheat Sheet",
    url: "https://docs.google.com/spreadsheets/d/1PPFemVzptGsJTWIL_-tl64x-5xuZi7zGSzCAQPCJRcI/edit?gid=2145458084#gid=2145458084",
    description: "Contains helpful links and key metrics used for bidding new property enhancement opportunities.",
  },
  {
    title: "Pile Hauling and Relocating Rates",
    url: "https://docs.google.com/spreadsheets/d/1esplPDkliSwdfGSSHDrBbWXdAFKB5xx5mT5F7AFY3cc/edit?gid=0#gid=0",
    description: "Rate sheet for hauling or relocating pile material between sites and dump locations.",
  },
  {
    title: "Property Estimation Sheet (PES)",
    url: "https://docs.google.com/spreadsheets/d/1aEdgfF3gneoxxnxJngI6siX9H7fOYjaonrH8ue9HJW8/edit?gid=960469792#gid=960469792",
    description: "Used to estimate lawn maintenance pricing and provides the figures needed for entry into BossLM.",
  },
  {
    title: "Snow and Ice Management Updates",
    url: "https://docs.google.com/spreadsheets/d/16_jDPJg-iK2kQb_TMAQreA8-xAK5wTtlXJ0yq3p42Tw/edit?gid=1964679955#gid=1964679955",
    description: "Updates and communications related to snow and ice management operations.",
  },
  {
    title: "Snow Event Notes",
    url: "https://docs.google.com/spreadsheets/d/1M25vDPi1y7_ZaXgQgL5Vcom_sCtLoatdiD1-qf-W-Y8/edit?gid=0#gid=0",
    description: "Notes and details recorded during snow events for follow-up and tracking.",
  },
  {
    title: "SP Renewals/Retentions",
    url: "https://docs.google.com/spreadsheets/d/1LRwLfKNUNuxr5LJ0P7ULn-96oA5TLuHI2dJkPwUiNWc/edit?gid=0#gid=0",
    description: "A spreadsheet that tracks the status of winter renewals and retentions for all accounts.",
  },
  {
    title: "Universal Pricing Sheet",
    url: "https://docs.google.com/spreadsheets/d/1DMtHsAKHUT8m0hUF6iU0dRzeazOwDkm4ipieM3_6CjQ/edit?gid=12786416#gid=12786416",
    description: "Contains current pricing for all Sneller services.",
  }
]

export default function SheetsDocsPage() {
  const [openTooltip, setOpenTooltip] = useState<number | null>(null)

  const toggleTooltip = (index: number) => {
    setOpenTooltip(openTooltip === index ? null : index)
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase mb-4">
            Sheets & Docs
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            A collection of our most used spreadsheets and documents.
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
          {quickLinks.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* Title and Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-medium text-sm text-gray-900 dark:text-white break-words">
                  {item.title}
                </span>
                
                {/* Info Button */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTooltip(index)
                    }}
                    className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Show description"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                  
                  {/* Tooltip */}
                  {openTooltip === index && (
                    <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg max-w-xs">
                      <p>{item.description}</p>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
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
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
