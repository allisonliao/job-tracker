import type { ApplicationResponse } from '../types/application'

export type DeadlineKind = 'OFFER_DECISION'

export interface UpcomingDeadline {
  applicationId: string
  companyName: string
  kind: DeadlineKind
  dueDate: string
}

/**
 * Pulls each application's offerDecisionDeadline, keeping only dates on or before
 * `cutoff`. ISO date strings ("yyyy-MM-dd") sort and compare correctly as plain
 * strings, so no date parsing is needed here.
 */
export function computeUpcomingDeadlines(applications: ApplicationResponse[], cutoff: string): UpcomingDeadline[] {
  const deadlines: UpcomingDeadline[] = []

  for (const application of applications) {
    if (application.offerDecisionDeadline && application.offerDecisionDeadline <= cutoff) {
      deadlines.push({
        applicationId: application.applicationId,
        companyName: application.companyName,
        kind: 'OFFER_DECISION',
        dueDate: application.offerDecisionDeadline,
      })
    }
  }

  return deadlines.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}
