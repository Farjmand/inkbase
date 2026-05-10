import { useState } from 'react'

const COLORS = [
  '#f03e3e','#e67700','#f08c00','#2f9e44','#1971c2','#7048e8',
  '#c2255c','#a61e4d','#862e9c','#1864ab','#0c8599','#2b8a3e',
  '#495057','#212529','#868e96','#dee2e6',
  '#fff3bf','#d3f9d8','#d0ebff','#e5dbff',
  '#ffd8a8','#fcc2d7','#c3fae8','#a5d8ff',
]

interface PicsumImage {
  id: string
  author: string
}

type Tab = 'colors' | 'image' | 'gallery'

const TAB_LABELS: Record<Tab, string> = {
  colors: '🎨 Colors',
  image: '🔗 URL',
  gallery: '🖼 Gallery',
}

interface Props {
  current: string | null
  onSelect: (cover: string | null) => void
  onClose: () => void
}

export function CoverPicker({ current, onSelect, onClose }: Readonly<Props>) {
  const [tab, setTab] = useState<Tab>('colors')
  const [imageUrl, setImageUrl] = useState('')
  const [images, setImages] = useState<PicsumImage[]>([])
  const [loading, setLoading] = useState(false)

  async function loadGallery() {
    setLoading(true)
    try {
      // eslint-disable-next-line react-hooks/purity -- called inside an async event handler, not during render
      const page = Math.floor(Math.random() * 20) + 1
      const res = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=12`)
      const data: PicsumImage[] = await res.json()
      setImages(data)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }

  function switchTab(t: Tab) {
    setTab(t)
    if (t === 'gallery' && images.length === 0) void loadGallery()
  }

  return (
    <div className="rounded-xl p-3" style={{ width: 288 }}>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-3 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {(['colors', 'image', 'gallery'] as Tab[]).map(t => (
          <button
            key={t}
            className="px-2 py-1 text-xs rounded capitalize transition-opacity"
            style={{
              color: 'var(--color-text)',
              fontWeight: tab === t ? 600 : 400,
              opacity: tab === t ? 1 : 0.45,
            }}
            onClick={() => switchTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
        {current && (
          <button
            className="ml-auto text-xs opacity-40 hover:opacity-90 transition-opacity"
            style={{ color: 'var(--color-text)' }}
            onClick={() => { onSelect(null); onClose() }}
          >
            Remove
          </button>
        )}
      </div>

      {tab === 'colors' && (
        <div className="grid grid-cols-8 gap-1.5">
          {COLORS.map(c => (
            <button
              key={c}
              title={c}
              className="w-6 h-6 rounded-md transition-transform hover:scale-110"
              style={{
                background: c,
                outline: current === c ? `2px solid ${c}` : 'none',
                outlineOffset: 2,
              }}
              onClick={() => { onSelect(c); onClose() }}
            />
          ))}
        </div>
      )}

      {tab === 'image' && (
        <div className="flex flex-col gap-2">
          {imageUrl && (
            <div className="w-full h-20 rounded-lg overflow-hidden">
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <input
            autoFocus
            type="url"
            placeholder="Paste image URL…"
            className="w-full px-2 py-1.5 text-sm border rounded-lg outline-none"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
          <button
            disabled={!imageUrl}
            className="w-full py-1.5 text-sm font-medium rounded-lg disabled:opacity-40 transition-opacity"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
            onClick={() => { if (imageUrl) { onSelect(imageUrl); onClose() } }}
          >
            Apply
          </button>
        </div>
      )}

      {tab === 'gallery' && (
        <div>
          {loading ? (
            <p className="text-center py-6 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Loading…
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {images.map(img => (
                <button
                  key={img.id}
                  className="aspect-video rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                  style={{
                    outline: current?.includes(`/id/${img.id}/`) ? '2px solid var(--color-accent)' : 'none',
                    outlineOffset: 2,
                  }}
                  title={img.author}
                  onClick={() => { onSelect(`https://picsum.photos/id/${img.id}/1600/400`); onClose() }}
                >
                  <img
                    src={`https://picsum.photos/id/${img.id}/160/90`}
                    alt={img.author}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          <button
            className="mt-2 w-full py-1 text-xs transition-opacity opacity-60 hover:opacity-100"
            style={{ color: 'var(--color-text-muted)' }}
            onClick={() => { setImages([]); void loadGallery() }}
          >
            ↺ Shuffle
          </button>
        </div>
      )}
    </div>
  )
}
