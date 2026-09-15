import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import type { ApplicationDetailResponse } from '../types/application'
import type { CompanyResponse } from '../types/company'
import { renderWithRouter } from '../test/testUtils'
import { ApplicationDetailPage } from './ApplicationDetailPage'

const { getApplicationMock, getCompanyMock } = vi.hoisted(() => ({
  getApplicationMock: vi.fn(),
  getCompanyMock: vi.fn(),
}))

vi.mock('../api/applications', () => ({
  getApplication: getApplicationMock,
}))

vi.mock('../api/companies', () => ({
  getCompany: getCompanyMock,
}))

const detail: ApplicationDetailResponse = {
  applicationId: 'a1',
  companyId: 'c1',
  jobPostingId: null,
  currentStatus: 'Interviewing',
  dateApplied: '2026-09-01',
  lastContactDate: null,
  followUpDate: '2026-09-10',
  offerDecisionDeadline: null,
  interviews: [{ interviewDate: '2026-09-15T14:00:00Z', roundType: 'Phone Screen', notes: null }],
  statusHistory: [
    { changedAt: '2026-09-05T09:00:00Z', fromStatus: 'Applied', toStatus: 'Interviewing', note: null },
  ],
  notes: [{ createdAt: '2026-09-06T08:00:00Z', text: 'Seems promising' }],
}

const company: CompanyResponse = {
  companyId: 'c1',
  name: 'Acme Corp',
  website: null,
  industry: null,
  notes: null,
}

function renderDetailPage() {
  return renderWithRouter(
    <Routes>
      <Route path="/applications/:applicationId" element={<ApplicationDetailPage />} />
    </Routes>,
    { route: '/applications/a1' },
  )
}

describe('ApplicationDetailPage', () => {
  beforeEach(() => {
    getApplicationMock.mockReset()
    getCompanyMock.mockReset()
  })

  it('shows application detail with interviews, status history, and notes', async () => {
    getApplicationMock.mockResolvedValue(detail)
    getCompanyMock.mockResolvedValue(company)

    renderDetailPage()

    expect(await screen.findByRole('heading', { name: 'Acme Corp' })).toBeInTheDocument()
    expect(screen.getByText('Interviewing')).toBeInTheDocument()
    expect(screen.getByText(/Phone Screen/)).toBeInTheDocument()
    expect(screen.getByText(/Seems promising/)).toBeInTheDocument()
    expect(screen.getByText(/Applied/)).toBeInTheDocument()
  })

  it('shows empty-state messages when there is no history yet', async () => {
    getApplicationMock.mockResolvedValue({
      ...detail,
      interviews: [],
      statusHistory: [],
      notes: [],
    })
    getCompanyMock.mockResolvedValue(company)

    renderDetailPage()

    await screen.findByRole('heading', { name: 'Acme Corp' })
    expect(screen.getByText('No interviews scheduled yet.')).toBeInTheDocument()
    expect(screen.getByText('No status changes recorded yet.')).toBeInTheDocument()
    expect(screen.getByText('No notes yet.')).toBeInTheDocument()
  })

  it('falls back to the raw companyId in the heading if the company has not resolved', async () => {
    getApplicationMock.mockResolvedValue(detail)
    getCompanyMock.mockRejectedValue(new Error('not found'))

    renderDetailPage()

    expect(await screen.findByRole('heading', { name: 'c1' })).toBeInTheDocument()
  })
})
