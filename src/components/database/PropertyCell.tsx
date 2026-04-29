import { useRef, useState } from 'react'
import type { PropertyDef, DatabaseRow } from '../../types'
import { useDatabaseStore } from '../../store/databaseStore'

interface Props {
  row: DatabaseRow
  col: PropertyDef
  databaseId: string
}

export function PropertyCell({ row, col, databaseId }: Props) {
  const { updateCell, updateColumn } = useDatabaseStore()
  const value = row.properties[col.id] ?? null

  const save = (val: string | number | boolean | null) =>
    updateCell(row.id, databaseId, col.id, val)

  switch (col.type) {
    case 'text':
      return <TextCell value={value as string | null} onSave={save} />
    case 'number':
      return <NumberCell value={value as number | null} onSave={save} />
    case 'checkbox':
      return <CheckboxCell value={value as boolean | null} onSave={save} />
    case 'date':
      return <DateCell value={value as string | null} onSave={save} />
    case 'select':
      return (
        <SelectCell
          value={value as string | null}
          options={col.options ?? []}
          onSave={save}
          onAddOption={opt =>
            updateColumn(databaseId, col.id, {
              options: [...(col.options ?? []), opt],
            })
          }
        />
      )
    default:
      return null
  }
}

// ─── Text ────────────────────────────────────────────────────────────────────

function TextCell({
  value,
  onSave,
}: {
  value: string | null
  onSave: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')

  if (!editing)
    return (
      <div
        className="cell-idle px-2 py-1.5 min-h-[32px] cursor-text truncate text-sm"
        style={{ color: value ? 'var(--color-text)' : 'var(--color-text-muted)' }}
        onClick={() => { setDraft(value ?? ''); setEditing(true) }}
      >
        {value || ''}
      </div>
    )

  return (
    <input
      autoFocus
      className="w-full px-2 py-1.5 text-sm bg-transparent outline-none border border-blue-400 rounded"
      style={{ color: 'var(--color-text)' }}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={() => { setEditing(false); onSave(draft) }}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') { setEditing(false); onSave(draft) } }}
    />
  )
}

// ─── Number ──────────────────────────────────────────────────────────────────

function NumberCell({
  value,
  onSave,
}: {
  value: number | null
  onSave: (v: number | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value !== null ? String(value) : '')

  if (!editing)
    return (
      <div
        className="cell-idle px-2 py-1.5 min-h-[32px] cursor-text text-sm text-right tabular-nums"
        style={{ color: value !== null ? 'var(--color-text)' : 'var(--color-text-muted)' }}
        onClick={() => { setDraft(value !== null ? String(value) : ''); setEditing(true) }}
      >
        {value !== null ? value : ''}
      </div>
    )

  return (
    <input
      autoFocus
      type="number"
      className="w-full px-2 py-1.5 text-sm bg-transparent outline-none border border-blue-400 rounded text-right tabular-nums"
      style={{ color: 'var(--color-text)' }}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={() => {
        setEditing(false)
        const num = draft === '' ? null : parseFloat(draft)
        onSave(isNaN(num as number) ? null : num)
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === 'Escape') {
          setEditing(false)
          const num = draft === '' ? null : parseFloat(draft)
          onSave(isNaN(num as number) ? null : num)
        }
      }}
    />
  )
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function CheckboxCell({
  value,
  onSave,
}: {
  value: boolean | null
  onSave: (v: boolean) => void
}) {
  const checked = value === true
  return (
    <div className="flex items-center justify-center min-h-[32px]">
      <input
        type="checkbox"
        checked={checked}
        className="w-4 h-4 cursor-pointer accent-blue-500"
        onChange={e => onSave(e.target.checked)}
      />
    </div>
  )
}

// ─── Date ────────────────────────────────────────────────────────────────────

function DateCell({
  value,
  onSave,
}: {
  value: string | null
  onSave: (v: string | null) => void
}) {
  const [editing, setEditing] = useState(false)

  if (!editing)
    return (
      <div
        className="cell-idle px-2 py-1.5 min-h-[32px] cursor-pointer text-sm"
        style={{ color: value ? 'var(--color-text)' : 'var(--color-text-muted)' }}
        onClick={() => setEditing(true)}
      >
        {value ? new Date(value).toLocaleDateString() : ''}
      </div>
    )

  return (
    <input
      autoFocus
      type="date"
      className="w-full px-2 py-1.5 text-sm bg-transparent outline-none border border-blue-400 rounded"
      style={{ color: 'var(--color-text)', colorScheme: 'light dark' }}
      value={value ?? ''}
      onChange={e => { onSave(e.target.value || null); setEditing(false) }}
      onBlur={() => setEditing(false)}
    />
  )
}

// ─── Select ──────────────────────────────────────────────────────────────────

function SelectCell({
  value,
  options,
  onSave,
  onAddOption,
}: {
  value: string | null
  options: string[]
  onSave: (v: string | null) => void
  onAddOption: (opt: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const filteredOpts = options.filter(o => o.toLowerCase().includes(draft.toLowerCase()))

  function choose(opt: string) {
    onSave(opt)
    setOpen(false)
    setDraft('')
  }

  function handleCreateNew() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onAddOption(trimmed)
    onSave(trimmed)
    setOpen(false)
    setDraft('')
  }

  return (
    <div className="relative" ref={ref}>
      <div
        className="cell-idle px-2 py-1.5 min-h-[32px] cursor-pointer text-sm flex items-center gap-1"
        onClick={() => setOpen(v => !v)}
      >
        {value ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--color-accent)', color: '#fff' }}>
            {value}
          </span>
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>—</span>
        )}
      </div>

      {open && (
        <div
          className="absolute z-50 top-full left-0 mt-1 w-48 rounded-lg shadow-lg border overflow-hidden"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
        >
          <div className="p-1.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <input
              autoFocus
              className="w-full px-2 py-1 text-xs rounded bg-transparent outline-none"
              style={{ color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              placeholder="Search or create…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateNew() }}
            />
          </div>
          <div className="py-1 max-h-40 overflow-y-auto">
            {value && (
              <button
                className="w-full text-left px-3 py-1.5 text-xs hover:[background:var(--color-hover)]"
                style={{ color: 'var(--color-text-muted)' }}
                onClick={() => { onSave(null); setOpen(false) }}
              >
                ✕ Clear
              </button>
            )}
            {filteredOpts.map(opt => (
              <button
                key={opt}
                className="w-full text-left px-3 py-1.5 text-xs hover:[background:var(--color-hover)]"
                style={{ color: 'var(--color-text)' }}
                onClick={() => choose(opt)}
              >
                {opt}
              </button>
            ))}
            {draft.trim() && !options.includes(draft.trim()) && (
              <button
                className="w-full text-left px-3 py-1.5 text-xs hover:[background:var(--color-hover)]"
                style={{ color: 'var(--color-accent)' }}
                onClick={handleCreateNew}
              >
                + Create "{draft.trim()}"
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
