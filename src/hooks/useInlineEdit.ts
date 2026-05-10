import { useEffect, useRef, useState } from 'react'

export function useInlineEdit<T>(initialValue: T, onCommit: (value: T) => void) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<T>(initialValue)
  const onCommitRef = useRef(onCommit)
  const initialValueRef = useRef(initialValue)
  // Sync after every render so callbacks/cancel never close over stale prop values
  useEffect(() => { onCommitRef.current = onCommit })
  useEffect(() => { initialValueRef.current = initialValue })

  function startEdit(override?: T) {
    setDraft(override ?? initialValueRef.current)
    setEditing(true)
  }

  function commit() {
    setEditing(false)
    onCommitRef.current(draft)
  }

  function cancel() {
    setEditing(false)
    setDraft(initialValueRef.current)
  }

  return { editing, draft, setDraft, startEdit, commit, cancel }
}
