import { renderHook, waitFor } from '@testing-library/react'
import { ApiError } from '../api/client'
import { useAsyncData } from './useAsyncData'

describe('useAsyncData', () => {
  it('starts in loading state and resolves to data', async () => {
    const fetcher = vi.fn(() => Promise.resolve({ value: 42 }))

    const { result } = renderHook(() => useAsyncData(fetcher, []))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toEqual({ value: 42 })
    expect(result.current.error).toBeNull()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('sets a friendly message from ApiError on failure', async () => {
    const fetcher = vi.fn(() => Promise.reject(new ApiError(404, 'Application not found')))

    const { result } = renderHook(() => useAsyncData(fetcher, []))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Application not found')
  })

  it('falls back to a generic message for a non-ApiError failure', async () => {
    const fetcher = vi.fn(() => Promise.reject(new Error('network dropped')))

    const { result } = renderHook(() => useAsyncData(fetcher, []))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Something went wrong')
  })

  it('refetch() re-runs the fetcher and updates state again', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ value: 1 })
      .mockResolvedValueOnce({ value: 2 })

    const { result } = renderHook(() => useAsyncData(fetcher, []))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ value: 1 })

    result.current.refetch()

    await waitFor(() => expect(result.current.data).toEqual({ value: 2 }))
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('refetches automatically when a dependency changes', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ value: 'first' })
      .mockResolvedValueOnce({ value: 'second' })

    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useAsyncData(fetcher, [id]),
      { initialProps: { id: 'a' } },
    )

    await waitFor(() => expect(result.current.data).toEqual({ value: 'first' }))

    rerender({ id: 'b' })

    await waitFor(() => expect(result.current.data).toEqual({ value: 'second' }))
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('does not call the fetcher at all when disabled', () => {
    const fetcher = vi.fn(() => Promise.resolve({ value: 1 }))

    const { result } = renderHook(() => useAsyncData(fetcher, [], false))

    expect(fetcher).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
  })

  it('starts fetching once enabled flips to true', async () => {
    const fetcher = vi.fn(() => Promise.resolve({ value: 1 }))

    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useAsyncData(fetcher, [], enabled),
      { initialProps: { enabled: false } },
    )

    expect(fetcher).not.toHaveBeenCalled()

    rerender({ enabled: true })

    await waitFor(() => expect(result.current.data).toEqual({ value: 1 }))
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
