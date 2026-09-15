import { screen } from '@testing-library/react'
import type { ApplicationResponse } from '../types/application'
import type { CompanyResponse } from '../types/company'
import { renderWithRouter } from '../test/testUtils'
import { ApplicationsListPage } from './ApplicationsListPage'

const { listApplicationsMock, listCompaniesMock } = vi.hoisted(() => ({
  listApplicationsMock: vi.fn(),
  listCompaniesMock: vi.fn(),
}))

vi.mock('../api/applications', () => ({
  listApplications: listApplicationsMock,
}))

vi.mock('../api/companies', () => ({
  listCompanies: listCompaniesMock,
}))

const company: CompanyResponse = {
  companyId: 'c1',
  name: 'Acme Corp',
  website: null,
  industry: null,
  notes: null,
}

const application: ApplicationResponse = {
  applicationId: 'a1',
  companyId: 'c1',
  jobPostingId: null,
  currentStatus: 'Applied',
  dateApplied: '2026-09-01',
  lastContactDate: null,
  followUpDate: '2026-09-10',
  offerDecisionDeadline: null,
}

describe('ApplicationsListPage', () => {
  beforeEach(() => {
    listApplicationsMock.mockReset()
    listCompaniesMock.mockReset()
  })

  it('shows applications with resolved company names once loaded', async () => {
    listApplicationsMock.mockResolvedValue([application])
    listCompaniesMock.mockResolvedValue([company])

    renderWithRouter(<ApplicationsListPage />)

    expect(await screen.findByRole('link', { name: 'Acme Corp' })).toBeInTheDocument()
    expect(screen.getByText('Applied')).toBeInTheDocument()
    expect(screen.getByText('2026-09-01')).toBeInTheDocument()
    expect(screen.getByText('2026-09-10')).toBeInTheDocument()
  })

  it('falls back to the raw companyId if the company lookup has not resolved it', async () => {
    listApplicationsMock.mockResolvedValue([application])
    listCompaniesMock.mockResolvedValue([])

    renderWithRouter(<ApplicationsListPage />)

    expect(await screen.findByRole('link', { name: 'c1' })).toBeInTheDocument()
  })

  it('shows an empty state when there are no applications', async () => {
    listApplicationsMock.mockResolvedValue([])
    listCompaniesMock.mockResolvedValue([])

    renderWithRouter(<ApplicationsListPage />)

    expect(await screen.findByText('No applications yet — add one above.')).toBeInTheDocument()
  })
})
