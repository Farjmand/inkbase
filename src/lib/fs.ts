/**
 * File System layer — wraps the File System Access API.
 * All disk I/O goes through here so we can swap to Electron's fs later.
 */

import matter from 'gray-matter'
import { v4 as uuidv4 } from 'uuid'
import type { Page } from '../types'

// ─── Serialization ────────────────────────────────────────────────────────────

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
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  }
}

// ─── Directory handle helpers ─────────────────────────────────────────────────

export async function openVaultDirectory(): Promise<FileSystemDirectoryHandle> {
  // showDirectoryPicker is part of the File System Access API (Chrome/Edge)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await (window as any).showDirectoryPicker({ mode: 'readwrite' })
}

export async function readAllPages(
  dir: FileSystemDirectoryHandle
): Promise<Omit<Page, 'children'>[]> {
  const pages: Omit<Page, 'children'>[] = []
  for await (const [name, handle] of dir.entries()) {
    if (handle.kind === 'file' && name.endsWith('.md')) {
      const file = await (handle as FileSystemFileHandle).getFile()
      const text = await file.text()
      pages.push(markdownToPage(text))
    }
  }
  return pages
}

export async function writePage(
  dir: FileSystemDirectoryHandle,
  page: Omit<Page, 'children'>
): Promise<void> {
  const filename = `${page.id}.md`
  const fileHandle = await dir.getFileHandle(filename, { create: true })
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
    // file might not exist yet — that's fine
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

// ─── New page factory ─────────────────────────────────────────────────────────

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
