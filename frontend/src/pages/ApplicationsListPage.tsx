import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ApplicationFilters } from '../components/applications/ApplicationFilters'
import { ApplicationTable } from '../components/applications/ApplicationTable'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useApplications } from '../hooks/useApplications'

export function ApplicationsListPage() {
  const applications = useApplications()

  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const statusOptions = useMemo(
    () => Array.from(new Set((applications.data ?? []).map((application) => application.currentStatus))).sort(),
    [applications.data],
  )

  const filteredApplications = useMemo(() => {
    if (!applications.data) return []
    const searchLower = search.trim().toLowerCase()

    return applications.data.filter((application) => {
      if (status && application.currentStatus !== status) return false
      if (searchLower && !application.companyName.toLowerCase().includes(searchLower)) return false
      return true
    })
  }, [applications.data, status, search])

  return (
    <div>
      <h2>Applications</h2>
      <p>
        <Link to="/applications/new">+ New application</Link>
      </p>

      {applications.data && applications.data.length > 0 && (
        <ApplicationFilters
          statusOptions={statusOptions}
          status={status}
          search={search}
          onStatusChange={setStatus}
          onSearchChange={setSearch}
        />
      )}

      {applications.loading && <LoadingSpinner />}
      {applications.error && <ErrorMessage message={applications.error} />}

      {applications.data && applications.data.length === 0 && (
        <p>No applications yet — add one above.</p>
      )}

      {applications.data && applications.data.length > 0 && filteredApplications.length === 0 && (
        <p>No applications match your filters.</p>
      )}

      {filteredApplications.length > 0 && <ApplicationTable applications={filteredApplications} />}
    </div>
  )
}
