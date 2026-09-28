import { useState } from 'react'
import type { FormEvent } from 'react'
import { COMMON_STATUSES } from '../../lib/statusOptions'
import type { ApplicationRequest } from '../../types/application'

interface ApplicationFormProps {
  initialValues?: ApplicationRequest
  onSubmit: (request: ApplicationRequest) => Promise<void>
  submitLabel?: string
}

interface FormState {
  companyName: string
  applicationLink: string
  currentStatus: string
  dateApplied: string
  lastContactDate: string
  followUpDate: string
  offerDecisionDeadline: string
}

function toFormState(request?: ApplicationRequest): FormState {
  return {
    companyName: request?.companyName ?? '',
    applicationLink: request?.applicationLink ?? '',
    currentStatus: request?.currentStatus ?? '',
    dateApplied: request?.dateApplied ?? '',
    lastContactDate: request?.lastContactDate ?? '',
    followUpDate: request?.followUpDate ?? '',
    offerDecisionDeadline: request?.offerDecisionDeadline ?? '',
  }
}

function toRequest(form: FormState): ApplicationRequest {
  return {
    companyName: form.companyName,
    applicationLink: form.applicationLink || null,
    currentStatus: form.currentStatus,
    dateApplied: form.dateApplied || null,
    lastContactDate: form.lastContactDate || null,
    followUpDate: form.followUpDate || null,
    offerDecisionDeadline: form.offerDecisionDeadline || null,
  }
}

export function ApplicationForm({ initialValues, onSubmit, submitLabel = 'Save' }: ApplicationFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialValues))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.companyName.trim() || !form.currentStatus.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(toRequest(form))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save application')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="application-form" onSubmit={handleSubmit}>
      <label>
        Company
        <input
          type="text"
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          required
        />
      </label>

      <label>
        Application link
        <input
          type="url"
          placeholder="https://…"
          value={form.applicationLink}
          onChange={(e) => setForm({ ...form, applicationLink: e.target.value })}
        />
      </label>

      <label>
        Status
        <input
          list="status-options"
          value={form.currentStatus}
          onChange={(e) => setForm({ ...form, currentStatus: e.target.value })}
          required
        />
        <datalist id="status-options">
          {COMMON_STATUSES.map((status) => (
            <option key={status} value={status} />
          ))}
        </datalist>
      </label>

      <label>
        Date applied
        <input
          type="date"
          value={form.dateApplied}
          onChange={(e) => setForm({ ...form, dateApplied: e.target.value })}
        />
      </label>

      <label>
        Last contact date
        <input
          type="date"
          value={form.lastContactDate}
          onChange={(e) => setForm({ ...form, lastContactDate: e.target.value })}
        />
      </label>

      <label>
        Follow-up date
        <input
          type="date"
          value={form.followUpDate}
          onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
        />
      </label>

      <label>
        Offer decision deadline
        <input
          type="date"
          value={form.offerDecisionDeadline}
          onChange={(e) => setForm({ ...form, offerDecisionDeadline: e.target.value })}
        />
      </label>

      <button type="submit" disabled={submitting}>
        {submitLabel}
      </button>
      {error && (
        <span className="error-message" role="alert">
          {error}
        </span>
      )}
    </form>
  )
}
