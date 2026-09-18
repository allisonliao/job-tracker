import { Link } from 'react-router'
import type { UpcomingDeadline } from '../../lib/upcomingDeadlines'

interface UpcomingDeadlinesListProps {
  deadlines: UpcomingDeadline[]
  companyNameById: Map<string, string>
}

const KIND_LABELS: Record<UpcomingDeadline['kind'], string> = {
  OFFER_DECISION: 'Offer decision due',
  APPLICATION_DEADLINE: 'Application deadline',
}

export function UpcomingDeadlinesList({ deadlines, companyNameById }: UpcomingDeadlinesListProps) {
  if (deadlines.length === 0) return <p>No upcoming deadlines.</p>

  return (
    <ul>
      {deadlines.map((deadline, index) => (
        <li key={`${deadline.applicationId}-${deadline.kind}-${index}`}>
          <Link to={`/applications/${deadline.applicationId}`}>
            {companyNameById.get(deadline.companyId) ?? deadline.companyId}
          </Link>{' '}
          — {KIND_LABELS[deadline.kind]}: {deadline.dueDate}
        </li>
      ))}
    </ul>
  )
}
