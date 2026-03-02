import React, { useState, useMemo } from 'react'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { Search, AlertCircle, Loader2 } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area'

export interface Student {
  id: string
  name: string
  parentName?: string
}

interface StudentSelectorProps {
  students: Student[]
  selectedStudentIds: string[]
  onSelectionChange: (studentIds: string[]) => void
  isLoading?: boolean
  error?: string | null
  onConfirm?: () => void
  onCancel?: () => void
  confirmLoading?: boolean
}

export const StudentSelector: React.FC<StudentSelectorProps> = ({
  students,
  selectedStudentIds,
  onSelectionChange,
  isLoading = false,
  error = null,
  onConfirm,
  onCancel,
  confirmLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectAllChecked, setSelectAllChecked] = useState(false)

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.parentName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
  }, [students, searchQuery])

  const handleToggleStudent = (studentId: string) => {
    const newSelection = selectedStudentIds.includes(studentId)
      ? selectedStudentIds.filter((id) => id !== studentId)
      : [...selectedStudentIds, studentId]
    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    if (selectAllChecked) {
      onSelectionChange([])
      setSelectAllChecked(false)
    } else {
      onSelectionChange(filteredStudents.map((s) => s.id))
      setSelectAllChecked(true)
    }
  }

  const isAllFiltered = filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedStudentIds.includes(s.id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Students</CardTitle>
        <CardDescription>
          Choose students to enroll in this batch
          {selectedStudentIds.length > 0 && (
            <span className="ml-2 text-primary">
              ({selectedStudentIds.length} selected)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="student-search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Students
          </Label>
          <Input
            id="student-search"
            placeholder="Search by name or parent name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
            className="text-base"
          />
        </div>

        {students.length > 0 && (
          <div className="flex items-center space-x-2 py-2 border-b">
            <Checkbox
              id="select-all"
              checked={isAllFiltered}
              onCheckedChange={handleSelectAll}
              disabled={isLoading || filteredStudents.length === 0}
            />
            <Label
              htmlFor="select-all"
              className="text-sm font-medium cursor-pointer"
            >
              Select all {filteredStudents.length > 0 ? `(${filteredStudents.length})` : ''}
            </Label>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredStudents.length > 0 ? (
          <ScrollArea className="h-96 border rounded-md p-4">
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md"
                >
                  <Checkbox
                    id={`student-${student.id}`}
                    checked={selectedStudentIds.includes(student.id)}
                    onCheckedChange={() => handleToggleStudent(student.id)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor={`student-${student.id}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    <div className="font-medium">{student.name}</div>
                    {student.parentName && (
                      <div className="text-xs text-muted-foreground">
                        Parent: {student.parentName}
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {students.length === 0 ? 'No students available' : 'No students match your search'}
          </div>
        )}

        {onConfirm && onCancel && (
          <div className="flex gap-2 pt-4">
            <Button
              onClick={onConfirm}
              disabled={confirmLoading || selectedStudentIds.length === 0}
              className="flex-1"
            >
              {confirmLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                `Enroll (${selectedStudentIds.length})`
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={confirmLoading}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
