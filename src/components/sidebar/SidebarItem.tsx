import { useRef, useState } from 'react'
import { useVaultStore } from '../../store/vaultStore'
import type { Page } from '../../types'

interface Props {
  readonly page: Page
  readonly depth?: number
}

export function SidebarItem({ page, depth = 0 }: Props) {
  const { activePageId, setActivePage, createPage, deletePage, updatePage } = useVaultStore()
  const [expanded, setExpanded] = useState(true)
  const [renaming, setRenaming] = useState(false)
  const [renameVal, setRenameVal] = useState(page.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const isActive = activePageId === page.id
  const hasChildren = (page.children?.length ?? 0) > 0

  function startRename() {
    setRenameVal(page.title)
    setRenaming(true)
    setTimeout(() => { inputRef.current?.select() }, 0)
  }

  function commitRename() {
    setRenaming(false)
    const val = renameVal.trim()
    if (val && val !== page.title) updatePage(page.id, { title: val })
    else setRenameVal(page.title)
  }

  function onRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitRename()
    if (e.key === 'Escape') { setRenaming(false); setRenameVal(page.title) }
  }

  const coverDot = page.cover?.startsWith('#')
    ? <span className="w-2 h-2 rounded-sm shrink-0 ml-0.5" style={{ background: page.cover }} />
    : null

  const expandArrow = expanded ? '▾' : '▸'
  const expandIcon = hasChildren ? expandArrow : ''

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
          {expandIcon}
        </button>

        {/* Icon */}
        <span className="text-sm shrink-0">{page.icon}</span>

        {/* Cover dot */}
        {coverDot}

        {/* Title — button when idle, input when renaming */}
        {renaming ? (
          <input
            ref={inputRef}
            autoFocus
            className="flex-1 bg-transparent outline-none border-b text-sm min-w-0"
            style={{ borderColor: 'var(--color-accent)', color: 'var(--color-text)' }}
            value={renameVal}
            onChange={e => setRenameVal(e.target.value)}
            onBlur={commitRename}
            onKeyDown={onRenameKeyDown}
          />
        ) : (
          <button
            className="flex-1 text-left truncate min-w-0 cursor-pointer"
            onClick={() => setActivePage(page.id)}
            onDoubleClick={startRename}
          >
            {page.title || 'Untitled'}
          </button>
        )}

        {/* Actions — visible on group hover */}
        {!renaming && (
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
          {page.children!.map(child => (
            <SidebarItem key={child.id} page={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
