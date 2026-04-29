import { useRef, useState } from 'react'
import { useVaultStore } from '../../store/vaultStore'
import { CoverPicker } from './CoverPicker'
import { IconPicker } from './IconPicker'

interface Props {
  title: string
  onTitleChange: (val: string) => void
}

export function PageHeader({ title, onTitleChange }: Props) {
  const { activePage, updatePage } = useVaultStore()
  const [coverPickerOpen, setCoverPickerOpen] = useState(false)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [hoverCover, setHoverCover] = useState(false)
  const [hoverTitleArea, setHoverTitleArea] = useState(false)
  const coverBtnRef = useRef<HTMLButtonElement>(null)
  const iconBtnRef = useRef<HTMLButtonElement>(null)

  if (!activePage) return null

  const hasCover = !!activePage.cover

  function openCoverPicker() {
    const rect = coverBtnRef.current?.getBoundingClientRect()
    if (rect) setCoverPickerOpen(true)
  }

  function openIconPicker() {
    const rect = iconBtnRef.current?.getBoundingClientRect()
    if (rect) setIconPickerOpen(true)
  }

  return (
    <div>
      {/* ── Cover area ── */}
      {hasCover ? (
        <div
          className="relative w-full shrink-0"
          style={{ height: 200 }}
          onMouseEnter={() => setHoverCover(true)}
          onMouseLeave={() => setHoverCover(false)}
        >
          <div
            className="absolute inset-0"
            style={{
              background: activePage.cover!.startsWith('#')
                ? activePage.cover!
                : `url(${activePage.cover}) center/cover no-repeat`,
            }}
          />
          {hoverCover && (
            <div className="absolute bottom-3 right-4 flex gap-2">
              <button
                ref={coverBtnRef}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
                style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(4px)', color: '#333' }}
                onClick={openCoverPicker}
              >
                🖼 Change cover
              </button>
            </div>
          )}
          {coverPickerOpen && coverBtnRef.current && (
            <CoverPicker
              anchorRect={coverBtnRef.current.getBoundingClientRect()}
              current={activePage.cover}
              onSelect={cover => updatePage(activePage.id, { cover })}
              onClose={() => setCoverPickerOpen(false)}
            />
          )}
        </div>
      ) : null}

      {/* ── Icon + title area ── */}
      <div
        className="px-16 pb-2"
        style={{ paddingTop: hasCover ? 20 : 80 }}
        onMouseEnter={() => setHoverTitleArea(true)}
        onMouseLeave={() => setHoverTitleArea(false)}
      >
        {/* Action toolbar — shown on hover */}
        {hoverTitleArea && (
          <div className="flex items-center gap-3 mb-2 h-6">
            {!hasCover && (
              <>
                <button
                  ref={coverBtnRef}
                  className="flex items-center gap-1 text-xs transition-opacity"
                  style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                  onClick={openCoverPicker}
                >
                  🖼 Add cover
                </button>
                {coverPickerOpen && coverBtnRef.current && (
                  <CoverPicker
                    anchorRect={coverBtnRef.current.getBoundingClientRect()}
                    current={activePage.cover}
                    onSelect={cover => updatePage(activePage.id, { cover })}
                    onClose={() => setCoverPickerOpen(false)}
                  />
                )}
              </>
            )}
          </div>
        )}
        {!hoverTitleArea && <div className="mb-2 h-6" />}

        {/* Icon */}
        <div className="relative inline-block mb-2">
          <button
            ref={iconBtnRef}
            className="text-5xl leading-none rounded-lg transition-opacity hover:opacity-70"
            title="Change icon"
            onClick={openIconPicker}
          >
            {activePage.icon}
          </button>
          {iconPickerOpen && iconBtnRef.current && (
            <IconPicker
              anchorRect={iconBtnRef.current.getBoundingClientRect()}
              current={activePage.icon}
              onSelect={icon => updatePage(activePage.id, { icon })}
              onClose={() => setIconPickerOpen(false)}
            />
          )}
        </div>

        {/* Title */}
        <input
          key={activePage.id}
          className="w-full text-4xl font-bold border-none outline-none bg-transparent"
          style={{ color: 'var(--color-text)', fontFamily: 'inherit' }}
          value={title}
          placeholder="Untitled"
          onChange={e => onTitleChange(e.target.value)}
        />
      </div>
    </div>
  )
}
