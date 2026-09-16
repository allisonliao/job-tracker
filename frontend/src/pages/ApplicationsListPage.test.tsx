import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ApplicationResponse } from '../types/application'
import type { CompanyResponse } from '../types/company'
import type { JobPostingResponse } from '../types/jobPosting'
import { renderWithRouter } from '../test/testUtils'
import { ApplicationsListPage } from './ApplicationsListPage'

const { listApplicationsMock, listCompaniesMock, listJobPostingsMock } = vi.hoisted(() => ({
  listApplicationsMock: vi.fn(),
  listCompaniesMock: vi.fn(),
  listJobPostingsMock: vi.fn(),
}))

vi.mock('../api/applications', () => ({
  listApplications: listApplicationsMock,
}))

vi.mock('../api/companies', () => ({
  listCompanies: listCompaniesMock,
}))

vi.mock('../api/jobPostings', () => ({
  listJobPostings: listJobPostingsMock,
}))

const acme: CompanyResponse = {
  companyId: 'c1',
  name: 'Acme Corp',
  website: null,
  industry: null,
  notes: null,
}

const globex: CompanyResponse = {
  companyId: 'c2',
  name: 'Globex Inc',
  website: null,
  industry: null,
  notes: null,
}

const acmeApplication: ApplicationResponse = {
  applicationId: 'a1',
  companyId: 'c1',
  jobPostingId: 'j1',
  currentStatus: 'Applied',
  dateApplied: '2026-09-01',
  lastContactDate: null,
  followUpDate: '2026-09-10',
  offerDecisionDeadline: null,
}

const globexApplication: ApplicationResponse = {
  applicationId: 'a2',
  companyId: 'c2',
  jobPostingId: null,
  currentStatus: 'Interviewing',
  dateApplied: '2026-09-02',
  lastContactDate: null,
  followUpDate: null,
  offerDecisionDeadline: null,
}

const acmeJobPosting: JobPostingResponse = {
  jobId: 'j1',
  companyId: 'c1',
  title: 'Backend Engineer',
  url: null,
  location: null,
  dateFound: null,
  applicationDeadline: null,
}

describe('ApplicationsListPage', () => {
  beforeEach(() => {
    listApplicationsMock.mockReset()
    listCompaniesMock.mockReset()
    listJobPostingsMock.mockReset()
    listJobPostingsMock.mockImplementation((companyId: string) =>
      Promise.resolve(companyId === 'c1' ? [acmeJobPosting] : []),
    )
  })

  it('shows applications with resolved company names once loaded', async () => {
    listApplicationsMock.mockResolvedValue([acmeApplication])
    listCompaniesMock.mockResolvedValue([acme])

    renderWithRouter(<ApplicationsListPage />)

    expect(await screen.findByRole('link', { name: 'Acme Corp' })).toBeInTheDocument()
    expect(screen.getByText('Applied', { selector: 'td' })).toBeInTheDocument()
    expect(screen.getByText('2026-09-01')).toBeInTheDocument()
    expect(screen.getByText('2026-09-10')).toBeInTheDocument()
  })

  it('falls back to the raw companyId if the company lookup has not resolved it', async () => {
    listApplicationsMock.mockResolvedValue([acmeApplication])
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

  it('filters by status', async () => {
    const user = userEvent.setup()
    listApplicationsMock.mockResolvedValue([acmeApplication, globexApplication])
    listCompaniesMock.mockResolvedValue([acme, globex])

    renderWithRouter(<ApplicationsListPage />)
    await screen.findByRole('link', { name: 'Acme Corp' })

    await user.selectOptions(screen.getByLabelText('Status'), 'Interviewing')

    expect(screen.queryByRole('link', { name: 'Acme Corp' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Globex Inc' })).toBeInTheDocument()
  })

  it('filters by company', async () => {
    const user = userEvent.setup()
    listApplicationsMock.mockResolvedValue([acmeApplication, globexApplication])
    listCompaniesMock.mockResolvedValue([acme, globex])

    renderWithRouter(<ApplicationsListPage />)
    await screen.findByRole('link', { name: 'Acme Corp' })

    await user.selectOptions(screen.getByLabelText('Company'), 'c1')

    expect(screen.getByRole('link', { name: 'Acme Corp' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Globex Inc' })).not.toBeInTheDocument()
  })

  it('filters by search text matching a job title', async () => {
    const user = userEvent.setup()
    listApplicationsMock.mockResolvedValue([acmeApplication, globexApplication])
    listCompaniesMock.mockResolvedValue([acme, globex])

    renderWithRouter(<ApplicationsListPage />)
    await screen.findByRole('link', { name: 'Acme Corp' })

    await user.type(screen.getByLabelText('Search'), 'Backend Engineer')

    expect(await screen.findByRole('link', { name: 'Acme Corp' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Globex Inc' })).not.toBeInTheDocument()
  })

  it('shows a message when no applications match the current filters', async () => {
    const user = userEvent.setup()
    listApplicationsMock.mockResolvedValue([acmeApplication])
    listCompaniesMock.mockResolvedValue([acme])

    renderWithRouter(<ApplicationsListPage />)
    await screen.findByRole('link', { name: 'Acme Corp' })

    await user.type(screen.getByLabelText('Search'), 'nonexistent')

    expect(await screen.findByText('No applications match your filters.')).toBeInTheDocument()
  })
})
