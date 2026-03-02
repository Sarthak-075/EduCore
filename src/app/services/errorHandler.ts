/**
 * Centralized error handling for API responses
 */

export interface ApiError {
  code: string
  message: string
  details?: any
}

export function normalizeError(error: any): ApiError {
  if (!error) {
    return { code: 'ERROR_UNKNOWN', message: 'An unknown error occurred' }
  }

  // Handle RTK Query FetchBaseQueryError
  if (typeof error === 'object' && 'data' in error && error.data) {
    const data = error.data as any
    const status = error.status
    
    // Try to extract message from various formats
    let message = data.message || data.error || data.detail || ''
    
    // If still no message, use status-based fallback
    if (!message) {
      switch (status) {
        case 400:
          message = 'Invalid input. Please check your details.'
        case 401:
        case 403:
          message = 'Invalid email or password'
        case 409:
          message = 'This email is already registered'
        case 500:
          message = 'Server error. Please try again later.'
        default:
          message = `Request failed (${status || 'unknown'})`
      }
    }
    
    return {
      code: data.code || `ERROR_${status}` || 'ERROR_API',
      message,
      details: data.details,
    }
  }

  // Handle RTK Query SerializedError
  if (typeof error === 'object' && 'message' in error) {
    return {
      code: 'ERROR_SERIALIZED',
      message: (error as any).message || 'An error occurred',
    }
  }

  // Handle plain Error
  if (error instanceof Error) {
    return {
      code: 'ERROR_EXCEPTION',
      message: error.message,
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: 'ERROR_MESSAGE',
      message: error,
    }
  }

  return { code: 'ERROR_UNKNOWN', message: 'An unknown error occurred' }
}

export function getErrorMessage(error: any): string {
  return normalizeError(error).message
}

export function isAuthError(error: any): boolean {
  const normalized = normalizeError(error)
  return normalized.code === 'UNAUTHORIZED' || normalized.code === '401'
}

export function isNotFoundError(error: any): boolean {
  const normalized = normalizeError(error)
  return normalized.code === 'NOT_FOUND' || normalized.code === '404'
}

export function isValidationError(error: any): boolean {
  const normalized = normalizeError(error)
  return normalized.code === 'VALIDATION_ERROR' || normalized.code === '400'
}
