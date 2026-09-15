import { Link } from 'react-router'
import type { ApplicationResponse } from '../../types/application'

interface ApplicationTableProps {
  applications: ApplicationResponse[]
  companyNameById: Map<string, string>
}

export function ApplicationTable({ applications, companyNameById }: ApplicationTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Company</th>
          <th>Status</th>
          <th>Date applied</th>
          <th>Follow-up</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((application) => (
          <tr key={application.applicationId}>
            <td>
              <Link to={`/applications/${application.applicationId}`}>
                {companyNameById.get(application.companyId) ?? application.companyId}
              </Link>
            </td>
            <td>{application.currentStatus}</td>
            <td>{application.dateApplied ?? '—'}</td>
            <td>{application.followUpDate ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
