import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import type { ApplicationDetailResponse, ApplicationResponse } from '../types/application'
import type { CompanyResponse } from '../types/company'
import type { JobPostingResponse } from '../types/jobPosting'
import { renderWithRouter } from '../test/testUtils'
import { ApplicationFormPage } from './ApplicationFormPage'

const {
  createApplicationMock,
  updateApplicationMock,
  getApplicationMock,
  listCompaniesMock,
  listJobPostingsMock,
  navigateMock,
} = vi.hoisted(() => ({
  createApplicationMock: vi.fn(),
  updateApplicationMock: vi.fn(),
  getApplicationMock: vi.fn(),
  listCompaniesMock: vi.fn(),
  listJobPostingsMock: vi.fn(),
  navigateMock: vi.fn(),
}))

vi.mock('../api/applications', () => ({
  createApplication: createApplicationMock,
  updateApplication: updateApplicationMock,
  getApplication: getApplicationMock,
}))

vi.mock('../api/companies', () => ({
  listCompanies: listCompaniesMock,
}))

vi.mock('../api/jobPostings', () => ({
  listJobPostings: listJobPostingsMock,
}))

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigateMock }
})

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
  applicationDeadline: null,
}

const createdApplication: ApplicationResponse = {
  applicationId: 'new-app-id',
  companyId: 'c1',
  jobPostingId: 'j1',
  currentStatus: 'Applied',
  dateApplied: null,
  lastContactDate: null,
  followUpDate: null,
  offerDecisionDeadline: null,
}

describe('ApplicationFormPage', () => {
  beforeEach(() => {
    createApplicationMock.mockReset()
    updateApplicationMock.mockReset()
    getApplicationMock.mockReset()
    listCompaniesMock.mockReset()
    listJobPostingsMock.mockReset()
    navigateMock.mockReset()
    listCompaniesMock.mockResolvedValue([company])
    listJobPostingsMock.mockResolvedValue([jobPosting])
  })

  it('creates a new application and navigates to its detail page', async () => {
    const user = userEvent.setup()
    createApplicationMock.mockResolvedValue(createdApplication)

    renderWithRouter(<ApplicationFormPage />, { route: '/applications/new' })

    expect(screen.getByRole('heading', { name: 'New application' })).toBeInTheDocument()
    // In create mode there's no applicationId, so useApplication must skip fetching entirely
    // rather than calling getApplication('') against the real API.
    expect(getApplicationMock).not.toHaveBeenCalled()

    await user.selectOptions(await screen.findByLabelText('Company'), 'c1')
    await user.selectOptions(await screen.findByLabelText('Job posting'), 'j1')
    await user.type(screen.getByLabelText('Status'), 'Applied')
    await user.click(screen.getByRole('button', { name: 'Create application' }))

    await waitFor(() =>
      expect(createApplicationMock).toHaveBeenCalledWith({
        companyId: 'c1',
        jobPostingId: 'j1',
        currentStatus: 'Applied',
        dateApplied: null,
        lastContactDate: null,
        followUpDate: null,
        offerDecisionDeadline: null,
      }),
    )
    expect(navigateMock).toHaveBeenCalledWith('/applications/new-app-id')
  })

  it('does not submit without selecting a company or entering a status', async () => {
    const user = userEvent.setup()

    renderWithRouter(<ApplicationFormPage />, { route: '/applications/new' })
    await screen.findByLabelText('Company')

    await user.click(screen.getByRole('button', { name: 'Create application' }))

    expect(createApplicationMock).not.toHaveBeenCalled()
  })

  it('loads and prefills an existing application in edit mode, then saves changes', async () => {
    const user = userEvent.setup()
    const existing: ApplicationDetailResponse = {
      applicationId: 'a1',
      companyId: 'c1',
      jobPostingId: 'j1',
      currentStatus: 'Applied',
      dateApplied: '2026-09-01',
      lastContactDate: null,
      followUpDate: null,
      offerDecisionDeadline: null,
      interviews: [],
      statusHistory: [],
      notes: [],
    }
    getApplicationMock.mockResolvedValue(existing)
    updateApplicationMock.mockResolvedValue({ ...createdApplication, applicationId: 'a1' })

    renderWithRouter(
      <Routes>
        <Route path="/applications/:applicationId/edit" element={<ApplicationFormPage />} />
      </Routes>,
      { route: '/applications/a1/edit' },
    )

    expect(await screen.findByRole('heading', { name: 'Edit application' })).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Applied')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(updateApplicationMock).toHaveBeenCalledWith(
        'a1',
        expect.objectContaining({ companyId: 'c1', currentStatus: 'Applied' }),
      ),
    )
    expect(navigateMock).toHaveBeenCalledWith('/applications/a1')
  })
})
