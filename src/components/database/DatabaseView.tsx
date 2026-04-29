import { useRef, useState } from 'react'
import { useVaultStore } from '../../store/vaultStore'
import { CoverPicker } from '../editor/CoverPicker'
import { IconPicker } from '../editor/IconPicker'
import { TableView } from './TableView'

export function DatabaseView() {
  const { activePage, updatePage } = useVaultStore()
  const [coverPickerOpen, setCoverPickerOpen] = useState(false)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [hoverCover, setHoverCover] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const coverBtnRef = useRef<HTMLButtonElement>(null)
  const iconBtnRef = useRef<HTMLButtonElement>(null)

  if (activePage?.type !== 'database') return null

  // `db` is narrowed: non-null, type === 'database'
  const db = activePage
  const hasCover = !!db.cover

  function commitTitle() {
    setEditingTitle(false)
    const val = titleDraft.trim()
    if (val && val !== db.title) updatePage(db.id, { title: val })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="flex-1 overflow-y-auto">
        {/* Cover */}
        {hasCover && (
          <div
            className="relative w-full shrink-0"
            style={{ height: 160 }}
            onMouseEnter={() => setHoverCover(true)}
            onMouseLeave={() => setHoverCover(false)}
            role="img"
            aria-label="Page cover"
          >
            <div
              className="absolute inset-0"
              style={{
                background: db.cover?.startsWith('#')
                  ? db.cover
                  : `url(${db.cover}) center/cover no-repeat`,
              }}
            />
            {hoverCover && (
              <div className="absolute bottom-3 right-4">
                <button
                  ref={coverBtnRef}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md"
                  style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(4px)', color: '#333' }}
                  onClick={() => setCoverPickerOpen(true)}
                >
                  🖼 Change cover
                </button>
              </div>
            )}
            {coverPickerOpen && coverBtnRef.current && (
              <CoverPicker
                anchorRect={coverBtnRef.current.getBoundingClientRect()}
                current={db.cover}
                onSelect={cover => updatePage(db.id, { cover })}
                onClose={() => setCoverPickerOpen(false)}
              />
            )}
          </div>
        )}

        {/* Header: icon + title + meta */}
        <div className="px-12 pb-4" style={{ paddingTop: hasCover ? 16 : 60 }}>
          {/* Add cover link (only when no cover) */}
          {!hasCover && (
            <div className="mb-2 h-6 flex items-center gap-3">
              <button
                ref={coverBtnRef}
                className="flex items-center gap-1 text-xs transition-opacity opacity-0 hover:opacity-100 focus:opacity-100"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                onClick={() => setCoverPickerOpen(true)}
              >
                🖼 Add cover
              </button>
              {coverPickerOpen && coverBtnRef.current && (
                <CoverPicker
                  anchorRect={coverBtnRef.current.getBoundingClientRect()}
                  current={db.cover}
                  onSelect={cover => updatePage(db.id, { cover })}
                  onClose={() => setCoverPickerOpen(false)}
                />
              )}
            </div>
          )}
          {hasCover && <div className="mb-2 h-6" />}

          {/* Icon */}
          <div className="relative inline-block mb-2">
            <button
              ref={iconBtnRef}
              className="text-5xl leading-none rounded-lg hover:opacity-70 transition-opacity"
              onClick={() => setIconPickerOpen(true)}
            >
              {db.icon}
            </button>
            {iconPickerOpen && iconBtnRef.current && (
              <IconPicker
                anchorRect={iconBtnRef.current.getBoundingClientRect()}
                current={db.icon}
                onSelect={icon => updatePage(db.id, { icon })}
                onClose={() => setIconPickerOpen(false)}
              />
            )}
          </div>

          {/* Title */}
          {editingTitle ? (
            <input
              autoFocus
              className="w-full text-4xl font-bold border-none outline-none bg-transparent block mb-1"
              style={{ color: 'var(--color-text)', fontFamily: 'inherit' }}
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={e => { if (e.key === 'Enter') commitTitle() }}
            />
          ) : (
            <button
              type="button"
              className="text-4xl font-bold mb-1 text-left w-full bg-transparent border-none outline-none cursor-text p-0"
              style={{ color: 'var(--color-text)', fontFamily: 'inherit' }}
              onClick={() => { setTitleDraft(db.title); setEditingTitle(true) }}
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
