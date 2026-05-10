import { useRef, useState } from 'react'
import { useVaultStore } from '@/store/vaultStore'
import { useInlineEdit } from '@/hooks/useInlineEdit'
import type { PageNode } from '@/types'

function expandIcon(hasChildren: boolean, expanded: boolean) {
  if (!hasChildren) return ''
  return expanded ? '▾' : '▸'
}

type DropPosition = 'before' | 'after' | null

interface Props {
  readonly page: PageNode
  readonly depth?: number
}

export function SidebarItem({ page, depth = 0 }: Props) {
  const { activePageId, setActivePage, createPage, deletePage, updatePage, reorderPage, flatPages } =
    useVaultStore()
  const [expanded, setExpanded] = useState(true)
  const [dropPos, setDropPos] = useState<DropPosition>(null)
  const isActive = activePageId === page.id
  const hasChildren = page.children.length > 0
  const rowRef = useRef<HTMLLIElement>(null)

  const nameEdit = useInlineEdit(page.title, val => {
    const trimmed = val.trim()
    if (trimmed && trimmed !== page.title) updatePage(page.id, { title: trimmed })
  })

  const coverDot = page.cover?.startsWith('#')
    ? <span className="w-2 h-2 rounded-sm shrink-0 ml-0.5" style={{ background: page.cover }} />
    : null

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/plain', page.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function resolveDropPosition(e: React.DragEvent): DropPosition {
    if (!rowRef.current) return null
    const rect = rowRef.current.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    return e.clientY < midY ? 'before' : 'after'
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropPos(resolveDropPosition(e))
  }

  function handleDragLeave() {
    setDropPos(null)
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDropPos(null)
    const draggedId = e.dataTransfer.getData('text/plain')
    if (!draggedId || draggedId === page.id) return

    const dragged = flatPages.find(p => p.id === draggedId)
    if (dragged?.parentId !== page.parentId) return // cross-parent drops not supported

    const pos = resolveDropPosition(e)
    const siblings = flatPages
      .filter(p => p.parentId === page.parentId && p.id !== draggedId)
      .toSorted((a, b) => a.sortOrder - b.sortOrder)
    const targetIdx = siblings.findIndex(p => p.id === page.id)
    const predecessorId = siblings[targetIdx - 1]?.id ?? null
    const afterId = pos === 'after' ? page.id : predecessorId
    await reorderPage(draggedId, afterId)
  }

  const dropIndicatorStyle = {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    height: 2,
    background: 'var(--color-accent, #6366f1)',
    borderRadius: 1,
    pointerEvents: 'none' as const,
    zIndex: 10,
  }

  return (
    <div>
      <li
        ref={rowRef}
        draggable
        className="group relative flex items-center gap-1 px-2 py-0.75 rounded-md text-sm select-none hover:[background:var(--color-hover)]"
        style={{
          paddingLeft: `${8 + depth * 16}px`,
          background: isActive ? 'var(--color-border)' : undefined,
          color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
          cursor: nameEdit.editing ? 'text' : 'grab',
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {dropPos === 'before' && <div style={{ ...dropIndicatorStyle, top: 0 }} />}
        {dropPos === 'after' && <div style={{ ...dropIndicatorStyle, bottom: 0 }} />}

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
      </li>

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
