import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { DatabaseRow, PropertyDef, PropertyType } from '../types'
import {
  readDatabaseRows,
  writeRow,
  deleteRow as deleteRowFile,
  createNewRow,
} from '../lib/fs'
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

  addColumn: (databaseId: string, name: string, type: PropertyType) => Promise<void>
  updateColumn: (databaseId: string, colId: string, updates: Partial<PropertyDef>) => Promise<void>
  deleteColumn: (databaseId: string, colId: string) => Promise<void>
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
    await deleteRowFile(vault.handle, rowId)
    set(state => ({ rows: state.rows.filter(r => r.id !== rowId) }))
  },

  addColumn: async (databaseId, name, type) => {
    const { flatPages, updatePage } = useVaultStore.getState()
    const db = flatPages.find(p => p.id === databaseId)
    if (!db) return
    const newCol: PropertyDef = { id: uuidv4(), name, type, options: type === 'select' ? [] : undefined }
    await updatePage(databaseId, { schema: [...(db.schema ?? []), newCol] })
  },

  updateColumn: async (databaseId, colId, updates) => {
    const { flatPages, updatePage } = useVaultStore.getState()
    const db = flatPages.find(p => p.id === databaseId)
    if (!db) return
    const schema = (db.schema ?? []).map(col =>
      col.id === colId ? { ...col, ...updates } : col
    )
    await updatePage(databaseId, { schema })
  },

  deleteColumn: async (databaseId, colId) => {
    const { flatPages, updatePage } = useVaultStore.getState()
    const db = flatPages.find(p => p.id === databaseId)
    if (!db) return
    const schema = (db.schema ?? []).filter(col => col.id !== colId)
    await updatePage(databaseId, { schema })
  },
}))
