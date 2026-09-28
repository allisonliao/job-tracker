import type { ApplicationResponse } from '../types/application'
import { computeApplicationSummary } from './applicationSummary'

function application(overrides: Partial<ApplicationResponse>): ApplicationResponse {
  return {
    applicationId: 'a',
    companyName: 'Acme Co',
    applicationLink: null,
    currentStatus: 'Applied',
    dateApplied: null,
    lastContactDate: null,
    followUpDate: null,
    offerDecisionDeadline: null,
    ...overrides,
  }
}

describe('computeApplicationSummary', () => {
  it('counts applications by status and total', () => {
    const summary = computeApplicationSummary([
      application({ currentStatus: 'Applied' }),
      application({ currentStatus: 'Applied' }),
      application({ currentStatus: 'Interviewing' }),
    ])

    expect(summary.total).toBe(3)
    expect(summary.countsByStatus).toEqual({ Applied: 2, Interviewing: 1 })
  })

  it('treats terminal statuses as not active', () => {
    const summary = computeApplicationSummary([
      application({ currentStatus: 'Applied' }),
      application({ currentStatus: 'Rejected' }),
      application({ currentStatus: 'Offer Accepted' }),
    ])

    expect(summary.active).toBe(1)
  })

  it('returns zeroed summary for an empty list', () => {
    const summary = computeApplicationSummary([])

    expect(summary).toEqual({ total: 0, active: 0, countsByStatus: {} })
  })
})
