import { describe, it, expect } from 'vitest'
import { extractWikilinks, resolveLink } from './links'
import type { Page } from '@/types'

const makePage = (id: string, title: string): Page => ({
  id, title, icon: '📄', cover: null, parentId: null,
  type: 'page', content: '', tags: [], createdAt: '', updatedAt: '',
})

describe('extractWikilinks', () => {
  it('returns empty array for content with no wikilinks', () => {
    expect(extractWikilinks('Hello world')).toEqual([])
  })

  it('extracts a single wikilink', () => {
    expect(extractWikilinks('See [[Philosophy]]')).toEqual(['Philosophy'])
  })

  it('extracts multiple wikilinks', () => {
    expect(extractWikilinks('[[Alpha]] and [[Beta]] are linked')).toEqual(['Alpha', 'Beta'])
  })

  it('deduplicates repeated wikilinks', () => {
    expect(extractWikilinks('[[Foo]] and [[Foo]] again')).toEqual(['Foo'])
  })

  it('trims whitespace inside brackets', () => {
    expect(extractWikilinks('[[ Spaced ]]')).toEqual(['Spaced'])
  })

  it('ignores empty brackets', () => {
    expect(extractWikilinks('[[]]')).toEqual([])
  })

  it('handles wikilinks across multiple lines', () => {
    const content = 'First [[A]]\nSecond [[B]]'
    expect(extractWikilinks(content)).toEqual(['A', 'B'])
  })
})

describe('resolveLink', () => {
  const pages: Page[] = [
    makePage('1', 'Alpha'),
    makePage('2', 'Beta Guide'),
    makePage('3', 'Gamma'),
  ]

  it('returns the page whose title matches (case-insensitive)', () => {
    expect(resolveLink('alpha', pages)?.id).toBe('1')
    expect(resolveLink('ALPHA', pages)?.id).toBe('1')
  })

  it('returns undefined for a link that matches no page', () => {
    expect(resolveLink('Delta', pages)).toBeUndefined()
  })

  it('matches multi-word titles', () => {
    expect(resolveLink('Beta Guide', pages)?.id).toBe('2')
  })
})
