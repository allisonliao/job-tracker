const BASE_URL = 'http://localhost:8080'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!res.ok) {
    // The backend doesn't return a uniform error shape: 404s are plain text
    // (GlobalExceptionHandler returns ResponseEntity<String>), while @Valid
    // validation failures fall through to Spring's default JSON error body.
    // Branch on content-type before parsing, or .json() throws on the 404 path.
    const contentType = res.headers.get('content-type') ?? ''
    let message: string
    if (contentType.includes('json')) {
      const body = await res.json().catch(() => null)
      message = body?.detail ?? body?.message ?? body?.title ?? res.statusText
    } else {
      message = (await res.text().catch(() => '')) || res.statusText
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
}
