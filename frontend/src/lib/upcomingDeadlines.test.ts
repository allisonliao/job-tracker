import type { ApplicationResponse } from '../types/application'
import { computeUpcomingDeadlines } from './upcomingDeadlines'

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

describe('computeUpcomingDeadlines', () => {
  it('includes an offer decision deadline on or before the cutoff', () => {
    const result = computeUpcomingDeadlines(
      [application({ applicationId: 'a1', offerDecisionDeadline: '2026-09-05' })],
      '2026-09-10',
    )

    expect(result).toEqual([
      { applicationId: 'a1', companyName: 'Acme Co', kind: 'OFFER_DECISION', dueDate: '2026-09-05' },
    ])
  })

  it('excludes deadlines after the cutoff', () => {
    const result = computeUpcomingDeadlines(
      [application({ applicationId: 'a1', offerDecisionDeadline: '2026-12-01' })],
      '2026-09-10',
    )

    expect(result).toEqual([])
  })

  it('sorts multiple deadlines by date', () => {
    const result = computeUpcomingDeadlines(
      [
        application({ applicationId: 'a1', offerDecisionDeadline: '2026-09-07' }),
        application({ applicationId: 'a2', offerDecisionDeadline: '2026-09-03' }),
      ],
      '2026-09-10',
    )

    expect(result.map((d) => d.applicationId)).toEqual(['a2', 'a1'])
  })

  it('returns nothing for applications with no deadline at all', () => {
    const result = computeUpcomingDeadlines([application({})], '2026-09-10')

    expect(result).toEqual([])
  })
})
