import { useState } from 'react'

function expandIcon(hasChildren: boolean, expanded: boolean) {
  if (!hasChildren) return ''
  return expanded ? '▾' : '▸'
}
import { useVaultStore } from '@/store/vaultStore'
import { useInlineEdit } from '@/hooks/useInlineEdit'
import type { PageNode } from '@/types'

interface Props {
  readonly page: PageNode
  readonly depth?: number
}

export function SidebarItem({ page, depth = 0 }: Props) {
  const { activePageId, setActivePage, createPage, deletePage, updatePage } = useVaultStore()
  const [expanded, setExpanded] = useState(true)
  const isActive = activePageId === page.id
  const hasChildren = page.children.length > 0

  const nameEdit = useInlineEdit(page.title, val => {
    const trimmed = val.trim()
    if (trimmed && trimmed !== page.title) updatePage(page.id, { title: trimmed })
  })

  const coverDot = page.cover?.startsWith('#')
    ? <span className="w-2 h-2 rounded-sm shrink-0 ml-0.5" style={{ background: page.cover }} />
    : null

  return (
    <div>
      <div
        className="group flex items-center gap-1 px-2 py-0.75 rounded-md text-sm select-none hover:[background:var(--color-hover)]"
        style={{
          paddingLeft: `${8 + depth * 16}px`,
          background: isActive ? 'var(--color-border)' : undefined,
          color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
        }}
      >
        {/* Expand toggle */}
        <button
          className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-60 hover:opacity-100! text-xs shrink-0"
          onClick={() => setExpanded(v => !v)}
        >
          {expandIcon(hasChildren, expanded)}
        </button>

        {/* Icon */}
        <span className="text-sm shrink-0">{page.icon}</span>

        {/* Cover dot */}
        {coverDot}

        {/* Title */}
        {nameEdit.editing ? (
          <input
            autoFocus
            className="flex-1 bg-transparent outline-none border-b text-sm min-w-0"
            style={{ borderColor: 'var(--color-accent)', color: 'var(--color-text)' }}
            value={nameEdit.draft}
            onChange={e => nameEdit.setDraft(e.target.value)}
            onBlur={nameEdit.commit}
            onKeyDown={e => {
              if (e.key === 'Enter') { nameEdit.commit() }
              else if (e.key === 'Escape') { nameEdit.cancel() }
            }}
          />
        ) : (
          <button
            className="flex-1 text-left truncate min-w-0 cursor-pointer"
            onClick={() => setActivePage(page.id)}
            onDoubleClick={() => nameEdit.startEdit(page.title)}
          >
            {page.title || 'Untitled'}
          </button>
        )}

        {/* Actions */}
        {!nameEdit.editing && (
          <span className="hidden group-hover:flex gap-1 ml-1 shrink-0">
            <button
              title="Add sub-page"
              className="opacity-50 hover:opacity-100 text-xs px-1"
              onClick={() => createPage(page.id)}
            >＋</button>
            <button
              title="Delete"
              className="opacity-50 hover:opacity-100 text-xs px-1 hover:text-red-500"
              onClick={() => deletePage(page.id)}
            >✕</button>
          </span>
        )}
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {page.children.map(child => (
            <SidebarItem key={child.id} page={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
