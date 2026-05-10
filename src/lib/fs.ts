/**
 * File System layer — wraps the File System Access API.
 * All disk I/O goes through here so we can swap to Electron's fs later.
 *
 * File layout:
 *   Pages / databases  →  {vault}/{id}.md
 *   Database rows      →  {vault}/{databaseId}/{rowId}.md
 */

import matter from 'gray-matter'
import { v4 as uuidv4 } from 'uuid'
import type { Page, PageNode, DatabaseRow, PropertyDef, PropertyType } from '../types'

// ─── Validation helpers ───────────────────────────────────────────────────────

const VALID_PAGE_TYPES = new Set<string>(['page', 'database'])
const VALID_PROPERTY_TYPES = new Set<PropertyType>(['text', 'number', 'select', 'date', 'checkbox'])

function sanitizeSchema(raw: unknown): PropertyDef[] | undefined {
  if (!Array.isArray(raw)) return undefined
  return raw.filter(
    (col): col is PropertyDef =>
      typeof col === 'object' &&
      col !== null &&
      typeof col.id === 'string' &&
      typeof col.name === 'string' &&
      VALID_PROPERTY_TYPES.has(col.type)
  )
}

// ─── Serialization: Pages ─────────────────────────────────────────────────────

export function pageToMarkdown(page: Page): string {
  const frontmatter: Record<string, unknown> = {
    id: page.id,
    title: page.title,
    icon: page.icon,
    cover: page.cover,
    parentId: page.parentId,
    type: page.type,
    tags: page.tags,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  }
  if (page.schema) frontmatter.schema = page.schema
  return matter.stringify(page.content || '', frontmatter)
}

function sanitizeTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
}

export function markdownToPage(raw: string): Page {
  const { data, content } = matter(raw)
  return {
    id: typeof data.id === 'string' ? data.id : uuidv4(),
    title: typeof data.title === 'string' ? data.title : 'Untitled',
    icon: typeof data.icon === 'string' ? data.icon : '📄',
    cover: typeof data.cover === 'string' ? data.cover : null,
    parentId: typeof data.parentId === 'string' ? data.parentId : null,
    type: VALID_PAGE_TYPES.has(data.type) ? data.type : 'page',
    content: content.trim(),
    tags: sanitizeTags(data.tags),
    schema: sanitizeSchema(data.schema),
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
  }
}

// ─── Serialization: Rows ─────────────────────────────────────────────────────

