interface ApplicationFiltersProps {
  statusOptions: string[]
  status: string
  search: string
  onStatusChange: (status: string) => void
  onSearchChange: (search: string) => void
}

export function ApplicationFilters({
  statusOptions,
  status,
  search,
  onStatusChange,
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
        Search
        <input
          type="search"
          placeholder="Search by company"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>
    </div>
  )
}
