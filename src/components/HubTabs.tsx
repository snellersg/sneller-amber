import Link from 'next/link'

const tabs = [
  { label: 'Sheets & Docs', href: '/' },
  { label: 'Process Guides', href: '/guides' },
] as const

export type HubTab = (typeof tabs)[number]['href']

export default function HubTabs({ active }: { active: HubTab }) {
  return (
    <nav aria-label="Sections" className="mb-8 flex gap-8 border-b border-border">
      {tabs.map(tab => {
        const isActive = tab.href === active
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`-mb-px border-b-2 pb-3 font-heading text-xl font-semibold uppercase tracking-tight transition-colors sm:text-3xl ${
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
