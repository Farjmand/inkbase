import { useVaultStore } from '@/store/vaultStore'
import { useKnowledgeStore } from '@/store/knowledgeStore'

export function BacklinksPanel({ pageId }: Readonly<{ pageId: string }>) {
  const flatPages = useVaultStore(s => s.flatPages)
  const setActivePage = useVaultStore(s => s.setActivePage)
  const backlinks = useKnowledgeStore(s => s.backlinks)

  const sourceIds = backlinks.get(pageId) ?? []
  if (sourceIds.length === 0) return null

  const sourcePages = sourceIds
    .map(id => flatPages.find(p => p.id === id))
    .filter(Boolean) as typeof flatPages

  return (
    <div
      className="border-t mx-12 mt-4 pb-12"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider mt-4 mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {sourcePages.length} backlink{sourcePages.length !== 1 ? 's' : ''}
      </p>
      <div className="flex flex-col gap-1">
        {sourcePages.map(page => (
          <button
            key={page.id}
            className="flex items-center gap-2 text-sm text-left rounded-md px-2 py-1.5 transition-colors w-full"
            style={{ color: 'var(--color-text)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={() => setActivePage(page.id)}
          >
            <span>{page.icon}</span>
            <span>{page.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
