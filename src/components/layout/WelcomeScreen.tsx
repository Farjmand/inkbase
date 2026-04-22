
import { useVaultStore } from '../../store/vaultStore'

export function WelcomeScreen() {
  const { openVault } = useVaultStore()

  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="text-center max-w-sm">
        <div className="text-7xl mb-6">🖋</div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>inkbase</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Your local-first workspace. Notion's soul, Obsidian's freedom.
        </p>
        <button
          className="px-6 py-3 rounded-xl font-medium text-white text-sm shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: 'var(--color-accent)' }}
          onClick={openVault}
        >
          Open a folder as vault
        </button>
        <p className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
          Pick any folder on your computer. Your notes stay there as .md files.
        </p>
      </div>
    </div>
  )
}