export function rowToMarkdown(row: DatabaseRow): string {
  return matter.stringify('', {
    id: row.id,
    databaseId: row.databaseId,
    properties: row.properties,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export function markdownToRow(raw: string): DatabaseRow {
  const { data } = matter(raw)
  return {
    id: typeof data.id === 'string' ? data.id : uuidv4(),
    databaseId: typeof data.databaseId === 'string' ? data.databaseId : '',
    properties:
      data.properties !== null && typeof data.properties === 'object'
        ? (data.properties as Record<string, string | number | boolean | null>)
        : {},
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
  }
}

// ─── Directory handle helpers ─────────────────────────────────────────────────

export async function openVaultDirectory(): Promise<FileSystemDirectoryHandle> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await (globalThis as any).showDirectoryPicker({ mode: 'readwrite' })
}

export async function readAllPages(dir: FileSystemDirectoryHandle): Promise<Page[]> {
  const pages: Page[] = []
  for await (const [name, handle] of dir.entries()) {
    if (handle.kind !== 'file') continue
    if (!name.endsWith('.md')) continue
    if (name.startsWith('row_')) continue // legacy flat-layout rows
    const file = await (handle as FileSystemFileHandle).getFile()
    const text = await file.text()
    pages.push(markdownToPage(text))
  }
  return pages
}

export async function writePage(dir: FileSystemDirectoryHandle, page: Page): Promise<void> {
  try {
    const fileHandle = await dir.getFileHandle(`${page.id}.md`, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(pageToMarkdown(page))
    await writable.close()
  } catch (err) {
    throw new Error(
      `Failed to save page "${page.title}": ${err instanceof Error ? err.message : String(err)}`
    )
  }
}

export async function deletePage(
  dir: FileSystemDirectoryHandle,
  pageId: string
): Promise<void> {
  try {
    await dir.removeEntry(`${pageId}.md`)
  } catch {
    // file might not exist — that's fine
  }
}

// ─── Row CRUD — rows stored in per-database subdirectories ───────────────────

async function readRowsFromSubdir(
  dir: FileSystemDirectoryHandle,
  databaseId: string
): Promise<DatabaseRow[]> {
  const dbDir = await dir.getDirectoryHandle(databaseId)
  const rows: DatabaseRow[] = []
  for await (const [name, handle] of dbDir.entries()) {
    if (handle.kind !== 'file' || !name.endsWith('.md')) continue
    const file = await (handle as FileSystemFileHandle).getFile()
    rows.push(markdownToRow(await file.text()))
  }
  return rows
}

async function migrateLegacyRows(
  dir: FileSystemDirectoryHandle,
  databaseId: string
): Promise<DatabaseRow[]> {
  const rows: DatabaseRow[] = []
  for await (const [name, handle] of dir.entries()) {
    if (handle.kind !== 'file') continue
    if (!name.startsWith('row_') || !name.endsWith('.md')) continue
    const file = await (handle as FileSystemFileHandle).getFile()
    const row = markdownToRow(await file.text())
    if (row.databaseId !== databaseId) continue
    await writeRow(dir, row)
    try { await dir.removeEntry(name) } catch { /* ignore */ }
    rows.push(row)
  }
  return rows
}

export async function readDatabaseRows(
  dir: FileSystemDirectoryHandle,
  databaseId: string
): Promise<DatabaseRow[]> {
  let rows: DatabaseRow[]
  try {
    rows = await readRowsFromSubdir(dir, databaseId)
  } catch {
    // Subdirectory doesn't exist yet — scan root for legacy row_*.md and migrate
    rows = await migrateLegacyRows(dir, databaseId)
  }
  rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return rows
}

export async function writeRow(dir: FileSystemDirectoryHandle, row: DatabaseRow): Promise<void> {
  try {
    const dbDir = await dir.getDirectoryHandle(row.databaseId, { create: true })
    const fileHandle = await dbDir.getFileHandle(`${row.id}.md`, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(rowToMarkdown(row))
    await writable.close()
  } catch (err) {
    throw new Error(`Failed to save row: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export async function deleteRow(
  dir: FileSystemDirectoryHandle,
  databaseId: string,
  rowId: string
): Promise<void> {
  try {
    const dbDir = await dir.getDirectoryHandle(databaseId)
    await dbDir.removeEntry(`${rowId}.md`)
  } catch {
    // ignore
  }
}

export async function deleteAllRows(
  dir: FileSystemDirectoryHandle,
  databaseId: string
): Promise<void> {
  try {
    await dir.removeEntry(databaseId, { recursive: true })
  } catch {
    // ignore
  }
}

// ─── Page tree builder ────────────────────────────────────────────────────────

export function buildPageTree(flat: Page[]): PageNode[] {
  const map = new Map<string, PageNode>()
  flat.forEach(p => map.set(p.id, { ...p, children: [] }))

  const roots: PageNode[] = []
  map.forEach(page => {
    if (page.parentId && map.has(page.parentId)) {
      map.get(page.parentId)!.children.push(page)
    } else {
      roots.push(page)
    }
  })
  return roots
}

// ─── Factories ───────────────────────────────────────────────────────────────

export function createNewPage(parentId: string | null = null): Page {
  const now = new Date().toISOString()
  return {
    id: uuidv4(), title: 'Untitled', icon: '📄', cover: null,
    parentId, type: 'page', content: '', tags: [], createdAt: now, updatedAt: now,
  }
}

export function createNewDatabase(parentId: string | null = null): Page {
  const now = new Date().toISOString()
  return {
    id: uuidv4(), title: 'Untitled Database', icon: '🗃️', cover: null,
    parentId, type: 'database', content: '', tags: [], schema: [], createdAt: now, updatedAt: now,
  }
}

export function createNewRow(databaseId: string): DatabaseRow {
  const now = new Date().toISOString()
  return { id: uuidv4(), databaseId, properties: {}, createdAt: now, updatedAt: now }
}
