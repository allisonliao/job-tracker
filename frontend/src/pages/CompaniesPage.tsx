import { useState } from 'react'
import { createCompany } from '../api/companies'
import { CompanyDetailSection } from '../components/companies/CompanyDetailSection'
import { CompanyForm } from '../components/companies/CompanyForm'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useCompanies } from '../hooks/useCompanies'

export function CompaniesPage() {
  const { data: companies, loading, error, refetch } = useCompanies()
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null)

  return (
    <div>
      <h2>Companies</h2>

      <CompanyForm
        onSubmit={async (request) => {
          await createCompany(request)
          refetch()
        }}
      />

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {companies && companies.length === 0 && <p>No companies yet — add one above.</p>}

      {companies && companies.length > 0 && (
        <ul className="company-list">
          {companies.map((company) => {
            const isExpanded = expandedCompanyId === company.companyId
            return (
              <li key={company.companyId}>
                <button
                  type="button"
                  onClick={() => setExpandedCompanyId(isExpanded ? null : company.companyId)}
                >
                  {isExpanded ? '▾' : '▸'} {company.name}
                  {company.industry ? ` (${company.industry})` : ''}
                </button>
                {isExpanded && <CompanyDetailSection companyId={company.companyId} />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
