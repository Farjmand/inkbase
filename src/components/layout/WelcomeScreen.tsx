import { useState } from 'react'
import { useVaultStore } from '../../store/vaultStore'

export function WelcomeScreen() {
  const { openVault } = useVaultStore()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function renderError() {
    if (!error) return null
    if (error === 'shields') {
      return (
        <div className="mt-4 text-left rounded-xl px-4 py-3 text-xs" style={{ background: 'var(--color-sidebar)', border: '1px solid var(--color-border)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            🦁 Brave Shields is blocking file access
          </p>
          <p className="mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Disable Shields for localhost to allow inkbase to read your local files:
          </p>
          <ol className="list-decimal list-inside space-y-1" style={{ color: 'var(--color-text-muted)' }}>
            <li>Click the <strong style={{ color: 'var(--color-text)' }}>🦁 Shields icon</strong> in the address bar</li>
            <li>Toggle <strong style={{ color: 'var(--color-text)' }}>Shields</strong> to <strong style={{ color: 'var(--color-text)' }}>OFF</strong></li>
            <li>Refresh the page and try again</li>
          </ol>
        </div>
      )
    }
    return (
      <p className="text-xs mt-3 px-3 py-2 rounded-lg text-red-500" style={{ background: 'rgba(239,68,68,0.08)' }}>
        {error}
      </p>
    )
  }

  async function handleOpen() {
    setError(null)
    setLoading(true)
    try {
      await openVault()
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === 'AbortError') return  // user cancelled — not an error
        if (e.name === 'TypeError') {
          setError('shields')  // Brave Shields is blocking the File System API
          return
        }
        setError(e.message || 'Could not open folder. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center max-w-sm px-4">
        <div className="text-7xl mb-6">🖋</div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>inkbase</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Your local-first workspace. Notion's soul, Obsidian's freedom.
        </p>

        <button
          disabled={loading}
          className="px-6 py-3 rounded-xl font-medium text-white text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ background: 'var(--color-accent)' }}
          onClick={handleOpen}
        >
          {loading ? 'Opening…' : 'Open a folder as vault'}
        </button>

        <p className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
          Pick any folder on your computer. Your notes stay there as .md files.
        </p>

        {renderError()}
      </div>
    </div>
  )
}
