import type { ApplicationResponse } from '../types/application'
import type { JobPostingResponse } from '../types/jobPosting'

export type DeadlineKind = 'OFFER_DECISION' | 'APPLICATION_DEADLINE'

export interface UpcomingDeadline {
  applicationId: string
  companyId: string
  kind: DeadlineKind
  dueDate: string
}

/**
 * Merges each application's own offerDecisionDeadline with its job posting's
 * applicationDeadline (resolved via jobPostingById), keeping only dates on or
 * before `cutoff`. ISO date strings ("yyyy-MM-dd") sort and compare correctly
 * as plain strings, so no date parsing is needed here.
 */
export function computeUpcomingDeadlines(
  applications: ApplicationResponse[],
  jobPostingById: Map<string, JobPostingResponse>,
  cutoff: string,
): UpcomingDeadline[] {
  const deadlines: UpcomingDeadline[] = []

  for (const application of applications) {
    if (application.offerDecisionDeadline && application.offerDecisionDeadline <= cutoff) {
      deadlines.push({
        applicationId: application.applicationId,
        companyId: application.companyId,
        kind: 'OFFER_DECISION',
        dueDate: application.offerDecisionDeadline,
      })
    }

    if (application.jobPostingId) {
      const posting = jobPostingById.get(application.jobPostingId)
      if (posting?.applicationDeadline && posting.applicationDeadline <= cutoff) {
        deadlines.push({
          applicationId: application.applicationId,
          companyId: application.companyId,
          kind: 'APPLICATION_DEADLINE',
          dueDate: posting.applicationDeadline,
        })
      }
    }
  }

  return deadlines.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}
