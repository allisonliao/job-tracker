import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'

export function renderWithRouter(ui: ReactElement, options?: RenderOptions & { route?: string }) {
  const route = options?.route ?? '/'
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>, options)
}
