export type PageType = 'page' | 'database'

export type PropertyType = 'text' | 'number' | 'select' | 'date' | 'checkbox'

export interface PropertyDef {
  id: string
  name: string
  type: PropertyType
  options?: string[]
}

// Persisted to disk — no derived fields
export interface Page {
  id: string
  title: string
  icon: string
  cover: string | null
  parentId: string | null
  type: PageType
  content: string
  tags: string[]
  sortOrder: number
  schema?: PropertyDef[]
  createdAt: string
  updatedAt: string
}

// In-memory tree node with children populated by buildPageTree
export interface PageNode extends Page {
  children: PageNode[]
}

export interface DatabaseRow {
  id: string
  databaseId: string
  properties: Record<string, string | number | boolean | null>
  createdAt: string
  updatedAt: string
}

export interface Vault {
  name: string
  handle: FileSystemDirectoryHandle
  rootPages: PageNode[]
}

export type CoverType = 'color' | 'image' | null
