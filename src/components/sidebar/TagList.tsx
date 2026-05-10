import { useState } from 'react'
import { useVaultStore } from '@/store/vaultStore'
import { useKnowledgeStore } from '@/store/knowledgeStore'

export function TagList() {
  const flatPages = useVaultStore(s => s.flatPages)
  const tagIndex = useKnowledgeStore(s => s.tagIndex)
  const setActivePage = useVaultStore(s => s.setActivePage)
  const [expanded, setExpanded] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  if (tagIndex.size === 0) return null

  const tags = Array.from(tagIndex.keys()).sort()

  const taggedPageIds = activeTag ? (tagIndex.get(activeTag) ?? []) : []
  const taggedPages = taggedPageIds
    .map(id => flatPages.find(p => p.id === id))
    .filter(Boolean) as typeof flatPages

  return (
    <div className="border-t pt-2" style={{ borderColor: 'var(--color-border)' }}>
      <button
        className="flex items-center gap-1 px-3 py-1 w-full text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--color-text-muted)' }}
        onClick={() => setExpanded(e => !e)}
      >
        <span>{expanded ? '▾' : '▸'}</span>
        <span>Tags</span>
      </button>

      {expanded && (
        <div className="px-2 pb-2">
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map(tag => (
              <button
                key={tag}
                className="text-xs rounded-full px-2 py-0.5 transition-colors"
                style={{
                  background: activeTag === tag ? 'var(--color-accent, #6366f1)' : 'var(--color-hover)',
                  color: activeTag === tag ? '#fff' : 'var(--color-text)',
                }}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                #{tag}
              </button>
            ))}
          </div>

          {activeTag && taggedPages.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {taggedPages.map(page => (
                <button
                  key={page.id}
                  className="flex items-center gap-2 text-sm text-left rounded-md px-2 py-1 w-full"
                  style={{ color: 'var(--color-text)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => setActivePage(page.id)}
                >
                  <span>{page.icon}</span>
                  <span className="truncate">{page.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
