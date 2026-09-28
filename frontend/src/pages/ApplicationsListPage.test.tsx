import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ApplicationResponse } from '../types/application'
import { renderWithRouter } from '../test/testUtils'
import { ApplicationsListPage } from './ApplicationsListPage'

const { listApplicationsMock } = vi.hoisted(() => ({
  listApplicationsMock: vi.fn(),
}))

vi.mock('../api/applications', () => ({
  listApplications: listApplicationsMock,
}))

const acmeApplication: ApplicationResponse = {
  applicationId: 'a1',
  companyName: 'Acme Corp',
  applicationLink: null,
  currentStatus: 'Applied',
  dateApplied: '2026-09-01',
  lastContactDate: null,
  followUpDate: '2026-09-10',
  offerDecisionDeadline: null,
}

const globexApplication: ApplicationResponse = {
  applicationId: 'a2',
  companyName: 'Globex Inc',
  applicationLink: null,
  currentStatus: 'Interviewing',
  dateApplied: '2026-09-02',
  lastContactDate: null,
  followUpDate: null,
  offerDecisionDeadline: null,
}

describe('ApplicationsListPage', () => {
  beforeEach(() => {
    listApplicationsMock.mockReset()
  })

  it('shows applications with their company names once loaded', async () => {
    listApplicationsMock.mockResolvedValue([acmeApplication])

    renderWithRouter(<ApplicationsListPage />)

    expect(await screen.findByRole('link', { name: 'Acme Corp' })).toBeInTheDocument()
    expect(screen.getByText('Applied', { selector: 'td' })).toBeInTheDocument()
    expect(screen.getByText('2026-09-01')).toBeInTheDocument()
    expect(screen.getByText('2026-09-10')).toBeInTheDocument()
  })

  it('shows an empty state when there are no applications', async () => {
    listApplicationsMock.mockResolvedValue([])

    renderWithRouter(<ApplicationsListPage />)

    expect(await screen.findByText('No applications yet — add one above.')).toBeInTheDocument()
  })

  it('filters by status', async () => {
    const user = userEvent.setup()
    listApplicationsMock.mockResolvedValue([acmeApplication, globexApplication])

    renderWithRouter(<ApplicationsListPage />)
    await screen.findByRole('link', { name: 'Acme Corp' })

    await user.selectOptions(screen.getByLabelText('Status'), 'Interviewing')

    expect(screen.queryByRole('link', { name: 'Acme Corp' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Globex Inc' })).toBeInTheDocument()
  })

  it('filters by search text matching the company name', async () => {
    const user = userEvent.setup()
    listApplicationsMock.mockResolvedValue([acmeApplication, globexApplication])

    renderWithRouter(<ApplicationsListPage />)
    await screen.findByRole('link', { name: 'Acme Corp' })

    await user.type(screen.getByLabelText('Search'), 'Globex')

    expect(await screen.findByRole('link', { name: 'Globex Inc' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Acme Corp' })).not.toBeInTheDocument()
  })

  it('shows a message when no applications match the current filters', async () => {
    const user = userEvent.setup()
    listApplicationsMock.mockResolvedValue([acmeApplication])

    renderWithRouter(<ApplicationsListPage />)
    await screen.findByRole('link', { name: 'Acme Corp' })

    await user.type(screen.getByLabelText('Search'), 'nonexistent')

    expect(await screen.findByText('No applications match your filters.')).toBeInTheDocument()
  })
})
