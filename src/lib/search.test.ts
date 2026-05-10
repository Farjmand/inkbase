import { describe, it, expect } from 'vitest'
import { searchPages } from './search'
import type { Page } from '@/types'

const makePage = (id: string, title: string, content: string, tags: string[] = []): Page => ({
  id, title, icon: '📄', cover: null, parentId: null,
  type: 'page', content, tags, sortOrder: 0, createdAt: '', updatedAt: '',
})

const pages: Page[] = [
  makePage('1', 'React Hooks', 'useState and useEffect are core hooks', ['react']),
  makePage('2', 'TypeScript Tips', 'Use strict mode always', ['typescript', 'tips']),
  makePage('3', 'Zustand Guide', 'State management with zustand', ['react']),
  makePage('4', 'Empty Page', '', []),
]

describe('searchPages', () => {
  it('returns empty array for empty query', () => {
    expect(searchPages(pages, '')).toEqual([])
  })

  it('matches by title (case-insensitive)', () => {
    const results = searchPages(pages, 'react')
    expect(results.map(r => r.page.id)).toContain('1')
  })

  it('matches by content', () => {
    const results = searchPages(pages, 'zustand')
    expect(results.map(r => r.page.id)).toContain('3')
  })

  it('matches by tag', () => {
    const results = searchPages(pages, 'typescript')
    expect(results.map(r => r.page.id)).toContain('2')
  })

  it('returns no results when nothing matches', () => {
    expect(searchPages(pages, 'graphql')).toEqual([])
  })

  it('ranks title matches above content matches', () => {
    // 'hooks' appears in title of page 1 and content of page 1
    // Add a page where 'hooks' only appears in content
    const extra = makePage('5', 'Guide', 'about hooks usage')
    const results = searchPages([...pages, extra], 'hooks')
    const ids = results.map(r => r.page.id)
    expect(ids.indexOf('1')).toBeLessThan(ids.indexOf('5'))
  })

  it('returns matched excerpt snippet', () => {
    const results = searchPages(pages, 'strict mode')
    expect(results[0].snippet).toContain('strict mode')
  })
})
