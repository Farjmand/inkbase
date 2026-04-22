import { create } from 'zustand'
import type { Page, Vault } from '../types'
import {
  openVaultDirectory,
  readAllPages,
  writePage,
  deletePage,
  buildPageTree,
  createNewPage,
} from '../lib/fs'

interface VaultState {
  vault: Vault | null
  activePageId: string | null
  activePage: Page | null
  flatPages: Omit<Page, 'children'>[]

  // Actions
  openVault: () => Promise<void>
  closeVault: () => void
  setActivePage: (id: string) => void
  createPage: (parentId?: string | null) => Promise<void>
  updatePage: (id: string, updates: Partial<Omit<Page, 'id' | 'children'>>) => Promise<void>
  deletePage: (id: string) => Promise<void>
  reloadVault: () => Promise<void>
}

export const useVaultStore = create<VaultState>((set, get) => ({
  vault: null,
  activePageId: null,
  activePage: null,
  flatPages: [],

  openVault: async () => {
    const handle = await openVaultDirectory()
    const flat = await readAllPages(handle)
    const rootPages = buildPageTree(flat)
    set({
      vault: { name: handle.name, handle, rootPages },
      flatPages: flat,
      activePageId: flat[0]?.id ?? null,
      activePage: flat[0] ? { ...flat[0], children: [] } : null,
    })
  },

  closeVault: () => set({ vault: null, activePageId: null, activePage: null, flatPages: [] }),

  setActivePage: (id: string) => {
    const { flatPages } = get()
    const page = flatPages.find(p => p.id === id)
    if (page) set({ activePageId: id, activePage: { ...page, children: [] } })
  },

  createPage: async (parentId = null) => {
    const { vault, flatPages } = get()
    if (!vault) return
    const newPage = createNewPage(parentId)
    await writePage(vault.handle, newPage)
    const newFlat = [...flatPages, newPage]
    const rootPages = buildPageTree(newFlat)
    set({
      flatPages: newFlat,
      vault: { ...vault, rootPages },
      activePageId: newPage.id,
      activePage: { ...newPage, children: [] },
    })
  },

  updatePage: async (id, updates) => {
    const { vault, flatPages } = get()
    if (!vault) return
    const idx = flatPages.findIndex(p => p.id === id)
    if (idx === -1) return
    const updated = {
      ...flatPages[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    await writePage(vault.handle, updated)
    const newFlat = [...flatPages]
    newFlat[idx] = updated
    const rootPages = buildPageTree(newFlat)
    set({
      flatPages: newFlat,
      vault: { ...vault, rootPages },
      activePage: get().activePageId === id ? { ...updated, children: [] } : get().activePage,
    })
  },

  deletePage: async (id) => {
    const { vault, flatPages, activePageId } = get()
    if (!vault) return
    await deletePage(vault.handle, id)
    const newFlat = flatPages.filter(p => p.id !== id)
    const rootPages = buildPageTree(newFlat)
    set({
      flatPages: newFlat,
      vault: { ...vault, rootPages },
      activePageId: activePageId === id ? (newFlat[0]?.id ?? null) : activePageId,
      activePage: activePageId === id
        ? (newFlat[0] ? { ...newFlat[0], children: [] } : null)
        : get().activePage,
    })
  },

  reloadVault: async () => {
    const { vault } = get()
    if (!vault) return
    const flat = await readAllPages(vault.handle)
    const rootPages = buildPageTree(flat)
    set({ flatPages: flat, vault: { ...vault, rootPages } })
  },
}))
