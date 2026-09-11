import { api } from './client'
import type { CompanyRequest, CompanyResponse } from '../types/company'

export function listCompanies() {
  return api.get<CompanyResponse[]>('/api/companies')
}

export function getCompany(companyId: string) {
  return api.get<CompanyResponse>(`/api/companies/${companyId}`)
}

export function createCompany(body: CompanyRequest) {
  return api.post<CompanyResponse>('/api/companies', body)
}

export function updateCompany(companyId: string, body: CompanyRequest) {
  return api.put<CompanyResponse>(`/api/companies/${companyId}`, body)
}

export function deleteCompany(companyId: string) {
  return api.delete(`/api/companies/${companyId}`)
}
