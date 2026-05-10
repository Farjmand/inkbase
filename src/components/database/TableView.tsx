import { useEffect, useMemo, useState } from 'react'
import { useDatabaseStore } from '@/store/databaseStore'
import { useVaultStore } from '@/store/vaultStore'
import { filterRows, sortRows, type PropertyFilter, type SortConfig } from '@/lib/database'
import { PropertyCell } from './PropertyCell'
import { ColumnHeader } from './ColumnMenu'
import { AddColumnModal } from './AddColumnModal'

function TableToolbar({
  rowCount,
  filterVisible,
  activeFilters,
  sortLabel,
  sortDirection,
  onToggleFilter,
  onClearSort,
}: Readonly<{
  rowCount: number
  filterVisible: boolean
  activeFilters: number
  sortLabel: string | null
  sortDirection: 'asc' | 'desc' | null
  onToggleFilter: () => void
  onClearSort: () => void
}>) {
  return (
    <div className="flex items-center gap-2 px-2 py-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
      <span>{rowCount} row{rowCount === 1 ? '' : 's'}</span>
      <div className="flex-1" />
      {sortLabel && sortDirection && (
        <button
          type="button"
          className="flex items-center gap-1 px-2 py-1 rounded text-xs"
          style={{ background: 'var(--color-hover)', color: 'var(--color-text)' }}
          onClick={onClearSort}
        >
          {sortDirection === 'asc' ? '↑' : '↓'} {sortLabel} ✕
        </button>
      )}
      <button
        type="button"
        className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
        style={{
          background: filterVisible || activeFilters > 0 ? 'var(--color-accent, #6366f1)' : 'var(--color-hover)',
          color: filterVisible || activeFilters > 0 ? '#fff' : 'var(--color-text)',
        }}
        onClick={onToggleFilter}
      >
        ⌕ Filter{activeFilters > 0 ? ` (${activeFilters})` : ''}
      </button>
    </div>
  )
}

export function TableView() {
  const activePage = useVaultStore(s => s.flatPages.find(p => p.id === s.activePageId) ?? null)
  const { rows, loadRows, addRow, deleteRow } = useDatabaseStore()
  const [addColOpen, setAddColOpen] = useState(false)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [sort, setSort] = useState<SortConfig | null>(null)
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [filterVisible, setFilterVisible] = useState(false)

  // All hooks before any conditional return
  const schema = activePage?.type === 'database' ? (activePage.schema ?? []) : []

  const displayRows = useMemo(() => {
    const activeFilters: PropertyFilter[] = Object.entries(filterValues)
      .filter(([, v]) => v.trim() !== '')
      .map(([columnId, value]) => ({ columnId, value }))
    return sortRows(filterRows(rows, activeFilters, schema), sort, schema)
  }, [rows, filterValues, sort, schema])

  useEffect(() => {
    if (activePage?.id && activePage.type === 'database') {
      loadRows(activePage.id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage?.id])

  if (activePage?.type !== 'database') return null

  const activeFilters = Object.entries(filterValues).filter(([, v]) => v.trim() !== '').length

  const handleSortToggle = (columnId: string, dir: 'asc' | 'desc') => {
    setSort(prev => (prev?.columnId === columnId && prev.direction === dir ? null : { columnId, direction: dir }))
  }

  const sortColName = sort ? (schema.find(c => c.id === sort.columnId)?.name ?? sort.columnId) : ''

  if (schema.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="text-5xl">🗃️</span>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>No columns yet</p>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white"
          style={{ background: 'var(--color-accent)' }}
          onClick={() => setAddColOpen(true)}
        >
          + Add first column
        </button>
        {addColOpen && <AddColumnModal databaseId={activePage.id} onClose={() => setAddColOpen(false)} />}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto" style={{ color: 'var(--color-text)' }}>
      <TableToolbar
        rowCount={displayRows.length}
        filterVisible={filterVisible}
        activeFilters={activeFilters}
        sortLabel={sortColName || null}
        sortDirection={sort?.direction ?? null}
        onToggleFilter={() => setFilterVisible(v => !v)}
        onClearSort={() => setSort(null)}
      />

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-border)', background: 'var(--color-sidebar)' }}>
            <th className="w-8 px-2 py-2 text-xs font-normal text-center" style={{ color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border)' }}>
              #
            </th>
            {schema.map(col => (
              <ColumnHeader
                key={col.id}
                col={col}
                databaseId={activePage.id}
                sortDirection={sort?.columnId === col.id ? sort.direction : null}
                onSortToggle={dir => handleSortToggle(col.id, dir)}
              />
            ))}
            <th className="w-10">
              <button
                type="button"
                title="Add column"
                className="w-full flex items-center justify-center py-2 opacity-40 hover:opacity-100 transition-opacity text-sm"
                style={{ color: 'var(--color-text)' }}
                onClick={() => setAddColOpen(true)}
              >
                +
              </button>
            </th>
          </tr>

          {filterVisible && (
            <tr style={{ background: 'var(--color-sidebar)', borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ borderRight: '1px solid var(--color-border)' }} />
              {schema.map(col => (
                <td key={col.id} style={{ borderRight: '1px solid var(--color-border)', padding: '4px 8px' }}>
                  <input
                    className="w-full bg-transparent outline-none text-xs border-b"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    placeholder={`Filter ${col.name}…`}
                    value={filterValues[col.id] ?? ''}
                    onChange={e => setFilterValues(prev => ({ ...prev, [col.id]: e.target.value }))}
                  />
                </td>
              ))}
              <td />
            </tr>
          )}
        </thead>

        <tbody>
          {displayRows.map((row, i) => (
            <tr
              key={row.id}
              style={{
                borderBottom: '1px solid var(--color-border)',
                background: hoveredRow === row.id ? 'var(--color-hover)' : 'transparent',
              }}
              onMouseEnter={() => setHoveredRow(row.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="px-2 text-xs text-center relative" style={{ color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
                {hoveredRow === row.id ? (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center text-xs opacity-60 hover:opacity-100 hover:text-red-500 transition-all"
                    onClick={() => deleteRow(row.id)}
                    title="Delete row"
                  >✕</button>
                ) : (
                  <span>{i + 1}</span>
                )}
              </td>
              {schema.map(col => (
                <td key={col.id} style={{ borderRight: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
                  <PropertyCell row={row} col={col} databaseId={activePage.id} />
                </td>
              ))}
              <td />
            </tr>
          ))}

          <tr>
            <td colSpan={schema.length + 2} style={{ borderTop: '1px solid var(--color-border)' }}>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 text-sm w-full transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => addRow(activePage.id)}
              >
                <span>+</span>
                <span>New row</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {addColOpen && <AddColumnModal databaseId={activePage.id} onClose={() => setAddColOpen(false)} />}
    </div>
  )
}
