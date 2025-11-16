'use client'

import { useState } from 'react'
import { ExternalLink, HelpCircle } from 'lucide-react'
import Layout from '../../components/Layout'

const tools = [
  {
    title: "Asana",
    description: "Primary platform for internal collaboration, task tracking, and project management.",
    url: "https://asana.com/apps",
    img: "/tools/asana.png",
  },
  {
    title: "BossLM",
    description: "Central business platform for managing accounts, jobs, and client data.",
    url: "https://sneller.bosslm.com/LoginWindow.aspx?ReturnUrl=%2f",
    img: "/tools/boss.png",
  },
  {
    title: "ChatGPT",
    description: "AI assistant for brainstorming, email writing, and task support.",
    url: "https://openai.com/chatgpt",
    img: "/tools/chatgpt.png",
  },
  {
    title: "Freshdesk",
    description: "Helpdesk platform for managing customer support requests and communication.",
    url: "https://freshdesk.com/mobile",
    img: "/tools/freshdesk.png",
  },
  {
    title: "Google Drive",
    description: "Shared storage platform for company files and folders.",
    url: "https://www.google.com/drive/download/",
    img: "/tools/google-drive.png",
  },
  {
    title: "Google Calendar",
    description: "Tool for managing events, meetings, and shared schedules.",
    url: "https://calendar.google.com",
    img: "/tools/google-calendar.png",
  },
  {
    title: "Gmail",
    description: "Primary service for internal emailing.",
    url: "https://mail.google.com",
    img: "/tools/gmail.png",
  },
  {
    title: "Kisi",
    description: "App-based key system for accessing secure facilities.",
    url: "https://www.getkisi.com/mobile-app",
    img: "/tools/kisi.png",
  },
  {
    title: "Paychex",
    description: "HR platform for managing payroll, time off, and employee data.",
    url: "https://www.paychex.com/apps",
    img: "/tools/paychex.png",
  },
  {
    title: "Ramp",
    description: "Platform used to upload receipts and track purchases for company cards.",
    url: "https://ramp.com/mobile",
    img: "/tools/ramp.png",
  },
  {
    title: "Reolink",
    description: "Live camera platform used for monitoring sites during snow events.",
    url: "https://reolink.com/app/",
    img: "/tools/reolink.png",
  },
  {
    title: "Sitefotos",
    description: "Mapping and photo tracking tool for job sites and property documentation.",
    url: "https://www.sitefotos.com",
    img: "/tools/sitefotos.png",
  },
]

export default function ToolsPlatformsPage() {
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
            Platforms
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Essential software platforms used in daily account management operations.
          </p>
        </div>

        {/* Platforms List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* Logo, Title and Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Logo */}
                {tool.img && (
                  <img
                    src={tool.img}
                    alt={`${tool.title} logo`}
                    className="w-6 h-6 rounded object-contain shrink-0"
                  />
                )}
                
                {/* Title */}
                <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {tool.title}
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
                      <p>{tool.description}</p>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Open Button */}
              <a
                href={tool.url}
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
