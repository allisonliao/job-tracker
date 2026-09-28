import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import type { ApplicationDetailResponse, ApplicationResponse } from '../types/application'
import { renderWithRouter } from '../test/testUtils'
import { ApplicationFormPage } from './ApplicationFormPage'

const { createApplicationMock, updateApplicationMock, getApplicationMock, navigateMock } = vi.hoisted(() => ({
  createApplicationMock: vi.fn(),
  updateApplicationMock: vi.fn(),
  getApplicationMock: vi.fn(),
  navigateMock: vi.fn(),
}))

vi.mock('../api/applications', () => ({
  createApplication: createApplicationMock,
  updateApplication: updateApplicationMock,
  getApplication: getApplicationMock,
}))

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return { ...actual, useNavigate: () => navigateMock }
})

const createdApplication: ApplicationResponse = {
  applicationId: 'new-app-id',
  companyName: 'Acme Corp',
  applicationLink: 'https://acme.example/jobs/1',
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
    navigateMock.mockReset()
  })

  it('creates a new application and navigates to its detail page', async () => {
    const user = userEvent.setup()
    createApplicationMock.mockResolvedValue(createdApplication)

    renderWithRouter(<ApplicationFormPage />, { route: '/applications/new' })

    expect(screen.getByRole('heading', { name: 'New application' })).toBeInTheDocument()
    // In create mode there's no applicationId, so useApplication must skip fetching entirely
    // rather than calling getApplication('') against the real API.
    expect(getApplicationMock).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Company'), 'Acme Corp')
    await user.type(screen.getByLabelText('Application link'), 'https://acme.example/jobs/1')
    await user.type(screen.getByLabelText('Status'), 'Applied')
    await user.click(screen.getByRole('button', { name: 'Create application' }))

    await waitFor(() =>
      expect(createApplicationMock).toHaveBeenCalledWith({
        companyName: 'Acme Corp',
        applicationLink: 'https://acme.example/jobs/1',
        currentStatus: 'Applied',
        dateApplied: null,
        lastContactDate: null,
        followUpDate: null,
        offerDecisionDeadline: null,
      }),
    )
    expect(navigateMock).toHaveBeenCalledWith('/applications/new-app-id')
  })

  it('does not submit without entering a company or a status', async () => {
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
      companyName: 'Acme Corp',
      applicationLink: null,
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
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(updateApplicationMock).toHaveBeenCalledWith(
        'a1',
        expect.objectContaining({ companyName: 'Acme Corp', currentStatus: 'Applied' }),
      ),
    )
    expect(navigateMock).toHaveBeenCalledWith('/applications/a1')
  })
})
