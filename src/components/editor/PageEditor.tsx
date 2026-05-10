import { useCallback, useEffect, useRef, useState } from 'react'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import '@blocknote/mantine/style.css'
import { useVaultStore } from '@/store/vaultStore'
import { useUIStore } from '@/store/uiStore'
import { PageHeader } from './PageHeader'
import { DatabaseView } from '../database/DatabaseView'
import type { Page } from '@/types'

// Inner component — keyed on page.id so it fully remounts on page switch
function PageEditorInner({ page }: Readonly<{ page: Page }>) {
  const { updatePage } = useVaultStore()
  const { dark } = useUIStore()
  const [title, setTitle] = useState(page.title)
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useCreateBlockNote()

  // Load saved content on mount — key={page.id} guarantees this runs once per page
  useEffect(() => {
    if (!page.content) return
    const blocks = editor.tryParseMarkdownToBlocks(page.content)
    editor.replaceBlocks(editor.document, blocks)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (titleTimer.current) clearTimeout(titleTimer.current)
    titleTimer.current = setTimeout(() => updatePage(page.id, { title: val }), 600)
  }

  const handleEditorChange = useCallback(() => {
    if (contentTimer.current) clearTimeout(contentTimer.current)
    contentTimer.current = setTimeout(() => {
      const markdown = editor.blocksToMarkdownLossy(editor.document)
      updatePage(page.id, { content: markdown })
    }, 800)
  }, [editor, page.id, updatePage])

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="flex-1 overflow-y-auto">
        <PageHeader page={page} title={title} onTitleChange={handleTitleChange} />
        <div className="px-12 pb-16">
          <BlockNoteView
            editor={editor}
            onChange={handleEditorChange}
            theme={dark ? 'dark' : 'light'}
          />
        </div>
      </div>
    </div>
  )
}

export function PageEditor() {
  const activePage = useVaultStore(s => s.flatPages.find(p => p.id === s.activePageId) ?? null)

  if (!activePage) {
    return (
      <div
        className="flex-1 flex items-center justify-center text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4">🖋</div>
          <p className="font-medium">Select a page or create a new one</p>
        </div>
      </div>
    )
  }

  if (activePage.type === 'database') return <DatabaseView />

  return <PageEditorInner key={activePage.id} page={activePage} />
}
