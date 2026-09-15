import { useMemo } from 'react'
import { Link } from 'react-router'
import { ApplicationTable } from '../components/applications/ApplicationTable'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useApplications } from '../hooks/useApplications'
import { useCompanies } from '../hooks/useCompanies'

export function ApplicationsListPage() {
  const applications = useApplications()
  const companies = useCompanies()

  const companyNameById = useMemo(
    () => new Map((companies.data ?? []).map((company) => [company.companyId, company.name])),
    [companies.data],
  )

  const loading = applications.loading || companies.loading
  const error = applications.error ?? companies.error

  return (
    <div>
      <h2>Applications</h2>
      <p>
        <Link to="/applications/new">+ New application</Link>
      </p>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {applications.data && applications.data.length === 0 && (
        <p>No applications yet — add one above.</p>
      )}

      {applications.data && applications.data.length > 0 && (
        <ApplicationTable applications={applications.data} companyNameById={companyNameById} />
      )}
    </div>
  )
}
