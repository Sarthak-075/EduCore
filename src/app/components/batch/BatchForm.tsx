import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Batch } from '../../api/batches'

interface BatchFormProps {
  batch?: Batch
  isLoading?: boolean
  error?: string | null
  onSubmit: (name: string) => void
  onCancel?: () => void
}

export const BatchForm: React.FC<BatchFormProps> = ({
  batch,
  isLoading = false,
  error = null,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (batch) {
      setName(batch.name)
    }
  }, [batch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!name.trim()) {
      setValidationError('Batch name is required')
      return
    }

    if (name.trim().length < 2) {
      setValidationError('Batch name must be at least 2 characters')
      return
    }

    if (name.trim().length > 100) {
      setValidationError('Batch name must not exceed 100 characters')
      return
    }

    onSubmit(name.trim())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {batch ? 'Edit Batch' : 'Create New Batch'}
        </CardTitle>
        <CardDescription>
          {batch
            ? 'Update the batch information'
            : 'Enter details to create a new batch'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="batch-name">Batch Name</Label>
            <Input
              id="batch-name"
              placeholder="e.g., Class 10-A, B.Tech SE-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/100 characters
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                batch ? 'Update Batch' : 'Create Batch'
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
