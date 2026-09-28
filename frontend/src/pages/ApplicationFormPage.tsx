import { useNavigate, useParams } from 'react-router'
import { createApplication, updateApplication } from '../api/applications'
import { ApplicationForm } from '../components/applications/ApplicationForm'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useApplication } from '../hooks/useApplication'
import type { ApplicationRequest } from '../types/application'

export function ApplicationFormPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const isEditMode = Boolean(applicationId)
  const navigate = useNavigate()

  const { data: existing, loading, error } = useApplication(applicationId ?? '')

  if (isEditMode && loading) return <LoadingSpinner />
  if (isEditMode && error) return <ErrorMessage message={error} />

  async function handleSubmit(request: ApplicationRequest) {
    if (isEditMode && applicationId) {
      await updateApplication(applicationId, request)
      navigate(`/applications/${applicationId}`)
    } else {
      const created = await createApplication(request)
      navigate(`/applications/${created.applicationId}`)
    }
  }

  const initialValues: ApplicationRequest | undefined =
    isEditMode && existing
      ? {
          companyName: existing.companyName,
          applicationLink: existing.applicationLink,
          currentStatus: existing.currentStatus,
          dateApplied: existing.dateApplied,
          lastContactDate: existing.lastContactDate,
          followUpDate: existing.followUpDate,
          offerDecisionDeadline: existing.offerDecisionDeadline,
        }
      : undefined

  return (
    <div>
      <h2>{isEditMode ? 'Edit application' : 'New application'}</h2>
      <ApplicationForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={isEditMode ? 'Save changes' : 'Create application'}
      />
    </div>
  )
}
