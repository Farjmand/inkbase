export type PageType = 'page' | 'database'

export interface Page {
  id: string
  title: string
  icon: string
  cover: string | null   // hex color OR image URL
  parentId: string | null
  type: PageType
  content: string        // raw markdown body (below frontmatter)
  createdAt: string
  updatedAt: string
  children?: Page[]      // populated in-memory only
}

export interface Vault {
  name: string
  handle: FileSystemDirectoryHandle
  rootPages: Page[]
}

export type CoverType = 'color' | 'image' | null
