import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Page, PageNode, PropertyDef, PropertyType } from '@/types'
import {
  openVaultDirectory,
  readAllPages,
  writePage,
  deletePage as deletePageFile,
  deleteAllRows,
  buildPageTree,
  createNewPage,
  createNewDatabase,
} from '@/lib/fs'

interface VaultState {
  vault: { name: string; handle: FileSystemDirectoryHandle; rootPages: PageNode[] } | null
  activePageId: string | null
  activePage: Page | null
  flatPages: Page[]

  openVault: () => Promise<void>
  closeVault: () => void
  setActivePage: (id: string) => void
  createPage: (parentId?: string | null) => Promise<void>
  createDatabase: (parentId?: string | null) => Promise<void>
  updatePage: (id: string, updates: Partial<Omit<Page, 'id'>>) => Promise<void>
  deletePage: (id: string) => Promise<void>
  reloadVault: () => Promise<void>

  // Schema mutations (owned here — databaseStore must not mutate vault state)
  addColumn: (databaseId: string, name: string, type: PropertyType) => Promise<void>
  updateColumn: (databaseId: string, colId: string, updates: Partial<PropertyDef>) => Promise<void>
  deleteColumn: (databaseId: string, colId: string) => Promise<void>
}

function deriveActive(flat: Page[], id: string | null): Page | null {
  return id ? (flat.find(p => p.id === id) ?? null) : null
}

function allDescendantIds(flat: Page[], rootId: string): string[] {
  const ids: string[] = []
  const seen = new Set<string>([rootId])
  const queue = [rootId]
  while (queue.length > 0) {
    const cur = queue.shift()!
    for (const p of flat) {
      if (p.parentId === cur && !seen.has(p.id)) {
        seen.add(p.id)
        ids.push(p.id)
        queue.push(p.id)
      }
    }
  }
  return ids
}

export const useVaultStore = create<VaultState>((set, get) => ({
  vault: null,
  activePageId: null,
  activePage: null,
  flatPages: [],

  openVault: async () => {
    const handle = await openVaultDirectory()
    const flat = await readAllPages(handle)
    const firstId = flat[0]?.id ?? null
    set({
      vault: { name: handle.name, handle, rootPages: buildPageTree(flat) },
      flatPages: flat,
      activePageId: firstId,
      activePage: deriveActive(flat, firstId),
    })
  },

  closeVault: () => set({ vault: null, activePageId: null, activePage: null, flatPages: [] }),

  setActivePage: (id) => {
    set(state => ({
      activePageId: id,
      activePage: state.flatPages.find(p => p.id === id) ?? null,
    }))
  },

  createPage: async (parentId = null) => {
    const { vault, flatPages } = get()
    if (!vault) return
    const newPage = createNewPage(parentId)
    await writePage(vault.handle, newPage)
    const newFlat = [...flatPages, newPage]
    set({
      flatPages: newFlat,
      vault: { ...vault, rootPages: buildPageTree(newFlat) },
      activePageId: newPage.id,
      activePage: newPage,
    })
  },

  createDatabase: async (parentId = null) => {
    const { vault, flatPages } = get()
    if (!vault) return
    const newDb = createNewDatabase(parentId)
    await writePage(vault.handle, newDb)
    const newFlat = [...flatPages, newDb]
    set({
      flatPages: newFlat,
      vault: { ...vault, rootPages: buildPageTree(newFlat) },
      activePageId: newDb.id,
      activePage: newDb,
    })
  },

  updatePage: async (id, updates) => {
    const { vault, flatPages, activePageId } = get()
    if (!vault) return
    const idx = flatPages.findIndex(p => p.id === id)
    if (idx === -1) return
    const updated: Page = { ...flatPages[idx], ...updates, updatedAt: new Date().toISOString() }
    await writePage(vault.handle, updated)
    const newFlat = [...flatPages]
    newFlat[idx] = updated
    set({
      flatPages: newFlat,
      vault: { ...vault, rootPages: buildPageTree(newFlat) },
      activePage: deriveActive(newFlat, activePageId),
    })
  },

  deletePage: async (id) => {
    const { vault, flatPages, activePageId } = get()
    if (!vault) return
    const toDelete = [id, ...allDescendantIds(flatPages, id)]
    await Promise.all(
      toDelete.map(async pid => {
        const page = flatPages.find(p => p.id === pid)
        await deletePageFile(vault.handle, pid)
        if (page?.type === 'database') await deleteAllRows(vault.handle, pid)
      })
    )
    const newFlat = flatPages.filter(p => !toDelete.includes(p.id))
    const nextId = toDelete.includes(activePageId ?? '') ? (newFlat[0]?.id ?? null) : activePageId
    set({
      flatPages: newFlat,
      vault: { ...vault, rootPages: buildPageTree(newFlat) },
      activePageId: nextId,
      activePage: deriveActive(newFlat, nextId),
    })
  },

  reloadVault: async () => {
    const { vault, activePageId } = get()
    if (!vault) return
    const flat = await readAllPages(vault.handle)
    set({
      flatPages: flat,
      vault: { ...vault, rootPages: buildPageTree(flat) },
      activePage: deriveActive(flat, activePageId),
    })
  },

  addColumn: async (databaseId, name, type) => {
    const { flatPages, updatePage } = get()
    const db = flatPages.find(p => p.id === databaseId)
    if (!db) return
    const col: PropertyDef = {
      id: uuidv4(),
      name,
      type,
      options: type === 'select' ? [] : undefined,
    }
    await updatePage(databaseId, { schema: [...(db.schema ?? []), col] })
  },

  updateColumn: async (databaseId, colId, updates) => {
    const { flatPages, updatePage } = get()
    const db = flatPages.find(p => p.id === databaseId)
    if (!db) return
    const schema = (db.schema ?? []).map(c => (c.id === colId ? { ...c, ...updates } : c))
    await updatePage(databaseId, { schema })
  },

  deleteColumn: async (databaseId, colId) => {
    const { flatPages, updatePage } = get()
    const db = flatPages.find(p => p.id === databaseId)
    if (!db) return
    const schema = (db.schema ?? []).filter(c => c.id !== colId)
    await updatePage(databaseId, { schema })
    // Row property cleanup is performed by databaseStore.cleanupColumn (called from ColumnMenu)
  },
}))
