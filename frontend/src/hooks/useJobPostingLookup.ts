import { useMemo } from 'react'
import { listJobPostings } from '../api/jobPostings'
import type { ApplicationResponse } from '../types/application'
import type { JobPostingResponse } from '../types/jobPosting'
import { useAsyncData } from './useAsyncData'

/**
 * Builds a jobPostingId -> JobPostingResponse map by fetching job postings once
 * per distinct companyId present in `applications`, not once per application —
 * avoids a real N+1 when there are many applications against few companies.
 */
export function useJobPostingLookup(applications: ApplicationResponse[]) {
  const distinctCompanyIds = useMemo(
    () => Array.from(new Set(applications.map((application) => application.companyId))).sort(),
    [applications],
  )
  const key = distinctCompanyIds.join(',')

  return useAsyncData(
    async () => {
      const results = await Promise.all(distinctCompanyIds.map((companyId) => listJobPostings(companyId)))
      const map = new Map<string, JobPostingResponse>()
      results.flat().forEach((job) => map.set(job.jobId, job))
      return map
    },
    [key],
    distinctCompanyIds.length > 0,
  )
}
