import { useEffect, useRef, useState } from 'react'
import { EMOJI_CATEGORIES } from '../../data/emojis'

interface Props {
  anchorRect: DOMRect
  current: string
  onSelect: (icon: string) => void
  onClose: () => void
}

export function IconPicker({ anchorRect, current, onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].name)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [onClose])

  const top = anchorRect.bottom + 8
  const left = Math.min(anchorRect.left, window.innerWidth - 284)
  const category = EMOJI_CATEGORIES.find(c => c.name === activeCategory) ?? EMOJI_CATEGORIES[0]

  return (
    <div
      ref={ref}
      className="rounded-xl shadow-2xl border flex flex-col"
      style={{
        position: 'fixed',
        top,
        left,
        width: 280,
        maxHeight: 320,
        zIndex: 1000,
        background: 'var(--color-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Category tabs */}
      <div
        className="flex overflow-x-auto px-2 pt-2 gap-1 shrink-0"
        style={{ scrollbarWidth: 'none' }}
      >
        {EMOJI_CATEGORIES.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className="text-xs px-2 py-0.5 rounded-full shrink-0 transition-colors"
            style={{
              background: activeCategory === cat.name ? 'var(--color-border)' : 'transparent',
              color: 'var(--color-text)',
              opacity: activeCategory === cat.name ? 1 : 0.5,
              fontWeight: activeCategory === cat.name ? 600 : 400,
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-0.5">
          {category.emojis.map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              className="text-xl flex items-center justify-center h-8 w-8 rounded transition-colors"
              style={{
                background: current === emoji ? 'var(--color-border)' : 'transparent',
              }}
              onMouseEnter={e => {
                if (current !== emoji) e.currentTarget.style.background = 'var(--color-hover)'
              }}
              onMouseLeave={e => {
                if (current !== emoji) e.currentTarget.style.background = 'transparent'
              }}
              onClick={() => { onSelect(emoji); onClose() }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-3 py-1.5 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <button
          className="text-xs transition-opacity"
          style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
          onClick={() => { onSelect('📄'); onClose() }}
        >
          Reset to default
        </button>
      </div>
    </div>
  )
}
