export interface CompanyResponse {
  companyId: string
  name: string
  website: string | null
  industry: string | null
  notes: string | null
}

export interface CompanyRequest {
  name: string
  website?: string | null
  industry?: string | null
  notes?: string | null
}
