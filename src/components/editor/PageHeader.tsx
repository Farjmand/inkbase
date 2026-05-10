import { useState } from 'react'
import { Popover } from '@mantine/core'
import { useVaultStore } from '@/store/vaultStore'
import { CoverPicker } from './CoverPicker'
import { IconPicker } from './IconPicker'
import type { Page } from '@/types'

interface Props {
  page: Page
  title: string
  onTitleChange: (val: string) => void
}

export function PageHeader({ page, title, onTitleChange }: Readonly<Props>) {
  const { updatePage } = useVaultStore()
  const [coverOpen, setCoverOpen] = useState(false)
  const [iconOpen, setIconOpen] = useState(false)

  const hasCover = !!page.cover

  return (
    <div>
      {/* ── Cover area ── */}
      {hasCover && (
        <div className="group relative w-full shrink-0" style={{ height: 200 }}>
          <div
            className="absolute inset-0"
            style={{
              background: page.cover!.startsWith('#')
                ? page.cover!
                : `url(${page.cover}) center/cover no-repeat`,
            }}
          />
          <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Popover
              opened={coverOpen}
              onClose={() => setCoverOpen(false)}
              position="bottom-end"
              withArrow={false}
            >
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
                <CoverPicker
                  current={page.cover}
                  onSelect={cover => updatePage(page.id, { cover })}
                  onClose={() => setCoverOpen(false)}
                />
              </Popover.Dropdown>
            </Popover>
          </div>
        </div>
      )}

      {/* ── Icon + title area ── */}
      <div className="group px-16 pb-2" style={{ paddingTop: hasCover ? 20 : 80 }}>
        {/* Add cover — shown on hover when no cover */}
        <div className="mb-2 h-6 flex items-center gap-3">
          {!hasCover && (
            <Popover
              opened={coverOpen}
              onClose={() => setCoverOpen(false)}
              position="bottom-start"
              withArrow={false}
            >
              <Popover.Target>
                <button
                  className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-50 hover:opacity-100! transition-opacity"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => setCoverOpen(v => !v)}
                >
                  🖼 Add cover
                </button>
              </Popover.Target>
              <Popover.Dropdown p={0} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <CoverPicker
                  current={page.cover}
                  onSelect={cover => updatePage(page.id, { cover })}
                  onClose={() => setCoverOpen(false)}
                />
              </Popover.Dropdown>
            </Popover>
          )}
        </div>

        {/* Icon */}
        <div className="relative inline-block mb-2">
          <Popover
            opened={iconOpen}
            onClose={() => setIconOpen(false)}
            position="bottom-start"
            withArrow={false}
          >
            <Popover.Target>
              <button
                className="text-5xl leading-none rounded-lg transition-opacity hover:opacity-70"
                title="Change icon"
                onClick={() => setIconOpen(v => !v)}
              >
                {page.icon}
              </button>
            </Popover.Target>
            <Popover.Dropdown p={0} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
              <IconPicker
                current={page.icon}
                onSelect={icon => updatePage(page.id, { icon })}
                onClose={() => setIconOpen(false)}
              />
            </Popover.Dropdown>
          </Popover>
        </div>

        {/* Title */}
        <input
          key={page.id}
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
