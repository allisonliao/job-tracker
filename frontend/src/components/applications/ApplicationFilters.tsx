import type { CompanyResponse } from '../../types/company'

interface ApplicationFiltersProps {
  statusOptions: string[]
  companies: CompanyResponse[]
  status: string
  companyId: string
  search: string
  onStatusChange: (status: string) => void
  onCompanyChange: (companyId: string) => void
  onSearchChange: (search: string) => void
}

export function ApplicationFilters({
  statusOptions,
  companies,
  status,
  companyId,
  search,
  onStatusChange,
  onCompanyChange,
  onSearchChange,
}: ApplicationFiltersProps) {
  return (
    <div className="filters">
      <label>
        Status
        <select value={status} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="">All statuses</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        Company
        <select value={companyId} onChange={(e) => onCompanyChange(e.target.value)}>
          <option value="">All companies</option>
          {companies.map((company) => (
            <option key={company.companyId} value={company.companyId}>
              {company.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Search
        <input
          type="search"
          placeholder="Search company or job title"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>
    </div>
  )
}
