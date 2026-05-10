import { useState } from 'react'
import { Popover } from '@mantine/core'
import { useVaultStore } from '@/store/vaultStore'
import { useInlineEdit } from '@/hooks/useInlineEdit'
import { CoverPicker } from '../editor/CoverPicker'
import { IconPicker } from '../editor/IconPicker'
import { TableView } from './TableView'

export function DatabaseView() {
  const activePage = useVaultStore(s => s.flatPages.find(p => p.id === s.activePageId) ?? null)
  const { updatePage } = useVaultStore()
  const [coverOpen, setCoverOpen] = useState(false)
  const [iconOpen, setIconOpen] = useState(false)

  const titleEdit = useInlineEdit(
    activePage?.title ?? '',
    val => { if (activePage && val.trim()) updatePage(activePage.id, { title: val.trim() }) }
  )

  if (activePage?.type !== 'database') return null

  const db = activePage
  const hasCover = !!db.cover

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="flex-1 overflow-y-auto">
        {/* Cover */}
        {hasCover && (
          <div className="group relative w-full shrink-0" style={{ height: 160 }}>
            <div
              className="absolute inset-0"
              style={{
                background: db.cover?.startsWith('#')
                  ? db.cover
                  : `url(${db.cover}) center/cover no-repeat`,
              }}
            />
            <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Popover opened={coverOpen} onClose={() => setCoverOpen(false)} position="bottom-end" withArrow={false}>
                <Popover.Target>
                  <button
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md"
                    style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(4px)', color: '#333' }}
                    onClick={() => setCoverOpen(v => !v)}
                  >
                    🖼 Change cover
                  </button>
                </Popover.Target>
                <Popover.Dropdown p={0} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
                  <CoverPicker current={db.cover} onSelect={cover => updatePage(db.id, { cover })} onClose={() => setCoverOpen(false)} />
                </Popover.Dropdown>
              </Popover>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="group px-12 pb-4" style={{ paddingTop: hasCover ? 16 : 60 }}>
          {/* Add cover (when no cover) */}
          <div className="mb-2 h-6 flex items-center gap-3">
            {!hasCover && (
              <Popover opened={coverOpen} onClose={() => setCoverOpen(false)} position="bottom-start" withArrow={false}>
                <Popover.Target>
                  <button
                    className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-60 hover:opacity-100! transition-opacity"
                    style={{ color: 'var(--color-text-muted)' }}
                    onClick={() => setCoverOpen(v => !v)}
                  >
                    🖼 Add cover
                  </button>
                </Popover.Target>
                <Popover.Dropdown p={0} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
                  <CoverPicker current={db.cover} onSelect={cover => updatePage(db.id, { cover })} onClose={() => setCoverOpen(false)} />
                </Popover.Dropdown>
              </Popover>
            )}
          </div>

          {/* Icon */}
          <div className="relative inline-block mb-2">
            <Popover opened={iconOpen} onClose={() => setIconOpen(false)} position="bottom-start" withArrow={false}>
              <Popover.Target>
                <button
                  className="text-5xl leading-none rounded-lg hover:opacity-70 transition-opacity"
                  onClick={() => setIconOpen(v => !v)}
                >
                  {db.icon}
                </button>
              </Popover.Target>
              <Popover.Dropdown p={0} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <IconPicker current={db.icon} onSelect={icon => updatePage(db.id, { icon })} onClose={() => setIconOpen(false)} />
              </Popover.Dropdown>
            </Popover>
          </div>

          {/* Title */}
          {titleEdit.editing ? (
            <input
              autoFocus
              className="w-full text-4xl font-bold border-none outline-none bg-transparent block mb-1"
              style={{ color: 'var(--color-text)', fontFamily: 'inherit' }}
              value={titleEdit.draft}
              onChange={e => titleEdit.setDraft(e.target.value)}
              onBlur={titleEdit.commit}
              onKeyDown={e => {
                if (e.key === 'Enter') { titleEdit.commit() }
                else if (e.key === 'Escape') { titleEdit.cancel() }
              }}
            />
          ) : (
            <button
              type="button"
              className="text-4xl font-bold mb-1 text-left w-full bg-transparent border-none outline-none cursor-text p-0"
              style={{ color: 'var(--color-text)', fontFamily: 'inherit' }}
              onClick={() => titleEdit.startEdit(db.title)}
            >
              {db.title}
            </button>
          )}

          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Database · {(db.schema ?? []).length} columns
          </p>
        </div>

        {/* Table */}
        <div className="px-2 pb-16">
          <TableView />
        </div>
      </div>
    </div>
  )
}
