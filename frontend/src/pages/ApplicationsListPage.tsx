import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ApplicationFilters } from '../components/applications/ApplicationFilters'
import { ApplicationTable } from '../components/applications/ApplicationTable'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useApplications } from '../hooks/useApplications'
import { useCompanies } from '../hooks/useCompanies'
import { useJobPostingLookup } from '../hooks/useJobPostingLookup'

export function ApplicationsListPage() {
  const applications = useApplications()
  const companies = useCompanies()
  const jobPostingLookup = useJobPostingLookup(applications.data ?? [])

  const [status, setStatus] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [search, setSearch] = useState('')

  const companyNameById = useMemo(
    () => new Map((companies.data ?? []).map((company) => [company.companyId, company.name])),
    [companies.data],
  )

  const statusOptions = useMemo(
    () => Array.from(new Set((applications.data ?? []).map((application) => application.currentStatus))).sort(),
    [applications.data],
  )

  const filteredApplications = useMemo(() => {
    if (!applications.data) return []
    const searchLower = search.trim().toLowerCase()

    return applications.data.filter((application) => {
      if (status && application.currentStatus !== status) return false
      if (companyId && application.companyId !== companyId) return false

      if (searchLower) {
        const companyName = companyNameById.get(application.companyId) ?? ''
        const jobTitle = application.jobPostingId
          ? (jobPostingLookup.data?.get(application.jobPostingId)?.title ?? '')
          : ''
        const haystack = `${companyName} ${jobTitle}`.toLowerCase()
        if (!haystack.includes(searchLower)) return false
      }

      return true
    })
  }, [applications.data, status, companyId, search, companyNameById, jobPostingLookup.data])

  const loading = applications.loading || companies.loading
  const error = applications.error ?? companies.error

  return (
    <div>
      <h2>Applications</h2>
      <p>
        <Link to="/applications/new">+ New application</Link>
      </p>

      {applications.data && applications.data.length > 0 && (
        <ApplicationFilters
          statusOptions={statusOptions}
          companies={companies.data ?? []}
          status={status}
          companyId={companyId}
          search={search}
          onStatusChange={setStatus}
          onCompanyChange={setCompanyId}
          onSearchChange={setSearch}
        />
      )}

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {applications.data && applications.data.length === 0 && (
        <p>No applications yet — add one above.</p>
      )}

      {applications.data && applications.data.length > 0 && filteredApplications.length === 0 && (
        <p>No applications match your filters.</p>
      )}

      {filteredApplications.length > 0 && (
        <ApplicationTable applications={filteredApplications} companyNameById={companyNameById} />
      )}
    </div>
  )
}
