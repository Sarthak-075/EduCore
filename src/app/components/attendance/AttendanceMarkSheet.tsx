import React, { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { AlertCircle, Loader2 } from 'lucide-react'
import { AttendanceToggle } from './AttendanceToggle'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'
import { ScrollArea } from '../ui/scroll-area'
import { SearchInput } from '../ui/search-input'

export interface StudentAttendanceRecord {
  studentId: string
  name: string
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | null
  remarks?: string
}

interface AttendanceMarkSheetProps {
  date: string
  students: StudentAttendanceRecord[]
  onRecordChange: (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LEAVE') => void
  onRemarksChange?: (studentId: string, remarks: string) => void
  isLoading?: boolean
  error?: string | null
  onSubmit?: () => void
  submitLoading?: boolean
  bulkMarkAllowed?: boolean
  onBulkMark?: (status: 'PRESENT' | 'ABSENT' | 'LEAVE') => void
}

export const AttendanceMarkSheet: React.FC<AttendanceMarkSheetProps> = ({
  date,
  students,
  onRecordChange,
  onRemarksChange,
  isLoading = false,
  error = null,
  onSubmit,
  submitLoading = false,
  bulkMarkAllowed = true,
  onBulkMark,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showRemarks, setShowRemarks] = useState(false)

  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [students, searchQuery])

  const markedCount = students.filter((s) => s.status !== null).length
  const presentCount = students.filter((s) => s.status === 'PRESENT').length
  const absentCount = students.filter((s) => s.status === 'ABSENT').length
  const leaveCount = students.filter((s) => s.status === 'LEAVE').length

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>{formattedDate}</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Marked: <span className="font-semibold text-foreground">{markedCount}/{students.length}</span></div>
            <div className="text-xs space-x-2">
              <span className="text-green-600">✓ {presentCount}</span>
              <span className="text-red-600">✗ {absentCount}</span>
              <span className="text-orange-600">○ {leaveCount}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {bulkMarkAllowed && onBulkMark && (
          <div className="bg-muted p-3 rounded-md space-y-2">
            <Label className="text-sm font-medium">Quick Mark All</Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkMark('PRESENT')}
                disabled={isLoading || submitLoading}
              >
                Mark All Present
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkMark('ABSENT')}
                disabled={isLoading || submitLoading}
              >
                Mark All Absent
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkMark('LEAVE')}
                disabled={isLoading || submitLoading}
              >
                Mark All Leave
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <SearchInput
            placeholder="Search student name..."
            value={searchQuery}
            onChange={setSearchQuery}
            disabled={isLoading}
          />
          {showRemarks && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-remarks"
                checked={showRemarks}
                onCheckedChange={(checked) => setShowRemarks(checked as boolean)}
              />
              <Label htmlFor="show-remarks" className="text-sm">
                Show remarks column
              </Label>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredStudents.length > 0 ? (
          <ScrollArea className="border rounded-md">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="sticky top-0 bg-muted">
                  <TableRow>
                    <TableHead className="w-[200px]">Student Name</TableHead>
                    <TableHead className="w-[300px]">Attendance</TableHead>
                    {showRemarks && <TableHead className="flex-1">Remarks</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.studentId} className="hover:bg-accent">
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        <AttendanceToggle
                          status={student.status}
                          onChange={(status) => onRecordChange(student.studentId, status)}
                          disabled={isLoading || submitLoading}
                          size="sm"
                        />
                      </TableCell>
                      {showRemarks && (
                        <TableCell>
                          <Input
                            placeholder="Add remarks..."
                            value={student.remarks || ''}
                            onChange={(e) =>
                              onRemarksChange?.(student.studentId, e.target.value)
                            }
                            disabled={isLoading || submitLoading}
                            className="text-xs"
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {students.length === 0 ? 'No students in this batch' : 'No students match your search'}
          </div>
        )}

        {onSubmit && (
          <div className="flex gap-2 pt-4">
            <Button
              onClick={onSubmit}
              disabled={submitLoading || markedCount === 0}
              className="flex-1"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                `Submit Attendance (${markedCount}/${students.length})`
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
