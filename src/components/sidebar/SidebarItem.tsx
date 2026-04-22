import React, { useState } from 'react'
import { useVaultStore } from '../../store/vaultStore'
import type { Page } from '../../types'

interface Props {
  page: Page
  depth?: number
}

export function SidebarItem({ page, depth = 0 }: Props) {
  const { activePageId, setActivePage, createPage, deletePage } = useVaultStore()
  const [expanded, setExpanded] = useState(true)
  const [hovered, setHovered] = useState(false)
  const isActive = activePageId === page.id
  const hasChildren = (page.children?.length ?? 0) > 0

  return (
    <div>
      <div
        className={`group flex items-center gap-1 px-2 py-[3px] rounded-md cursor-pointer text-sm select-none
          ${isActive ? 'bg-[#e5e5e3] text-[#1a1a1a]' : 'text-[#5a5a5a] hover:bg-[#efefed]'}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setActivePage(page.id)}
      >
        {/* Expand toggle */}
        <button
          className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-60 hover:!opacity-100 text-xs shrink-0"
          onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
        >
          {hasChildren ? (expanded ? '▾' : '▸') : ''}
        </button>

        {/* Icon */}
        <span className="text-sm shrink-0">{page.icon}</span>

        {/* Title */}
        <span className="truncate flex-1">{page.title || 'Untitled'}</span>

        {/* Actions */}
        {hovered && (
          <span className="flex gap-1 ml-1 shrink-0">
            <button
              title="Add sub-page"
              className="opacity-50 hover:opacity-100 text-xs px-1"
              onClick={e => { e.stopPropagation(); createPage(page.id) }}
            >＋</button>
            <button
              title="Delete"
              className="opacity-50 hover:opacity-100 text-xs px-1 hover:text-red-500"
              onClick={e => { e.stopPropagation(); deletePage(page.id) }}
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
