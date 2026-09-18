import { useState } from 'react'
import type { FormEvent } from 'react'
import type { NoteRequest } from '../../types/application'

interface NoteFormProps {
  onSubmit: (request: NoteRequest) => Promise<void>
}

export function NoteForm({ onSubmit }: NoteFormProps) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!text.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ text })
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        aria-label="New note"
        placeholder="Add a note"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <button type="submit" disabled={submitting}>
        Add note
      </button>
      {error && <span role="alert">{error}</span>}
    </form>
  )
}
