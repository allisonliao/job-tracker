import { Link } from 'react-router'
import type { ApplicationResponse } from '../../types/application'

interface UpcomingFollowUpsListProps {
  applications: ApplicationResponse[]
}

export function UpcomingFollowUpsList({ applications }: UpcomingFollowUpsListProps) {
  if (applications.length === 0) return <p>Nothing to follow up on right now.</p>

  return (
    <ul>
      {applications.map((application) => (
        <li key={application.applicationId}>
          <Link to={`/applications/${application.applicationId}`}>{application.companyName}</Link>{' '}
          — follow up by {application.followUpDate}
        </li>
      ))}
    </ul>
  )
}
