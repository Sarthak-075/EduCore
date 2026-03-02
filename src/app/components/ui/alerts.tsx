import React from 'react'
import { Alert, AlertDescription } from './alert'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface ErrorAlertProps {
  error?: string | null
  title?: string
  className?: string
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  title = 'Error',
  className = '',
}) => {
  if (!error) return null
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {title}: {error}
      </AlertDescription>
    </Alert>
  )
}

interface SuccessAlertProps {
  message?: string | null
  title?: string
  className?: string
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({
  message,
  title = 'Success',
  className = '',
}) => {
  if (!message) return null
  return (
    <Alert className={`bg-green-50 border-green-200 ${className}`}>
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-700">
        {title}: {message}
      </AlertDescription>
    </Alert>
  )
}
