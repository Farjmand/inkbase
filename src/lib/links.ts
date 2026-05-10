import type { Page } from '@/types'

const WIKILINK_RE = /\[\[\s*([^\]]+?)\s*\]\]/g

export function extractWikilinks(content: string): string[] {
  const titles = new Set<string>()
  for (const match of content.matchAll(WIKILINK_RE)) {
    const title = match[1].trim()
    if (title) titles.add(title)
  }
  return Array.from(titles)
}

export function resolveLink(title: string, pages: Page[]): Page | undefined {
  const lower = title.toLowerCase()
  return pages.find(p => p.title.toLowerCase() === lower)
}

export function buildBacklinksIndex(pages: Page[]): Map<string, string[]> {
  const index = new Map<string, string[]>()
  for (const page of pages) {
    for (const linked of extractWikilinks(page.content)) {
      const target = resolveLink(linked, pages)
      if (!target) continue
      const existing = index.get(target.id) ?? []
      if (!existing.includes(page.id)) {
        index.set(target.id, [...existing, page.id])
      }
    }
  }
  return index
}
