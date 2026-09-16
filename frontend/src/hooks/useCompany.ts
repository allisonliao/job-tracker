import { getCompany } from '../api/companies'
import { useAsyncData } from './useAsyncData'

export function useCompany(companyId: string) {
  return useAsyncData(() => getCompany(companyId), [companyId], Boolean(companyId))
}
