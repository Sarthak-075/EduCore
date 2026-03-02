import React, { useState } from 'react'
import { useAppDispatch } from '../utils/hooks'
import { useGetBatchesQuery, useCreateBatchMutation, useDeleteBatchMutation } from '../api/batches'
import { setCurrentBatch } from '../store/batchSlice'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Loader2, Plus } from 'lucide-react'
import { BatchForm } from '../components/batch/BatchForm'
import { BatchCard } from '../components/batch/BatchCard'
import { SearchInput } from '../components/ui/search-input'
import { ErrorAlert, SuccessAlert } from '../components/ui/alerts'
import { getErrorMessage } from '../services/errorHandler'

interface BatchScreenProps {
  onManageStudents?: (batchId: string) => void
  onViewAttendance?: (batchId: string) => void
}

export const BatchScreen: React.FC<BatchScreenProps> = ({
  onManageStudents,
  onViewAttendance,
}) => {
  const dispatch = useAppDispatch()
  const [showForm, setShowForm] = useState(false)
  const [editingBatch, setEditingBatch] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { data: batchesData, isLoading, error } = useGetBatchesQuery({ page: 1, limit: 100 })
  const [createBatch, createResult] = useCreateBatchMutation()
  const [deleteBatch, deleteResult] = useDeleteBatchMutation()

  const batches = batchesData?.data || []
  const filteredBatches = batches.filter((batch) =>
    batch.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateBatch = async (name: string) => {
    try {
      await createBatch({ name }).unwrap()
      setShowForm(false)
      setSuccessMessage('Batch created successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Failed to create batch:', getErrorMessage(err))
    }
  }

  const handleDeleteBatch = async (batchId: string) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return
    try {
      await deleteBatch(batchId).unwrap()
      setSuccessMessage('Batch deleted successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Failed to delete batch:', getErrorMessage(err))
    }
  }

  const handleEditBatch = (batch: any) => {
    setEditingBatch(batch)
    setShowForm(true)
  }

  const handleViewAttendance = (batchId: string) => {
    dispatch(setCurrentBatch(batchId))
    onViewAttendance?.(batchId)
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground">
            Manage your classes and batches
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBatch(null)
            setShowForm(!showForm)
          }}
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Batch
        </Button>
      </div>

      {successMessage && (
        <SuccessAlert message={successMessage} />
      )}

      {error && (
        <ErrorAlert error={getErrorMessage(error)} title="Failed to load batches" />
      )}

      {createResult.error && (
        <ErrorAlert error={getErrorMessage(createResult.error)} title="Failed to create batch" />
      )}

      {deleteResult.error && (
        <ErrorAlert error={getErrorMessage(deleteResult.error)} title="Failed to delete batch" />
      )}

      {showForm && (
        <BatchForm
          batch={editingBatch || undefined}
          isLoading={createResult.isLoading}
          error={getErrorMessage(createResult.error)}
          onSubmit={handleCreateBatch}
          onCancel={() => {
            setShowForm(false)
            setEditingBatch(null)
          }}
        />
      )}

      <SearchInput
        placeholder="Search batches by name..."
        value={searchQuery}
        onChange={setSearchQuery}
        disabled={isLoading}
      />

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : filteredBatches.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredBatches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              onEdit={() => handleEditBatch(batch)}
              onDelete={() => handleDeleteBatch(batch.id)}
              onManageStudents={() => onManageStudents?.(batch.id)}
              onViewAttendance={() => handleViewAttendance(batch.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No Batches Found</CardTitle>
            <CardDescription className="text-center">
              {batches.length === 0
                ? 'Create your first batch to get started'
                : 'No batches match your search'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {batches.length === 0 && (
              <Button
                onClick={() => {
                  setEditingBatch(null)
                  setShowForm(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Batch
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
