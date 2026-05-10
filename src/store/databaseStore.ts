import { create } from 'zustand'
import type { DatabaseRow } from '@/types'
import { readDatabaseRows, writeRow, deleteRow as deleteRowFile, createNewRow } from '@/lib/fs'
import { useVaultStore } from './vaultStore'

interface DatabaseState {
  rows: DatabaseRow[]
  loadedForId: string | null

  loadRows: (databaseId: string) => Promise<void>
  addRow: (databaseId: string) => Promise<void>
  updateCell: (
    rowId: string,
    databaseId: string,
    propId: string,
    value: string | number | boolean | null
  ) => Promise<void>
  deleteRow: (rowId: string) => Promise<void>
  cleanupColumn: (databaseId: string, colId: string) => Promise<void>
}

export const useDatabaseStore = create<DatabaseState>((set, get) => ({
  rows: [],
  loadedForId: null,

  loadRows: async (databaseId) => {
    const { vault } = useVaultStore.getState()
    if (!vault) return
    const rows = await readDatabaseRows(vault.handle, databaseId)
    set({ rows, loadedForId: databaseId })
  },

  addRow: async (databaseId) => {
    const { vault } = useVaultStore.getState()
    if (!vault) return
    const row = createNewRow(databaseId)
    await writeRow(vault.handle, row)
    set(state => ({ rows: [...state.rows, row] }))
  },

  updateCell: async (rowId, databaseId, propId, value) => {
    const { vault } = useVaultStore.getState()
    if (!vault) return
    const { rows } = get()
    const idx = rows.findIndex(r => r.id === rowId)
    if (idx === -1) return
    const updated: DatabaseRow = {
      ...rows[idx],
      properties: { ...rows[idx].properties, [propId]: value },
      updatedAt: new Date().toISOString(),
    }
    await writeRow(vault.handle, updated)
    const newRows = [...rows]
    newRows[idx] = updated
    set({ rows: newRows })
  },

  deleteRow: async (rowId) => {
    const { vault } = useVaultStore.getState()
    if (!vault) return
    const row = get().rows.find(r => r.id === rowId)
    if (!row) return
    await deleteRowFile(vault.handle, row.databaseId, rowId)
    set(state => ({ rows: state.rows.filter(r => r.id !== rowId) }))
  },

  cleanupColumn: async (databaseId, colId) => {
    const { vault } = useVaultStore.getState()
    if (!vault) return
    const affected = get().rows.filter(
      r => r.databaseId === databaseId && colId in r.properties
    )
    if (affected.length === 0) return
    const updated = affected.map(r => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [colId]: _removed, ...rest } = r.properties
      return { ...r, properties: rest, updatedAt: new Date().toISOString() }
    })
    await Promise.all(updated.map(r => writeRow(vault.handle, r)))
    const rowMap = new Map(updated.map(r => [r.id, r]))
    set(state => ({ rows: state.rows.map(r => rowMap.get(r.id) ?? r) }))
  },
}))
