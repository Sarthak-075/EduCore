import React from 'react'
import { Alert, AlertDescription } from './alert'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface ErrorAlertProps {
  error?: string | null | unknown
  title?: string
  className?: string
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  title = 'Error',
  className = '',
}) => {
  // Safely stringify error - handle objects, null, undefined
  const getErrorString = (err: unknown): string | null => {
    if (!err) return null
    if (typeof err === 'string') return err
    if (typeof err === 'object' && err !== null) {
      // If it has a message property, use that
      if ('message' in err && typeof (err as any).message === 'string') {
        return (err as any).message
      }
      // Otherwise try to stringify it
      try {
        return JSON.stringify(err)
      } catch {
        return 'An error occurred'
      }
    }
    return String(err)
  }

  const errorString = getErrorString(error)
  if (!errorString) return null

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {title}: {errorString}
      </AlertDescription>
    </Alert>
  )
}

interface SuccessAlertProps {
  message?: string | null | unknown
  title?: string
  className?: string
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({
  message,
  title = 'Success',
  className = '',
}) => {
  // Safely stringify message
  const getMessageString = (msg: unknown): string | null => {
    if (!msg) return null
    if (typeof msg === 'string') return msg
    if (typeof msg === 'object' && msg !== null) {
      if ('message' in msg && typeof (msg as any).message === 'string') {
        return (msg as any).message
      }
      try {
        return JSON.stringify(msg)
      } catch {
        return 'Operation completed'
      }
    }
    return String(msg)
  }

  const messageString = getMessageString(message)
  if (!messageString) return null

  return (
    <Alert className={`bg-green-50 border-green-200 ${className}`}>
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-700">
        {title}: {messageString}
      </AlertDescription>
    </Alert>
  )
}
