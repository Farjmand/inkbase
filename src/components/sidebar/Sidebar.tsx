
import { useVaultStore } from '../../store/vaultStore'
import { SidebarItem } from './SidebarItem'

export function Sidebar() {
  const { vault, createPage, closeVault } = useVaultStore()

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
        <button
          title="Close vault"
          className="text-xs opacity-40 hover:opacity-80"
          onClick={closeVault}
        >⏏</button>
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

      {/* Footer: New page */}
      <div className="border-t px-3 py-2" style={{ borderColor: 'var(--color-border)' }}>
        <button
          className="flex items-center gap-2 text-sm w-full rounded-md px-2 py-1.5 hover:bg-[#efefed] transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onClick={() => createPage(null)}
        >
          <span className="text-base">＋</span>
          <span>New page</span>
        </button>
      </div>
    </div>
  )
}
