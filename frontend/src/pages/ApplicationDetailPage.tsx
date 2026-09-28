import { Link, useParams } from 'react-router'
import { addInterview, addNote, changeApplicationStatus } from '../api/applications'
import { InterviewForm } from '../components/applications/InterviewForm'
import { InterviewList } from '../components/applications/InterviewList'
import { NoteForm } from '../components/applications/NoteForm'
import { NoteList } from '../components/applications/NoteList'
import { StatusChangeForm } from '../components/applications/StatusChangeForm'
import { StatusHistoryList } from '../components/applications/StatusHistoryList'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useApplication } from '../hooks/useApplication'

export function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const { data: application, loading, error, refetch } = useApplication(applicationId ?? '')

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!application) return null

  return (
    <div>
      <h2>{application.companyName}</h2>
      <p>
        <Link to={`/applications/${application.applicationId}/edit`}>Edit</Link>
      </p>

      <dl>
        <dt>Status</dt>
        <dd>{application.currentStatus}</dd>
        <dt>Application link</dt>
        <dd>
          {application.applicationLink ? (
            <a href={application.applicationLink} target="_blank" rel="noreferrer">
              {application.applicationLink}
            </a>
          ) : (
            '—'
          )}
        </dd>
        <dt>Date applied</dt>
        <dd>{application.dateApplied ?? '—'}</dd>
        <dt>Last contact</dt>
        <dd>{application.lastContactDate ?? '—'}</dd>
        <dt>Follow-up date</dt>
        <dd>{application.followUpDate ?? '—'}</dd>
        <dt>Offer decision deadline</dt>
        <dd>{application.offerDecisionDeadline ?? '—'}</dd>
      </dl>

      <StatusChangeForm
        currentStatus={application.currentStatus}
        onSubmit={async (request) => {
          await changeApplicationStatus(application.applicationId, request)
          refetch()
        }}
      />

      <section>
        <h3>Status history</h3>
        <StatusHistoryList history={application.statusHistory} />
      </section>

      <section>
        <h3>Interviews</h3>
        <InterviewList interviews={application.interviews} />
        <InterviewForm
          onSubmit={async (request) => {
            await addInterview(application.applicationId, request)
            refetch()
          }}
        />
      </section>

      <section>
        <h3>Notes</h3>
        <NoteList notes={application.notes} />
        <NoteForm
          onSubmit={async (request) => {
            await addNote(application.applicationId, request)
            refetch()
          }}
        />
      </section>
    </div>
  )
}
