import { create } from 'zustand'
import type { Page } from '@/types'
import { buildBacklinksIndex } from '@/lib/links'
import { searchPages, type SearchResult } from '@/lib/search'

interface KnowledgeState {
  // Derived from flatPages — call reindex after any page mutation
  backlinks: Map<string, string[]>
  tagIndex: Map<string, string[]>

  // Search state
  searchQuery: string
  searchResults: SearchResult[]
  searchOpen: boolean

  // Graph view
  graphOpen: boolean

  reindex: (pages: Page[]) => void
  setSearchQuery: (q: string, pages: Page[]) => void
  openSearch: () => void
  closeSearch: () => void
  openGraph: () => void
  closeGraph: () => void
}

function buildTagIndex(pages: Page[]): Map<string, string[]> {
  const index = new Map<string, string[]>()
  for (const page of pages) {
    for (const tag of page.tags) {
      const existing = index.get(tag) ?? []
      if (!existing.includes(page.id)) index.set(tag, [...existing, page.id])
    }
  }
  return index
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  backlinks: new Map(),
  tagIndex: new Map(),
  searchQuery: '',
  searchResults: [],
  searchOpen: false,
  graphOpen: false,

  reindex: (pages) => set({
    backlinks: buildBacklinksIndex(pages),
    tagIndex: buildTagIndex(pages),
  }),

  setSearchQuery: (q, pages) => set({
    searchQuery: q,
    searchResults: searchPages(pages, q),
  }),

  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false, searchQuery: '', searchResults: [] }),

  openGraph: () => set({ graphOpen: true }),
  closeGraph: () => set({ graphOpen: false }),
}))
