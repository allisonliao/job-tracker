import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CompanyRequest } from '../../types/company'

interface CompanyFormProps {
  onSubmit: (request: CompanyRequest) => Promise<void>
}

const emptyForm: CompanyRequest = { name: '', website: '', industry: '', notes: '' }

export function CompanyForm({ onSubmit }: CompanyFormProps) {
  const [form, setForm] = useState<CompanyRequest>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(form)
      setForm(emptyForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save company')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        aria-label="Company name"
        placeholder="Company name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        aria-label="Website"
        placeholder="Website"
        value={form.website ?? ''}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
      />
      <input
        aria-label="Industry"
        placeholder="Industry"
        value={form.industry ?? ''}
        onChange={(e) => setForm({ ...form, industry: e.target.value })}
      />
      <input
        aria-label="Notes"
        placeholder="Notes"
        value={form.notes ?? ''}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      <button type="submit" disabled={submitting}>
        Add company
      </button>
      {error && <span role="alert">{error}</span>}
    </form>
  )
}
