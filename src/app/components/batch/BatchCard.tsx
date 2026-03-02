import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Batch } from '../../api/batches'

interface BatchCardProps {
  batch: Batch
  studentCount?: number
  onEdit?: (batch: Batch) => void
  onDelete?: (batchId: string) => void
  onManageStudents?: (batch: Batch) => void
  onViewAttendance?: (batch: Batch) => void
}

export const BatchCard: React.FC<BatchCardProps> = ({
  batch,
  studentCount = 0,
  onEdit,
  onDelete,
  onManageStudents,
  onViewAttendance,
}) => {
  const createdDate = new Date(batch.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{batch.name}</CardTitle>
            <CardDescription className="mt-2">
              ID: {batch.id.slice(0, 8)}...
            </CardDescription>
          </div>
          <Badge variant="secondary">{studentCount} students</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Created: {createdDate}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 flex-wrap">
        {onManageStudents && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManageStudents(batch)}
          >
            Manage Students
          </Button>
        )}
        {onViewAttendance && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewAttendance(batch)}
          >
            View Attendance
          </Button>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(batch)}
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(batch.id)}
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
