import { useEffect, useRef, useState } from 'react'
import type { PropertyType } from '@/types'
import { useVaultStore } from '@/store/vaultStore'

const TYPES: { type: PropertyType; label: string; icon: string; desc: string }[] = [
  { type: 'text',     label: 'Text',     icon: 'Aa', desc: 'Plain text'          },
  { type: 'number',   label: 'Number',   icon: '#',  desc: 'Integer or decimal'  },
  { type: 'select',   label: 'Select',   icon: '◉',  desc: 'One option from list'},
  { type: 'date',     label: 'Date',     icon: '📅', desc: 'Calendar date'       },
  { type: 'checkbox', label: 'Checkbox', icon: '☑',  desc: 'True / false'        },
]

interface Props {
  databaseId: string
  onClose: () => void
}

export function AddColumnModal({ databaseId, onClose }: Props) {
  const { addColumn } = useVaultStore()
  const [name, setName] = useState('Untitled')
  const [type, setType] = useState<PropertyType>('text')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.select()
  }, [])

  async function handleCreate() {
    const trimmed = name.trim() || 'Untitled'
    await addColumn(databaseId, trimmed, type)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-80 rounded-xl shadow-2xl border overflow-hidden"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
      >
        <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>New column</p>
          <input
            ref={inputRef}
            className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
            style={{
              background: 'var(--color-hover)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
            value={name}
            placeholder="Column name"
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
          />
        </div>

        <div className="p-2">
          {TYPES.map(t => (
            <button
              key={t.type}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
              style={{
                background: type === t.type ? 'var(--color-border)' : 'transparent',
                color: 'var(--color-text)',
              }}
              onMouseEnter={e => { if (type !== t.type) e.currentTarget.style.background = 'var(--color-hover)' }}
              onMouseLeave={e => { if (type !== t.type) e.currentTarget.style.background = 'transparent' }}
              onClick={() => setType(t.type)}
            >
              <span
                className="w-7 h-7 flex items-center justify-center rounded-md text-sm font-mono shrink-0"
                style={{ background: 'var(--color-sidebar)', color: 'var(--color-text-muted)' }}
              >
                {t.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.desc}</p>
              </div>
              {type === t.type && <span className="ml-auto text-blue-500 text-sm">✓</span>}
            </button>
          ))}
        </div>

        <div className="px-4 pb-4 flex gap-2 justify-end">
          <button
            className="px-3 py-1.5 text-sm rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1.5 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-accent)' }}
            onClick={handleCreate}
          >
            Add column
          </button>
        </div>
      </div>
    </div>
  )
}
