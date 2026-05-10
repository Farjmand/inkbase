import { useState } from 'react'
import { EMOJI_CATEGORIES } from '@/data/emojis'

interface Props {
  current: string
  onSelect: (icon: string) => void
  onClose: () => void
}

export function IconPicker({ current, onSelect, onClose }: Readonly<Props>) {
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].name)
  const category = EMOJI_CATEGORIES.find(c => c.name === activeCategory) ?? EMOJI_CATEGORIES[0]

  return (
    <div className="flex flex-col" style={{ width: 280, maxHeight: 320 }}>
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
              className="text-xl flex items-center justify-center h-8 w-8 rounded transition-colors hover:[background:var(--color-hover)]"
              style={{ background: current === emoji ? 'var(--color-border)' : 'transparent' }}
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
          className="text-xs opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-text-muted)' }}
          onClick={() => { onSelect('📄'); onClose() }}
        >
          Reset to default
        </button>
      </div>
    </div>
  )
}
