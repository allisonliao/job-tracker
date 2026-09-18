import { screen, within } from '@testing-library/react'
import type { ApplicationResponse } from '../types/application'
import type { CompanyResponse } from '../types/company'
import type { JobPostingResponse } from '../types/jobPosting'
import { renderWithRouter } from '../test/testUtils'
import { DashboardPage } from './DashboardPage'

const { listApplicationsMock, listCompaniesMock, listJobPostingsMock, listUpcomingFollowUpsMock } = vi.hoisted(
  () => ({
    listApplicationsMock: vi.fn(),
    listCompaniesMock: vi.fn(),
    listJobPostingsMock: vi.fn(),
    listUpcomingFollowUpsMock: vi.fn(),
  }),
)

vi.mock('../api/applications', () => ({
  listApplications: listApplicationsMock,
  listUpcomingFollowUps: listUpcomingFollowUpsMock,
}))

vi.mock('../api/companies', () => ({
  listCompanies: listCompaniesMock,
}))

vi.mock('../api/jobPostings', () => ({
  listJobPostings: listJobPostingsMock,
}))

const company: CompanyResponse = {
  companyId: 'c1',
  name: 'Acme Corp',
  website: null,
  industry: null,
  notes: null,
}

const jobPosting: JobPostingResponse = {
  jobId: 'j1',
  companyId: 'c1',
  title: 'Backend Engineer',
  url: null,
  location: null,
  dateFound: null,
  applicationDeadline: '2026-01-01', // far in the past relative to "now" so it never appears
}

const application: ApplicationResponse = {
  applicationId: 'a1',
  companyId: 'c1',
  jobPostingId: 'j1',
  currentStatus: 'Applied',
  dateApplied: '2026-09-01',
  lastContactDate: null,
  followUpDate: null,
  offerDecisionDeadline: null,
}

describe('DashboardPage', () => {
  beforeEach(() => {
    listApplicationsMock.mockReset()
    listCompaniesMock.mockReset()
    listJobPostingsMock.mockReset()
    listUpcomingFollowUpsMock.mockReset()
    listJobPostingsMock.mockResolvedValue([jobPosting])
  })

  it('shows summary counts once data has loaded', async () => {
    listApplicationsMock.mockResolvedValue([application])
    listCompaniesMock.mockResolvedValue([company])
    listUpcomingFollowUpsMock.mockResolvedValue([])

    renderWithRouter(<DashboardPage />)

    const totalLabel = await screen.findByText('Total applications')
    const totalCard = totalLabel.closest('.summary-card') as HTMLElement
    expect(within(totalCard).getByText('1')).toBeInTheDocument()
  })

  it('shows an empty-state message when there are no upcoming follow-ups', async () => {
    listApplicationsMock.mockResolvedValue([application])
    listCompaniesMock.mockResolvedValue([company])
    listUpcomingFollowUpsMock.mockResolvedValue([])

    renderWithRouter(<DashboardPage />)

    expect(await screen.findByText('Nothing to follow up on right now.')).toBeInTheDocument()
  })

  it('shows an upcoming follow-up with the resolved company name', async () => {
    listApplicationsMock.mockResolvedValue([application])
    listCompaniesMock.mockResolvedValue([company])
    listUpcomingFollowUpsMock.mockResolvedValue([{ ...application, followUpDate: '2026-09-09' }])

    renderWithRouter(<DashboardPage />)

    expect(await screen.findByRole('link', { name: 'Acme Corp' })).toBeInTheDocument()
    expect(screen.getByText(/follow up by 2026-09-09/)).toBeInTheDocument()
  })
})
