import { listContacts } from '../api/contacts'
import { useAsyncData } from './useAsyncData'

export function useContacts(companyId: string) {
  return useAsyncData(() => listContacts(companyId), [companyId])
}
