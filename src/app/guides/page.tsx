import HubTabs from '@/components/HubTabs'
import LinkSections from '@/components/LinkSections'
import { guideSections } from '@/data/guides'

export const metadata = { title: 'Process Guides | AMBER' }

export default function GuidesPage() {
  return (
    <>
      <HubTabs active="/guides" />
      <LinkSections
        intro="Step-by-step guides for daily operations and best practices."
        sections={guideSections}
        emptyMessage="Process guides are coming soon. Check back later."
      />
    </>
  )
}
