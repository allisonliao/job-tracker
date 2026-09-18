import type { ApplicationSummary } from '../../lib/applicationSummary'

interface SummaryCardsProps {
  summary: ApplicationSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="summary-cards">
      <div className="summary-card">
        <strong>{summary.total}</strong>
        <span>Total applications</span>
      </div>
      <div className="summary-card">
        <strong>{summary.active}</strong>
        <span>Active</span>
      </div>
      {Object.entries(summary.countsByStatus).map(([status, count]) => (
        <div className="summary-card" key={status}>
          <strong>{count}</strong>
          <span>{status}</span>
        </div>
      ))}
    </div>
  )
}
