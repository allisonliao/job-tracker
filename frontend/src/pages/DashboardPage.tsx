import { useMemo } from 'react'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { UpcomingDeadlinesList } from '../components/dashboard/UpcomingDeadlinesList'
import { UpcomingFollowUpsList } from '../components/dashboard/UpcomingFollowUpsList'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useApplications } from '../hooks/useApplications'
import { useCompanies } from '../hooks/useCompanies'
import { useJobPostingLookup } from '../hooks/useJobPostingLookup'
import { useUpcomingFollowUps } from '../hooks/useUpcomingFollowUps'
import { computeApplicationSummary } from '../lib/applicationSummary'
import { computeUpcomingDeadlines } from '../lib/upcomingDeadlines'

export function DashboardPage() {
  const applications = useApplications()
  const companies = useCompanies()
  const followUps = useUpcomingFollowUps()
  const jobPostingLookup = useJobPostingLookup(applications.data ?? [])

  const companyNameById = useMemo(
    () => new Map((companies.data ?? []).map((company) => [company.companyId, company.name])),
    [companies.data],
  )

  const summary = useMemo(() => computeApplicationSummary(applications.data ?? []), [applications.data])

  const deadlines = useMemo(() => {
    const cutoff = new Date().toISOString().slice(0, 10)
    return computeUpcomingDeadlines(applications.data ?? [], jobPostingLookup.data ?? new Map(), cutoff)
  }, [applications.data, jobPostingLookup.data])

  const loading = applications.loading || companies.loading || followUps.loading
  const error = applications.error ?? companies.error ?? followUps.error

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div>
      <h2>Dashboard</h2>

      <SummaryCards summary={summary} />

      <section>
        <h3>Upcoming follow-ups</h3>
        <UpcomingFollowUpsList applications={followUps.data ?? []} companyNameById={companyNameById} />
      </section>

      <section>
        <h3>Upcoming deadlines</h3>
        <UpcomingDeadlinesList deadlines={deadlines} companyNameById={companyNameById} />
      </section>
    </div>
  )
}
