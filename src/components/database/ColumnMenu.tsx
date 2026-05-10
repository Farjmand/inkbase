import { useEffect, useRef, useState } from 'react'
import type { PropertyDef, PropertyType } from '@/types'
import { useVaultStore } from '@/store/vaultStore'
import { useDatabaseStore } from '@/store/databaseStore'
import { useInlineEdit } from '@/hooks/useInlineEdit'

const COL_WIDTH: Partial<Record<PropertyType, number>> = { checkbox: 60, number: 100 }

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

export function ColumnHeader({ col, databaseId }: Readonly<Props>) {
  const { updateColumn, deleteColumn } = useVaultStore()
  const { cleanupColumn } = useDatabaseStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const nameEdit = useInlineEdit(col.name, trimmed => {
    if (trimmed.trim() && trimmed.trim() !== col.name) {
      updateColumn(databaseId, col.id, { name: trimmed.trim() })
    }
  })

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

  async function handleDeleteColumn() {
    setMenuOpen(false)
    // Row cleanup first: if it fails we abort before touching the schema
    try {
      await cleanupColumn(databaseId, col.id)
    } catch {
      return
    }
    await deleteColumn(databaseId, col.id)
  }

  return (
    <th
      className="group relative text-left"
      style={{
        borderRight: '1px solid var(--color-border)',
        minWidth: COL_WIDTH[col.type] ?? 160,
        maxWidth: col.type === 'checkbox' ? 60 : undefined,
      }}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 px-3 py-2 w-full cursor-pointer select-none"
        style={{ color: 'var(--color-text-muted)', background: 'transparent', border: 'none' }}
        onClick={() => !nameEdit.editing && setMenuOpen(v => !v)}
      >
        <span className="text-xs font-mono opacity-60">{TYPE_ICONS[col.type]}</span>
        {nameEdit.editing ? (
          <input
            autoFocus
            className="flex-1 bg-transparent outline-none text-xs font-medium border-b"
            style={{ borderColor: 'var(--color-accent)', color: 'var(--color-text)' }}
            value={nameEdit.draft}
            onChange={e => nameEdit.setDraft(e.target.value)}
            onBlur={nameEdit.commit}
            onKeyDown={e => {
              if (e.key === 'Enter') { nameEdit.commit() }
              else if (e.key === 'Escape') { nameEdit.cancel() }
            }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
            {col.name}
          </span>
        )}
      </button>

      {menuOpen && !nameEdit.editing && (
        <div
          ref={menuRef}
          className="absolute z-50 top-full left-0 mt-1 w-44 rounded-lg shadow-lg border py-1"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
        >
          <button
            type="button"
            className="w-full text-left px-3 py-1.5 text-xs hover:[background:var(--color-hover)] flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}
            onClick={() => { nameEdit.startEdit(col.name); setMenuOpen(false) }}
          >
            ✏️ Rename
          </button>

          <div className="px-3 pt-2 pb-1">
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Property type</p>
            {(Object.keys(TYPE_ICONS) as PropertyType[]).map(t => (
              <button
                key={t}
                type="button"
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
              type="button"
              className="w-full text-left px-3 py-1.5 text-xs hover:[background:var(--color-hover)] flex items-center gap-2 text-red-500"
              onClick={handleDeleteColumn}
            >
              🗑 Delete column
            </button>
          </div>
        </div>
      )}
    </th>
  )
}
