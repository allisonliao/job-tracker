import { Link } from 'react-router'
import type { UpcomingDeadline } from '../../lib/upcomingDeadlines'

interface UpcomingDeadlinesListProps {
  deadlines: UpcomingDeadline[]
}

const KIND_LABELS: Record<UpcomingDeadline['kind'], string> = {
  OFFER_DECISION: 'Offer decision due',
}

export function UpcomingDeadlinesList({ deadlines }: UpcomingDeadlinesListProps) {
  if (deadlines.length === 0) return <p>No upcoming deadlines.</p>

  return (
    <ul>
      {deadlines.map((deadline, index) => (
        <li key={`${deadline.applicationId}-${deadline.kind}-${index}`}>
          <Link to={`/applications/${deadline.applicationId}`}>{deadline.companyName}</Link>{' '}
          — {KIND_LABELS[deadline.kind]}: {deadline.dueDate}
        </li>
      ))}
    </ul>
  )
}
