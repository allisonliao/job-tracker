import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CompanyResponse } from '../types/company'
import { renderWithRouter } from '../test/testUtils'
import { CompaniesPage } from './CompaniesPage'

const { listCompaniesMock, createCompanyMock } = vi.hoisted(() => ({
  listCompaniesMock: vi.fn(),
  createCompanyMock: vi.fn(),
}))

vi.mock('../api/companies', () => ({
  listCompanies: listCompaniesMock,
  createCompany: createCompanyMock,
}))

vi.mock('../api/jobPostings', () => ({
  listJobPostings: vi.fn(() => Promise.resolve([])),
}))

vi.mock('../api/contacts', () => ({
  listContacts: vi.fn(() => Promise.resolve([])),
}))

const existingCompany: CompanyResponse = {
  companyId: 'c1',
  name: 'Acme Corp',
  website: null,
  industry: 'Software',
  notes: null,
}

describe('CompaniesPage', () => {
  beforeEach(() => {
    listCompaniesMock.mockReset()
    createCompanyMock.mockReset()
  })

  it('shows companies once loaded', async () => {
    listCompaniesMock.mockResolvedValue([existingCompany])

    renderWithRouter(<CompaniesPage />)

    expect(screen.getByRole('status')).toBeInTheDocument()

    expect(await screen.findByRole('button', { name: /Acme Corp \(Software\)/ })).toBeInTheDocument()
  })

  it('shows an empty state when there are no companies', async () => {
    listCompaniesMock.mockResolvedValue([])

    renderWithRouter(<CompaniesPage />)

    expect(await screen.findByText('No companies yet — add one above.')).toBeInTheDocument()
  })

  it('submits the add-company form and refetches the list', async () => {
    const user = userEvent.setup()
    listCompaniesMock.mockResolvedValueOnce([]).mockResolvedValueOnce([existingCompany])
    createCompanyMock.mockResolvedValue(existingCompany)

    renderWithRouter(<CompaniesPage />)
    await screen.findByText('No companies yet — add one above.')

    await user.type(screen.getByLabelText('Company name'), 'Acme Corp')
    await user.click(screen.getByRole('button', { name: 'Add company' }))

    await waitFor(() => expect(createCompanyMock).toHaveBeenCalledWith({
      name: 'Acme Corp',
      website: '',
      industry: '',
      notes: '',
    }))
    expect(listCompaniesMock).toHaveBeenCalledTimes(2)
    expect(await screen.findByRole('button', { name: /Acme Corp \(Software\)/ })).toBeInTheDocument()
  })

  it('expands a company to show its job postings and contacts sections', async () => {
    const user = userEvent.setup()
    listCompaniesMock.mockResolvedValue([existingCompany])

    renderWithRouter(<CompaniesPage />)
    const companyButton = await screen.findByRole('button', { name: /Acme Corp/ })

    expect(screen.queryByText('Job postings')).not.toBeInTheDocument()

    await user.click(companyButton)

    expect(await screen.findByText('Job postings')).toBeInTheDocument()
    expect(screen.getByText('Contacts')).toBeInTheDocument()
  })
})
