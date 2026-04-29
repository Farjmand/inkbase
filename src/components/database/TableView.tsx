import { useEffect, useState } from 'react'
import { useDatabaseStore } from '../../store/databaseStore'
import { useVaultStore } from '../../store/vaultStore'
import { PropertyCell } from './PropertyCell'
import { ColumnHeader } from './ColumnMenu'
import { AddColumnModal } from './AddColumnModal'

export function TableView() {
  const { activePage } = useVaultStore()
  const { rows, loadedForId, loadRows, addRow, deleteRow } = useDatabaseStore()
  const [addColOpen, setAddColOpen] = useState(false)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  useEffect(() => {
    if (activePage?.id && activePage.type === 'database') {
      loadRows(activePage.id)
    }
  }, [activePage?.id])

  if (!activePage || activePage.type !== 'database') return null

  const schema = activePage.schema ?? []

  return (
    <div className="flex-1 overflow-auto" style={{ color: 'var(--color-text)' }}>
      {schema.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">🗃️</span>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            No columns yet
          </p>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white"
            style={{ background: 'var(--color-accent)' }}
            onClick={() => setAddColOpen(true)}
          >
            + Add first column
          </button>
        </div>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', background: 'var(--color-sidebar)' }}>
              {/* row number */}
              <th className="w-8 px-2 py-2 text-xs font-normal text-center" style={{ color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border)' }}>
                #
              </th>
              {schema.map(col => (
                <ColumnHeader key={col.id} col={col} databaseId={activePage.id} />
              ))}
              {/* add column */}
              <th className="w-10">
                <button
                  title="Add column"
                  className="w-full flex items-center justify-center py-2 opacity-40 hover:opacity-100 transition-opacity text-sm"
                  style={{ color: 'var(--color-text)' }}
                  onClick={() => setAddColOpen(true)}
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  background: hoveredRow === row.id ? 'var(--color-hover)' : 'transparent',
                }}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* row number + delete */}
                <td
                  className="px-2 text-xs text-center relative"
                  style={{ color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border)', verticalAlign: 'middle' }}
                >
                  {hoveredRow === row.id ? (
                    <button
                      className="w-full flex items-center justify-center text-xs opacity-60 hover:opacity-100 hover:text-red-500 transition-all"
                      onClick={() => deleteRow(row.id)}
                      title="Delete row"
                    >
                      ✕
                    </button>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </td>
                {schema.map(col => (
                  <td
                    key={col.id}
                    style={{ borderRight: '1px solid var(--color-border)', verticalAlign: 'middle' }}
                  >
                    <PropertyCell row={row} col={col} databaseId={activePage.id} />
                  </td>
                ))}
                <td />
              </tr>
            ))}

            {/* Add row */}
            <tr>
              <td colSpan={schema.length + 2} style={{ borderTop: '1px solid var(--color-border)' }}>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm w-full transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => addRow(activePage.id)}
                >
                  <span>+</span>
                  <span>New row</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {addColOpen && (
        <AddColumnModal databaseId={activePage.id} onClose={() => setAddColOpen(false)} />
      )}
    </div>
  )
}
