import { useState } from 'react'
import type { FormEvent } from 'react'
import { COMMON_STATUSES } from '../../lib/statusOptions'
import type { StatusChangeRequest } from '../../types/application'

interface StatusChangeFormProps {
  currentStatus: string
  onSubmit: (request: StatusChangeRequest) => Promise<void>
}

export function StatusChangeForm({ currentStatus, onSubmit }: StatusChangeFormProps) {
  const [newStatus, setNewStatus] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!newStatus.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ newStatus, note: note || null })
      setNewStatus('')
      setNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change status')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <label>
        Change status from <strong>{currentStatus}</strong> to
        <input
          list="status-change-options"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          required
        />
        <datalist id="status-change-options">
          {COMMON_STATUSES.map((status) => (
            <option key={status} value={status} />
          ))}
        </datalist>
      </label>
      <input
        aria-label="Note"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button type="submit" disabled={submitting}>
        Change status
      </button>
      {error && <span role="alert">{error}</span>}
    </form>
  )
}
