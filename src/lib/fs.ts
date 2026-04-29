/**
 * File System layer — wraps the File System Access API.
 * All disk I/O goes through here so we can swap to Electron's fs later.
 *
 * File naming convention:
 *   Pages / databases  →  {id}.md
 *   Database rows      →  row_{id}.md
 */

import matter from 'gray-matter'
import { v4 as uuidv4 } from 'uuid'
import type { Page, DatabaseRow } from '../types'

// ─── Serialization: Pages ─────────────────────────────────────────────────────

export function pageToMarkdown(page: Omit<Page, 'children'>): string {
  const frontmatter: Record<string, unknown> = {
    id: page.id,
    title: page.title,
    icon: page.icon,
    cover: page.cover,
    parentId: page.parentId,
    type: page.type,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  }
  if (page.schema) frontmatter.schema = page.schema
  return matter.stringify(page.content || '', frontmatter)
}

export function markdownToPage(raw: string): Omit<Page, 'children'> {
  const { data, content } = matter(raw)
  return {
    id: data.id ?? uuidv4(),
    title: data.title ?? 'Untitled',
    icon: data.icon ?? '📄',
    cover: data.cover ?? null,
    parentId: data.parentId ?? null,
    type: data.type ?? 'page',
    content: content.trim(),
    schema: data.schema ?? undefined,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  }
}

// ─── Serialization: Rows ─────────────────────────────────────────────────────

export function rowToMarkdown(row: DatabaseRow): string {
  const frontmatter: Record<string, unknown> = {
    id: row.id,
    databaseId: row.databaseId,
    properties: row.properties,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
  return matter.stringify('', frontmatter)
}

export function markdownToRow(raw: string): DatabaseRow {
  const { data } = matter(raw)
  return {
    id: data.id ?? uuidv4(),
    databaseId: data.databaseId ?? '',
    properties: data.properties ?? {},
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  }
}

// ─── Directory handle helpers ─────────────────────────────────────────────────

export async function openVaultDirectory(): Promise<FileSystemDirectoryHandle> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await (window as any).showDirectoryPicker({ mode: 'readwrite' })
}

export async function readAllPages(
  dir: FileSystemDirectoryHandle
): Promise<Omit<Page, 'children'>[]> {
  const pages: Omit<Page, 'children'>[] = []
  for await (const [name, handle] of dir.entries()) {
    if (handle.kind !== 'file') continue
    if (!name.endsWith('.md')) continue
    if (name.startsWith('row_')) continue  // skip database rows
    const file = await (handle as FileSystemFileHandle).getFile()
    const text = await file.text()
    pages.push(markdownToPage(text))
  }
  return pages
}

export async function writePage(
  dir: FileSystemDirectoryHandle,
  page: Omit<Page, 'children'>
): Promise<void> {
  const fileHandle = await dir.getFileHandle(`${page.id}.md`, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(pageToMarkdown(page))
  await writable.close()
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

// ─── Row CRUD ─────────────────────────────────────────────────────────────────

export async function readDatabaseRows(
  dir: FileSystemDirectoryHandle,
  databaseId: string
): Promise<DatabaseRow[]> {
  const rows: DatabaseRow[] = []
  for await (const [name, handle] of dir.entries()) {
    if (handle.kind !== 'file') continue
    if (!name.startsWith('row_') || !name.endsWith('.md')) continue
    const file = await (handle as FileSystemFileHandle).getFile()
    const text = await file.text()
    const row = markdownToRow(text)
    if (row.databaseId === databaseId) rows.push(row)
  }
  rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return rows
}

export async function writeRow(
  dir: FileSystemDirectoryHandle,
  row: DatabaseRow
): Promise<void> {
  const fileHandle = await dir.getFileHandle(`row_${row.id}.md`, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(rowToMarkdown(row))
  await writable.close()
}

export async function deleteRow(
  dir: FileSystemDirectoryHandle,
  rowId: string
): Promise<void> {
  try {
    await dir.removeEntry(`row_${rowId}.md`)
  } catch {
    // ignore
  }
}

// ─── Page tree builder ────────────────────────────────────────────────────────

export function buildPageTree(flat: Omit<Page, 'children'>[]): Page[] {
  const map = new Map<string, Page>()
  flat.forEach(p => map.set(p.id, { ...p, children: [] }))

  const roots: Page[] = []
  map.forEach(page => {
    if (page.parentId && map.has(page.parentId)) {
      map.get(page.parentId)!.children!.push(page)
    } else {
      roots.push(page)
    }
  })
  return roots
}

// ─── New page / database factories ───────────────────────────────────────────

export function createNewPage(parentId: string | null = null): Omit<Page, 'children'> {
  const now = new Date().toISOString()
  return {
    id: uuidv4(),
    title: 'Untitled',
    icon: '📄',
    cover: null,
    parentId,
    type: 'page',
    content: '',
    createdAt: now,
    updatedAt: now,
  }
}

export function createNewDatabase(parentId: string | null = null): Omit<Page, 'children'> {
  const now = new Date().toISOString()
  return {
    id: uuidv4(),
    title: 'Untitled Database',
    icon: '🗃️',
    cover: null,
    parentId,
    type: 'database',
    content: '',
    schema: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function createNewRow(databaseId: string): DatabaseRow {
  const now = new Date().toISOString()
  return {
    id: uuidv4(),
    databaseId,
    properties: {},
    createdAt: now,
    updatedAt: now,
  }
}
