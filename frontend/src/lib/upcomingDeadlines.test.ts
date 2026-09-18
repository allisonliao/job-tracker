import type { ApplicationResponse } from '../types/application'
import type { JobPostingResponse } from '../types/jobPosting'
import { computeUpcomingDeadlines } from './upcomingDeadlines'

function application(overrides: Partial<ApplicationResponse>): ApplicationResponse {
  return {
    applicationId: 'a',
    companyId: 'c',
    jobPostingId: null,
    currentStatus: 'Applied',
    dateApplied: null,
    lastContactDate: null,
    followUpDate: null,
    offerDecisionDeadline: null,
    ...overrides,
  }
}

function jobPosting(overrides: Partial<JobPostingResponse>): JobPostingResponse {
  return {
    jobId: 'j',
    companyId: 'c',
    title: 'Engineer',
    url: null,
    location: null,
    dateFound: null,
    applicationDeadline: null,
    ...overrides,
  }
}

describe('computeUpcomingDeadlines', () => {
  it('includes an offer decision deadline on or before the cutoff', () => {
    const result = computeUpcomingDeadlines(
      [application({ applicationId: 'a1', offerDecisionDeadline: '2026-09-05' })],
      new Map(),
      '2026-09-10',
    )

    expect(result).toEqual([
      { applicationId: 'a1', companyId: 'c', kind: 'OFFER_DECISION', dueDate: '2026-09-05' },
    ])
  })

  it('excludes deadlines after the cutoff', () => {
    const result = computeUpcomingDeadlines(
      [application({ applicationId: 'a1', offerDecisionDeadline: '2026-12-01' })],
      new Map(),
      '2026-09-10',
    )

    expect(result).toEqual([])
  })

  it('includes a job posting application deadline resolved via the lookup map', () => {
    const jobPostingById = new Map([['j1', jobPosting({ jobId: 'j1', applicationDeadline: '2026-09-08' })]])
    const result = computeUpcomingDeadlines(
      [application({ applicationId: 'a1', jobPostingId: 'j1' })],
      jobPostingById,
      '2026-09-10',
    )

    expect(result).toEqual([
      { applicationId: 'a1', companyId: 'c', kind: 'APPLICATION_DEADLINE', dueDate: '2026-09-08' },
    ])
  })

  it('includes both deadline kinds for the same application and sorts by date', () => {
    const jobPostingById = new Map([['j1', jobPosting({ jobId: 'j1', applicationDeadline: '2026-09-03' })]])
    const result = computeUpcomingDeadlines(
      [application({ applicationId: 'a1', jobPostingId: 'j1', offerDecisionDeadline: '2026-09-07' })],
      jobPostingById,
      '2026-09-10',
    )

    expect(result.map((d) => d.kind)).toEqual(['APPLICATION_DEADLINE', 'OFFER_DECISION'])
  })

  it('returns nothing for applications with no deadlines at all', () => {
    const result = computeUpcomingDeadlines([application({})], new Map(), '2026-09-10')

    expect(result).toEqual([])
  })
})
