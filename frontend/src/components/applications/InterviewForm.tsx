import { useState } from 'react'
import type { FormEvent } from 'react'
import type { InterviewRequest } from '../../types/application'

interface InterviewFormProps {
  onSubmit: (request: InterviewRequest) => Promise<void>
}

export function InterviewForm({ onSubmit }: InterviewFormProps) {
  const [interviewDate, setInterviewDate] = useState('')
  const [roundType, setRoundType] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!interviewDate) return

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        interviewDate: new Date(interviewDate).toISOString(),
        roundType: roundType || null,
        notes: notes || null,
      })
      setInterviewDate('')
      setRoundType('')
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add interview')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <label>
        Interview date/time
        <input
          type="datetime-local"
          value={interviewDate}
          onChange={(e) => setInterviewDate(e.target.value)}
          required
        />
      </label>
      <input
        aria-label="Round type"
        placeholder="Round type (e.g. Phone Screen)"
        value={roundType}
        onChange={(e) => setRoundType(e.target.value)}
      />
      <input
        aria-label="Interview notes"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button type="submit" disabled={submitting}>
        Add interview
      </button>
      {error && <span role="alert">{error}</span>}
    </form>
  )
}
