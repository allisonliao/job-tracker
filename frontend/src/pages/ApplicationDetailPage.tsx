import { Link, useParams } from 'react-router'
import { InterviewList } from '../components/applications/InterviewList'
import { NoteList } from '../components/applications/NoteList'
import { StatusHistoryList } from '../components/applications/StatusHistoryList'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useApplication } from '../hooks/useApplication'
import { useCompany } from '../hooks/useCompany'

export function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const { data: application, loading, error } = useApplication(applicationId ?? '')
  const { data: company } = useCompany(application?.companyId ?? '')

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!application) return null

  return (
    <div>
      <h2>{company?.name ?? application.companyId}</h2>
      <p>
        <Link to={`/applications/${application.applicationId}/edit`}>Edit</Link>
      </p>

      <dl>
        <dt>Status</dt>
        <dd>{application.currentStatus}</dd>
        <dt>Date applied</dt>
        <dd>{application.dateApplied ?? '—'}</dd>
        <dt>Last contact</dt>
        <dd>{application.lastContactDate ?? '—'}</dd>
        <dt>Follow-up date</dt>
        <dd>{application.followUpDate ?? '—'}</dd>
        <dt>Offer decision deadline</dt>
        <dd>{application.offerDecisionDeadline ?? '—'}</dd>
      </dl>

      <section>
        <h3>Status history</h3>
        <StatusHistoryList history={application.statusHistory} />
      </section>

      <section>
        <h3>Interviews</h3>
        <InterviewList interviews={application.interviews} />
      </section>

      <section>
        <h3>Notes</h3>
        <NoteList notes={application.notes} />
      </section>
    </div>
  )
}
