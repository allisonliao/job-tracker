import type { StatusChangeResponse } from '../../types/application'

interface StatusHistoryListProps {
  history: StatusChangeResponse[]
}

export function StatusHistoryList({ history }: StatusHistoryListProps) {
  if (history.length === 0) return <p>No status changes recorded yet.</p>

  return (
    <ul>
      {history.map((change) => (
        <li key={change.changedAt}>
          {new Date(change.changedAt).toLocaleString()}: {change.fromStatus ?? '(none)'} →{' '}
          {change.toStatus}
          {change.note ? ` — ${change.note}` : ''}
        </li>
      ))}
    </ul>
  )
}
