import { useState } from 'react'
import type { FormEvent } from 'react'
import type { JobPostingRequest } from '../../types/jobPosting'

interface JobPostingFormProps {
  onSubmit: (request: JobPostingRequest) => Promise<void>
}

const emptyForm: JobPostingRequest = {
  title: '',
  url: '',
  location: '',
  dateFound: '',
  applicationDeadline: '',
}

export function JobPostingForm({ onSubmit }: JobPostingFormProps) {
  const [form, setForm] = useState<JobPostingRequest>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.title.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        ...form,
        dateFound: form.dateFound || null,
        applicationDeadline: form.applicationDeadline || null,
      })
      setForm(emptyForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job posting')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        aria-label="Job title"
        placeholder="Job title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <input
        aria-label="URL"
        placeholder="URL"
        value={form.url ?? ''}
        onChange={(e) => setForm({ ...form, url: e.target.value })}
      />
      <input
        aria-label="Location"
        placeholder="Location"
        value={form.location ?? ''}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      <label>
        Date found
        <input
          type="date"
          value={form.dateFound ?? ''}
          onChange={(e) => setForm({ ...form, dateFound: e.target.value })}
        />
      </label>
      <label>
        Application deadline
        <input
          type="date"
          value={form.applicationDeadline ?? ''}
          onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
        />
      </label>
      <button type="submit" disabled={submitting}>
        Add job posting
      </button>
      {error && <span role="alert">{error}</span>}
    </form>
  )
}
