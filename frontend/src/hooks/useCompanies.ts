import { listCompanies } from '../api/companies'
import { useAsyncData } from './useAsyncData'

export function useCompanies() {
  return useAsyncData(() => listCompanies(), [])
}
