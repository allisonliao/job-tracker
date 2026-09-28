import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCompanies } from '../../hooks/useCompanies'
import { useJobPostings } from '../../hooks/useJobPostings'
import { COMMON_STATUSES } from '../../lib/statusOptions'
import type { ApplicationRequest } from '../../types/application'

interface ApplicationFormProps {
  initialValues?: ApplicationRequest
  onSubmit: (request: ApplicationRequest) => Promise<void>
  submitLabel?: string
}

interface FormState {
  companyId: string
  jobPostingId: string
  currentStatus: string
  dateApplied: string
  lastContactDate: string
  followUpDate: string
  offerDecisionDeadline: string
}

function toFormState(request?: ApplicationRequest): FormState {
  return {
    companyId: request?.companyId ?? '',
    jobPostingId: request?.jobPostingId ?? '',
    currentStatus: request?.currentStatus ?? '',
    dateApplied: request?.dateApplied ?? '',
    lastContactDate: request?.lastContactDate ?? '',
    followUpDate: request?.followUpDate ?? '',
    offerDecisionDeadline: request?.offerDecisionDeadline ?? '',
  }
}

function toRequest(form: FormState): ApplicationRequest {
  return {
    companyId: form.companyId,
    jobPostingId: form.jobPostingId || null,
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

  const companies = useCompanies()
  const jobPostings = useJobPostings(form.companyId)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.companyId || !form.currentStatus.trim()) return

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
        <select
          value={form.companyId}
          onChange={(e) => setForm({ ...form, companyId: e.target.value, jobPostingId: '' })}
          required
        >
          <option value="">Select a company</option>
          {companies.data?.map((company) => (
            <option key={company.companyId} value={company.companyId}>
              {company.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Job posting
        <select
          value={form.jobPostingId}
          onChange={(e) => setForm({ ...form, jobPostingId: e.target.value })}
          disabled={!form.companyId}
        >
          <option value="">(none)</option>
          {jobPostings.data?.map((job) => (
            <option key={job.jobId} value={job.jobId}>
              {job.title}
            </option>
          ))}
        </select>
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
