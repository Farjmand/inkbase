import { useCallback, useEffect, useRef, useState } from 'react'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import '@blocknote/mantine/style.css'
import { useVaultStore } from '../../store/vaultStore'
import { useUIStore } from '../../store/uiStore'
import { PageHeader } from './PageHeader'
import { DatabaseView } from '../database/DatabaseView'

export function PageEditor() {
  const { activePage, updatePage } = useVaultStore()
  const { dark } = useUIStore()
  const [title, setTitle] = useState(activePage?.title ?? '')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useCreateBlockNote({ initialContent: undefined })

  useEffect(() => {
    setTitle(activePage?.title ?? '')
  }, [activePage?.id])

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (activePage) updatePage(activePage.id, { title: val })
    }, 600)
  }

  const handleEditorChange = useCallback(() => {
    if (!activePage) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const markdown = editor.blocksToMarkdownLossy(editor.document)
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

  // Database pages get their own full-screen view
  if (activePage.type === 'database') {
    return <DatabaseView />
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="flex-1 overflow-y-auto">
        <PageHeader title={title} onTitleChange={handleTitleChange} />
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
