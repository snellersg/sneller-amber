import HubTabs from '@/components/HubTabs'
import LinkSections from '@/components/LinkSections'
import { sheetSections } from '@/data/sheets'

export default function SheetsDocsPage() {
  return (
    <>
      <HubTabs active="/" />
      <LinkSections
        intro="A collection of our most used spreadsheets and documents."
        sections={sheetSections}
        emptyMessage="No sheets or docs yet."
      />
    </>
  )
}
