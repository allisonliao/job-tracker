import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ContactRequest } from '../../types/contact'

interface ContactFormProps {
  onSubmit: (request: ContactRequest) => Promise<void>
}

const emptyForm: ContactRequest = { name: '', role: '', email: '', phone: '' }

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [form, setForm] = useState<ContactRequest>(emptyForm)
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
      setError(err instanceof Error ? err.message : 'Failed to save contact')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        aria-label="Contact name"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        aria-label="Role"
        placeholder="Role"
        value={form.role ?? ''}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      />
      <input
        aria-label="Email"
        placeholder="Email"
        value={form.email ?? ''}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        aria-label="Phone"
        placeholder="Phone"
        value={form.phone ?? ''}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <button type="submit" disabled={submitting}>
        Add contact
      </button>
      {error && <span role="alert">{error}</span>}
    </form>
  )
}
