import { screen } from '@testing-library/react'
import App from './App'
import { renderWithRouter } from './test/testUtils'

describe('App', () => {
  it('renders the dashboard heading and nav at the root route', () => {
    renderWithRouter(<App />)

    expect(screen.getByRole('heading', { name: 'Job Tracker' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Applications' })).toBeInTheDocument()
  })

  it('renders the not-found page for an unknown route', () => {
    renderWithRouter(<App />, { route: '/does-not-exist' })

    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })
})
