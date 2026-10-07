import Link from 'next/link'

const tabs = [
  { label: 'Sheets & Docs', href: '/' },
  { label: 'Process Guides', href: '/guides' },
] as const

export type HubTab = (typeof tabs)[number]['href']

export default function HubTabs({ active }: { active: HubTab }) {
  return (
    <nav aria-label="Sections" className="mb-8 flex gap-6 border-b border-border sm:gap-8">
      {tabs.map(tab => {
        const isActive = tab.href === active
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 font-heading text-base font-semibold uppercase tracking-tight transition-colors min-[360px]:text-lg sm:text-3xl ${
              isActive
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
