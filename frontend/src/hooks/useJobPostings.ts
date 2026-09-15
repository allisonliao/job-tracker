import { listJobPostings } from '../api/jobPostings'
import { useAsyncData } from './useAsyncData'

export function useJobPostings(companyId: string) {
  return useAsyncData(() => listJobPostings(companyId), [companyId])
}
