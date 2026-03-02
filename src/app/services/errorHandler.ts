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

  // Debug logging
  console.error('[normalizeError] Raw error:', error)
  if (error && typeof error === 'object') {
    console.error('[normalizeError] Error properties:', {
      keys: Object.keys(error),
      status: error.status,
      statusText: error.statusText,
      data: error.data,
      message: error.message,
    })
  }

  // Handle RTK Query FetchBaseQueryError with status
  if (typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
    const status = error.status
    let data = error.data as any
    
    console.error('[normalizeError] RTK FetchBaseQueryError detected, status:', status, 'data:', data)
    
    // If data is a string, try to parse it
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
        console.error('[normalizeError] Parsed data from string:', data)
      } catch (e) {
        // If not JSON, use as message directly
        console.error('[normalizeError] Data is unparseable string:', data)
        return {
          code: `ERROR_${status}`,
          message: data || getStatusMessage(status),
        }
      }
    }
    
    // Try to extract message from various formats
    let message = ''
    if (data && typeof data === 'object') {
      console.error('[normalizeError] Data object found, extracting message...')
      // Check multiple possible error message fields
      message = data.message || 
                data.error || 
                data.detail || 
                data.msg || 
                data.message_en ||
                data.errors?.[0]?.message || 
                ''
      console.error('[normalizeError] Extracted message:', message)
    }
    
    // If still no message, use status-based fallback
    if (!message) {
      console.error('[normalizeError] No message found, using status-based fallback')
      message = getStatusMessage(status)
    }
    
    console.error('[normalizeError] Final message:', message)
    
    return {
      code: data?.code || `ERROR_${status}` || 'ERROR_API',
      message,
      details: data?.details,
    }
  }

  // Handle objects with message property (SerializedError from RTK Query)
  if (typeof error === 'object' && 'message' in error && error.message) {
    console.error('[normalizeError] SerializedError detected, message:', error.message)
    // Check if it looks like a network error
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      return {
        code: 'ERROR_NETWORK',
        message: 'Network error. Failed to connect to server. Please check your internet connection.',
      }
    }
    return {
      code: error.code || 'ERROR_MESSAGE',
      message: error.message,
    }
  }

  // Handle statusText (from fetch API)
  if (typeof error === 'object' && 'statusText' in error && error.statusText) {
    console.error('[normalizeError] statusText detected:', error.statusText)
    const status = error.status || 500
    return {
      code: `ERROR_${status}`,
      message: error.statusText || getStatusMessage(status),
    }
  }

  // Handle plain Error objects
  if (error instanceof Error) {
    console.error('[normalizeError] Error instance detected:', error.message)
    // Check for network-related errors
    if (error.message.includes('ECONNREFUSED') || 
        error.message.includes('ENOTFOUND') || 
        error.message.includes('ERR_')) {
      return {
        code: 'ERROR_NETWORK',
        message: 'Network error. Failed to connect to server. Please check your internet connection or try again later.',
      }
    }
    return {
      code: 'ERROR_EXCEPTION',
      message: error.message || 'An error occurred',
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    console.error('[normalizeError] String error detected:', error)
    return {
      code: 'ERROR_MESSAGE',
      message: error || 'An unknown error occurred',
    }
  }

  // Catch-all for any other error structure
  console.error('[normalizeError] Unhandled error type:', typeof error)
  return { 
    code: 'ERROR_UNKNOWN', 
    message: 'An error occurred. Please try again.'
  }
}

function getStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid input. Please check your details.'
    case 401:
    case 403:
      return 'Invalid email or password'
    case 409:
      return 'This email is already registered'
    case 422:
      return 'Invalid input. Please check your details.'
    case 500:
    case 502:
    case 503:
      return 'Server error. Please try again later.'
    case 0:
      return 'Network error. Failed to connect to server.'
    default:
      return `Request failed. Please try again.`
  }
}

export function getErrorMessage(error: any): string {
  const normalized = normalizeError(error)
  console.warn('[getErrorMessage]', { normalized, originalError: error })
  return normalized.message
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
