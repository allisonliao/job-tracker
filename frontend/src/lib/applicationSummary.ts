import { isTerminalStatus } from './statusOptions'
import type { ApplicationResponse } from '../types/application'

export interface ApplicationSummary {
  total: number
  active: number
  countsByStatus: Record<string, number>
}

export function computeApplicationSummary(applications: ApplicationResponse[]): ApplicationSummary {
  const countsByStatus: Record<string, number> = {}
  let active = 0

  for (const application of applications) {
    countsByStatus[application.currentStatus] = (countsByStatus[application.currentStatus] ?? 0) + 1
    if (!isTerminalStatus(application.currentStatus)) active += 1
  }

  return { total: applications.length, active, countsByStatus }
}
