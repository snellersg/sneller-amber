import { ExternalLink } from 'lucide-react'
import type { LinkSection } from '@/data/types'

interface Props {
  intro: string
  sections: LinkSection[]
  emptyMessage: string
}

export default function LinkSections({ intro, sections, emptyMessage }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-lg text-muted-foreground">{intro}</p>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        sections.map(section => (
          <section
            key={section.title}
            className="rounded-lg border border-border bg-card shadow-sm"
          >
            <h2 className="rounded-t-lg border-b border-border bg-background px-4 py-3 text-sm uppercase text-foreground">
              {section.title}
            </h2>
            <ul className="divide-y divide-border">
              {section.items.map(item => (
                <li
                  key={item.url}
                  className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${item.title}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Open
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
