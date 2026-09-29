import axios, { AxiosError } from 'axios'

const baseURL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080')

export type ApiErrorResponse = {
  status: number
  message: string
  timestamp?: string
}

export class ApiError extends Error {
  status: number
  timestamp?: string
  raw?: unknown

  constructor(status: number, message: string, raw?: unknown, timestamp?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.raw = raw
    this.timestamp = timestamp
  }
}

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse | { message?: string } | string>) => {
    return Promise.reject(normalizeApiError(error))
  },
)

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const backendMessage =
      typeof error.response?.data === 'object' && error.response.data !== null && 'message' in error.response.data
        ? String((error.response.data as { message?: string }).message)
        : typeof error.response?.data === 'string'
          ? error.response.data
          : undefined

    const message =
      backendMessage ||
      (status === 0 ? 'Backend unavailable. Please check whether the Spring Boot server is running.' : error.message)

    return new ApiError(
      status,
      message,
      error.response?.data ?? error,
      error.response?.data && typeof error.response.data === 'object' && 'timestamp' in error.response.data
        ? String((error.response.data as { timestamp?: string }).timestamp)
        : undefined,
    )
  }

  if (error instanceof Error) {
    return new ApiError(0, error.message, error)
  }

  return new ApiError(0, 'An unexpected error occurred while contacting the backend.', error)
}

export function getApiErrorMessage(error: unknown): string {
  return normalizeApiError(error).message
}

export async function checkBackendAvailability(): Promise<boolean> {
  try {
    await apiClient.get('/api/zones', { timeout: 5000 })
    return true
  } catch {
    return false
  }
}
