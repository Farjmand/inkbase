import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import '@blocknote/mantine/style.css'
import { useVaultStore } from '../../store/vaultStore'

export function PageEditor() {
  const { activePage, updatePage } = useVaultStore()
  const [title, setTitle] = useState(activePage?.title ?? '')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useCreateBlockNote({
    initialContent: undefined,
  })

  // Sync title input when page changes
  useEffect(() => {
    setTitle(activePage?.title ?? '')
  }, [activePage?.id])

  // Debounced save for title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (activePage) updatePage(activePage.id, { title: val })
    }, 600)
  }

  // Debounced save for content
  const handleEditorChange = useCallback(() => {
    if (!activePage) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const markdown = await editor.blocksToMarkdownLossy(editor.document)
      updatePage(activePage.id, { content: markdown })
    }, 800)
  }, [activePage, editor, updatePage])

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">🖋</div>
          <p className="font-medium">Select a page or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page cover placeholder (Phase 2) */}
      {activePage.cover && (
        <div
          className="h-40 w-full shrink-0"
          style={{
            background: activePage.cover.startsWith('#') ? activePage.cover : `url(${activePage.cover}) center/cover`,
          }}
        />
      )}

      {/* Page title area */}
      <div className="px-16 pt-10 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-4xl">{activePage.icon}</span>
        </div>
        <input
          key={activePage.id}
          className="w-full text-4xl font-bold border-none outline-none bg-transparent resize-none"
          style={{ color: 'var(--color-text)', fontFamily: 'inherit' }}
          value={title}
          placeholder="Untitled"
          onChange={handleTitleChange}
        />
      </div>

      {/* BlockNote editor */}
      <div className="flex-1 overflow-y-auto px-12 pb-16">
        <BlockNoteView
          editor={editor}
          onChange={handleEditorChange}
          theme="light"
        />
      </div>
    </div>
  )
}
