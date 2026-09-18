import { Link } from 'react-router'
import type { ApplicationResponse } from '../../types/application'

interface UpcomingFollowUpsListProps {
  applications: ApplicationResponse[]
  companyNameById: Map<string, string>
}

export function UpcomingFollowUpsList({ applications, companyNameById }: UpcomingFollowUpsListProps) {
  if (applications.length === 0) return <p>Nothing to follow up on right now.</p>

  return (
    <ul>
      {applications.map((application) => (
        <li key={application.applicationId}>
          <Link to={`/applications/${application.applicationId}`}>
            {companyNameById.get(application.companyId) ?? application.companyId}
          </Link>{' '}
          — follow up by {application.followUpDate}
        </li>
      ))}
    </ul>
  )
}
