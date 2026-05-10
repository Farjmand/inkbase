import { useEffect, useRef } from 'react'
import { useVaultStore } from '@/store/vaultStore'
import { useKnowledgeStore } from '@/store/knowledgeStore'

export function SearchModal() {
  const flatPages = useVaultStore(s => s.flatPages)
  const setActivePage = useVaultStore(s => s.setActivePage)
  const { searchQuery, searchResults, searchOpen, setSearchQuery, closeSearch } =
    useKnowledgeStore()

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        useKnowledgeStore.getState().openSearch()
      }
      if (e.key === 'Escape') closeSearch()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeSearch])

  if (!searchOpen) return null

  const handleSelect = (pageId: string) => {
    setActivePage(pageId)
    closeSearch()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={closeSearch}
    >
      <div
        className="w-full max-w-xl rounded-xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>🔍</span>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--color-text)' }}
            placeholder="Search pages…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value, flatPages)}
          />
          {searchQuery && (
            <button
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
              onClick={() => setSearchQuery('', flatPages)}
            >
              ✕
            </button>
          )}
        </div>

        <div className="overflow-y-auto max-h-80">
          {searchQuery && searchResults.length === 0 && (
            <p className="text-sm px-4 py-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
              No results for "{searchQuery}"
            </p>
          )}

          {!searchQuery && (
            <p className="text-xs px-4 py-3" style={{ color: 'var(--color-text-muted)' }}>
              Type to search across all pages, tags, and content.
            </p>
          )}

          {searchResults.map(({ page, snippet }) => (
            <button
              key={page.id}
              className="flex flex-col gap-0.5 w-full text-left px-4 py-3 border-b transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              onClick={() => handleSelect(page.id)}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{page.icon}</span>
                <span>{page.title}</span>
                {page.tags.length > 0 && (
                  <div className="flex gap-1 ml-auto">
                    {page.tags.slice(0, 3).map(t => (
                      <span
                        key={t}
                        className="text-xs rounded-full px-2"
                        style={{ background: 'var(--color-hover)', color: 'var(--color-text-muted)' }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {snippet && (
                <span className="text-xs line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>
                  {snippet}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
