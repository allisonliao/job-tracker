import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the Job Tracker heading', () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      } as Response),
    ))

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Job Tracker' })).toBeInTheDocument()
  })
})
