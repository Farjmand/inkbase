
import { useVaultStore } from '../../store/vaultStore'
import { useUIStore } from '../../store/uiStore'
import { SidebarItem } from './SidebarItem'

export function Sidebar() {
  const { vault, createPage, createDatabase, closeVault } = useVaultStore()
  const { dark, toggleDark } = useUIStore()

  return (
    <div
      className="flex flex-col h-full border-r"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--color-sidebar)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🖋</span>
          <span className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
            {vault?.name ?? 'inkbase'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            title={dark ? 'Light mode' : 'Dark mode'}
            className="text-sm opacity-40 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-text)' }}
            onClick={toggleDark}
          >{dark ? '☀️' : '🌙'}</button>
          <button
            title="Close vault"
            className="text-xs opacity-40 hover:opacity-80 ml-1"
            style={{ color: 'var(--color-text)' }}
            onClick={closeVault}
          >⏏</button>
        </div>
      </div>

      {/* Page tree */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {vault?.rootPages.length === 0 && (
          <p className="text-xs px-3 py-2" style={{ color: 'var(--color-text-muted)' }}>
            No pages yet. Hit + to create one.
          </p>
        )}
        {vault?.rootPages.map(page => (
          <SidebarItem key={page.id} page={page} />
        ))}
      </div>

      {/* Footer: New page + New database */}
      <div className="border-t px-3 py-2 flex flex-col gap-0.5" style={{ borderColor: 'var(--color-border)' }}>
        <button
          className="flex items-center gap-2 text-sm w-full rounded-md px-2 py-1.5 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          onClick={() => createPage(null)}
        >
          <span className="text-base">＋</span>
          <span>New page</span>
        </button>
        <button
          className="flex items-center gap-2 text-sm w-full rounded-md px-2 py-1.5 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          onClick={() => createDatabase(null)}
        >
          <span className="text-base">🗃️</span>
          <span>New database</span>
        </button>
      </div>
    </div>
  )
}
