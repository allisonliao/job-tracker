import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import type { ApplicationDetailResponse } from '../types/application'
import { renderWithRouter } from '../test/testUtils'
import { ApplicationDetailPage } from './ApplicationDetailPage'

const { getApplicationMock, changeApplicationStatusMock, addInterviewMock, addNoteMock } = vi.hoisted(() => ({
  getApplicationMock: vi.fn(),
  changeApplicationStatusMock: vi.fn(),
  addInterviewMock: vi.fn(),
  addNoteMock: vi.fn(),
}))

vi.mock('../api/applications', () => ({
  getApplication: getApplicationMock,
  changeApplicationStatus: changeApplicationStatusMock,
  addInterview: addInterviewMock,
  addNote: addNoteMock,
}))

const detail: ApplicationDetailResponse = {
  applicationId: 'a1',
  companyName: 'Acme Corp',
  applicationLink: 'https://acme.example/jobs/1',
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
    changeApplicationStatusMock.mockReset()
    addInterviewMock.mockReset()
    addNoteMock.mockReset()
  })

  it('shows application detail with interviews, status history, and notes', async () => {
    getApplicationMock.mockResolvedValue(detail)

    renderDetailPage()

    expect(await screen.findByRole('heading', { name: 'Acme Corp' })).toBeInTheDocument()
    expect(screen.getByText('Interviewing', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://acme.example/jobs/1' })).toBeInTheDocument()
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

    renderDetailPage()

    await screen.findByRole('heading', { name: 'Acme Corp' })
    expect(screen.getByText('No interviews scheduled yet.')).toBeInTheDocument()
    expect(screen.getByText('No status changes recorded yet.')).toBeInTheDocument()
    expect(screen.getByText('No notes yet.')).toBeInTheDocument()
  })

  it('submits a status change and refetches the application afterward', async () => {
    const user = userEvent.setup()
    getApplicationMock
      .mockResolvedValueOnce(detail)
      .mockResolvedValueOnce({ ...detail, currentStatus: 'Offer' })
    changeApplicationStatusMock.mockResolvedValue({ ...detail, currentStatus: 'Offer' })

    renderDetailPage()
    await screen.findByRole('heading', { name: 'Acme Corp' })

    const statusInput = screen.getByRole('combobox', { name: /Change status from Interviewing to/ })
    await user.type(statusInput, 'Offer')
    await user.type(screen.getByLabelText('Note'), 'Got an offer!')
    await user.click(screen.getByRole('button', { name: 'Change status' }))

    await waitFor(() =>
      expect(changeApplicationStatusMock).toHaveBeenCalledWith('a1', {
        newStatus: 'Offer',
        note: 'Got an offer!',
      }),
    )
    expect(getApplicationMock).toHaveBeenCalledTimes(2)
  })

  it('adds an interview and refetches the application afterward', async () => {
    const user = userEvent.setup()
    getApplicationMock.mockResolvedValue(detail)
    addInterviewMock.mockResolvedValue({
      interviewDate: '2026-09-20T10:00:00.000Z',
      roundType: 'Onsite',
      notes: null,
    })

    renderDetailPage()
    await screen.findByRole('heading', { name: 'Acme Corp' })

    const dateInput = screen.getByLabelText('Interview date/time')
    await user.type(dateInput, '2026-09-20T10:00')
    await user.type(screen.getByLabelText('Round type'), 'Onsite')
    await user.click(screen.getByRole('button', { name: 'Add interview' }))

    await waitFor(() =>
      expect(addInterviewMock).toHaveBeenCalledWith(
        'a1',
        expect.objectContaining({ roundType: 'Onsite', notes: null }),
      ),
    )
    expect(getApplicationMock).toHaveBeenCalledTimes(2)
  })

  it('adds a note and refetches the application afterward', async () => {
    const user = userEvent.setup()
    getApplicationMock.mockResolvedValue(detail)
    addNoteMock.mockResolvedValue({ createdAt: '2026-09-07T00:00:00Z', text: 'Follow-up scheduled' })

    renderDetailPage()
    await screen.findByRole('heading', { name: 'Acme Corp' })

    await user.type(screen.getByLabelText('New note'), 'Follow-up scheduled')
    await user.click(screen.getByRole('button', { name: 'Add note' }))

    await waitFor(() =>
      expect(addNoteMock).toHaveBeenCalledWith('a1', { text: 'Follow-up scheduled' }),
    )
    expect(getApplicationMock).toHaveBeenCalledTimes(2)
  })
})
