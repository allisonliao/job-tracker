import { screen, within } from '@testing-library/react'
import type { ApplicationResponse } from '../types/application'
import { renderWithRouter } from '../test/testUtils'
import { DashboardPage } from './DashboardPage'

const { listApplicationsMock, listUpcomingFollowUpsMock } = vi.hoisted(() => ({
  listApplicationsMock: vi.fn(),
  listUpcomingFollowUpsMock: vi.fn(),
}))

vi.mock('../api/applications', () => ({
  listApplications: listApplicationsMock,
  listUpcomingFollowUps: listUpcomingFollowUpsMock,
}))

const application: ApplicationResponse = {
  applicationId: 'a1',
  companyName: 'Acme Corp',
  applicationLink: null,
  currentStatus: 'Applied',
  dateApplied: '2026-09-01',
  lastContactDate: null,
  followUpDate: null,
  offerDecisionDeadline: null,
}

describe('DashboardPage', () => {
  beforeEach(() => {
    listApplicationsMock.mockReset()
    listUpcomingFollowUpsMock.mockReset()
  })

  it('shows summary counts once data has loaded', async () => {
    listApplicationsMock.mockResolvedValue([application])
    listUpcomingFollowUpsMock.mockResolvedValue([])

    renderWithRouter(<DashboardPage />)

    const totalLabel = await screen.findByText('Total applications')
    const totalCard = totalLabel.closest('.summary-card') as HTMLElement
    expect(within(totalCard).getByText('1')).toBeInTheDocument()
  })

  it('shows an empty-state message when there are no upcoming follow-ups', async () => {
    listApplicationsMock.mockResolvedValue([application])
    listUpcomingFollowUpsMock.mockResolvedValue([])

    renderWithRouter(<DashboardPage />)

    expect(await screen.findByText('Nothing to follow up on right now.')).toBeInTheDocument()
  })

  it('shows an upcoming follow-up with the company name', async () => {
    listApplicationsMock.mockResolvedValue([application])
    listUpcomingFollowUpsMock.mockResolvedValue([{ ...application, followUpDate: '2026-09-09' }])

    renderWithRouter(<DashboardPage />)

    expect(await screen.findByRole('link', { name: 'Acme Corp' })).toBeInTheDocument()
    expect(screen.getByText(/follow up by 2026-09-09/)).toBeInTheDocument()
  })
})
