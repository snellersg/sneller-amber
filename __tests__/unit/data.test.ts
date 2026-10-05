import { guideSections } from '@/data/guides'
import { sheetSections } from '@/data/sheets'

describe.each([
  ['sheets', sheetSections],
  ['guides', guideSections],
])('%s data', (_name, sections) => {
  const items = sections.flatMap(section => section.items)

  it('links every item to an https URL', () => {
    for (const item of items) expect(item.url).toMatch(/^https:\/\//)
  })

  it('has unique URLs (used as list keys)', () => {
    const urls = items.map(item => item.url)
    expect(new Set(urls).size).toBe(urls.length)
  })
})
