import React, { ReactNode, ErrorInfo } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      hasError: true,
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <div className="max-w-md w-full space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h1 className="text-lg font-semibold">Something went wrong</h1>
                <p className="text-sm text-muted-foreground">
                  We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                </p>
              </div>
            </div>

            {this.state.error && (
              <details className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <summary className="cursor-pointer font-mono">Error details</summary>
                <pre className="mt-2 overflow-auto max-h-24 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="default"
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                Go to Home
              </Button>
              <Button
                variant="outline"
                onClick={this.handleReset}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
