import type { Page } from '@/types'

export interface SearchResult {
  page: Page
  snippet: string
  score: number
}

const SNIPPET_RADIUS = 60

function buildSnippet(text: string, query: string): string {
  const lower = text.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return text.slice(0, SNIPPET_RADIUS * 2)
  const start = Math.max(0, idx - SNIPPET_RADIUS)
  const end = Math.min(text.length, idx + query.length + SNIPPET_RADIUS)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

export function searchPages(pages: Page[], query: string): SearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase().trim()

  const results: SearchResult[] = []
  for (const page of pages) {
    const titleMatch = page.title.toLowerCase().includes(q)
    const contentMatch = page.content.toLowerCase().includes(q)
    const tagMatch = page.tags.some(t => t.toLowerCase().includes(q))

    if (!titleMatch && !contentMatch && !tagMatch) continue

    const score = (titleMatch ? 10 : 0) + (tagMatch ? 5 : 0) + (contentMatch ? 1 : 0)
    const snippet = titleMatch
      ? buildSnippet(page.title, query)
      : buildSnippet(page.content, query)

    results.push({ page, snippet, score })
  }

  return results.sort((a, b) => b.score - a.score)
}
