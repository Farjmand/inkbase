export type PageType = 'page' | 'database'

export type PropertyType = 'text' | 'number' | 'select' | 'date' | 'checkbox'

export interface PropertyDef {
  id: string
  name: string
  type: PropertyType
  options?: string[]  // used by 'select' type
}

export interface Page {
  id: string
  title: string
  icon: string
  cover: string | null   // hex color OR image URL
  parentId: string | null
  type: PageType
  content: string        // raw markdown body (below frontmatter)
  schema?: PropertyDef[] // only for type === 'database'
  createdAt: string
  updatedAt: string
  children?: Page[]      // populated in-memory only
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
  rootPages: Page[]
}

export type CoverType = 'color' | 'image' | null
