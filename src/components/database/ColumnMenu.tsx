import { useEffect, useRef, useState } from 'react'
import type { PropertyDef, PropertyType } from '../../types'
import { useDatabaseStore } from '../../store/databaseStore'

const TYPE_ICONS: Record<PropertyType, string> = {
  text: 'Aa',
  number: '#',
  select: '◉',
  date: '📅',
  checkbox: '☑',
}

interface Props {
  col: PropertyDef
  databaseId: string
}

export function ColumnHeader({ col, databaseId }: Props) {
  const { updateColumn, deleteColumn } = useDatabaseStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [nameVal, setNameVal] = useState(col.name)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  function commitRename() {
    const trimmed = nameVal.trim()
    if (trimmed && trimmed !== col.name) updateColumn(databaseId, col.id, { name: trimmed })
    else setNameVal(col.name)
    setRenaming(false)
    setMenuOpen(false)
  }

  return (
    <th
      className="group relative text-left"
      style={{
        borderRight: '1px solid var(--color-border)',
        minWidth: col.type === 'checkbox' ? 60 : col.type === 'number' ? 100 : 160,
        maxWidth: col.type === 'checkbox' ? 60 : undefined,
      }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-2 cursor-pointer select-none"
        style={{ color: 'var(--color-text-muted)' }}
        onClick={() => !renaming && setMenuOpen(v => !v)}
      >
        <span className="text-xs font-mono opacity-60">{TYPE_ICONS[col.type]}</span>
        {renaming ? (
          <input
            autoFocus
            className="flex-1 bg-transparent outline-none text-xs font-medium border-b"
            style={{ borderColor: 'var(--color-accent)', color: 'var(--color-text)' }}
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setRenaming(false); setNameVal(col.name) } }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
            {col.name}
          </span>
        )}
      </div>

      {menuOpen && !renaming && (
        <div
          ref={menuRef}
          className="absolute z-50 top-full left-0 mt-1 w-44 rounded-lg shadow-lg border py-1"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
        >
          <button
            className="w-full text-left px-3 py-1.5 text-xs hover:[background:var(--color-hover)] flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
            onClick={() => { setRenaming(true); setMenuOpen(false) }}
          >
            ✏️ Rename
          </button>

          <div className="px-3 pt-2 pb-1">
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Property type</p>
            {(Object.keys(TYPE_ICONS) as PropertyType[]).map(t => (
              <button
                key={t}
                className="w-full text-left px-2 py-1 text-xs rounded flex items-center gap-2 hover:[background:var(--color-hover)]"
                style={{ color: t === col.type ? 'var(--color-accent)' : 'var(--color-text)' }}
                onClick={() => { updateColumn(databaseId, col.id, { type: t }); setMenuOpen(false) }}
              >
                <span className="font-mono w-5">{TYPE_ICONS[t]}</span>
                <span className="capitalize">{t}</span>
                {t === col.type && <span className="ml-auto">✓</span>}
              </button>
            ))}
          </div>

          <div className="border-t mt-1 pt-1" style={{ borderColor: 'var(--color-border)' }}>
            <button
              className="w-full text-left px-3 py-1.5 text-xs hover:[background:var(--color-hover)] flex items-center gap-2 text-red-500"
              onClick={() => { deleteColumn(databaseId, col.id); setMenuOpen(false) }}
            >
              🗑 Delete column
            </button>
          </div>
        </div>
      )}
    </th>
  )
}
