import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import {
  useGetBatchesQuery,
  useGetBatchStudentsQuery,
} from '../../api/batches'
import {
  useGetAttendanceQuery,
  useMarkAttendanceMutation,
} from '../../api/attendance'
import {
  setSelectedDate,
  setSelectedBatchId,
  setAttendanceRecord,
  setMultipleRecords,
  clearRecords,
  clearError,
} from '../../store/attendanceSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertCircle, CheckCircle, CalendarIcon } from 'lucide-react'
import { AttendanceMarkSheet, StudentAttendanceRecord } from '../attendance/AttendanceMarkSheet'
import { AttendanceSummaryCard } from '../attendance/AttendanceSummaryCard'

export const AttendanceScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const attendanceState = useAppSelector((state) => state.attendance)
  const { selectedDate, selectedBatchId, records, bulkMode, error, successMessage } =
    attendanceState

  const { data: batchesData } = useGetBatchesQuery({ page: 1, limit: 100 })
  const { data: studentsData } = useGetBatchStudentsQuery(
    { batchId: selectedBatchId || '', page: 1, limit: 100 },
    { skip: !selectedBatchId }
  )
  const { data: attendanceData, isLoading: attendanceLoading } = useGetAttendanceQuery(
    { batchId: selectedBatchId || '', date: selectedDate, page: 1, limit: 100 },
    { skip: !selectedBatchId }
  )
  const [markAttendance, markResult] = useMarkAttendanceMutation()

  const batches = batchesData?.data || []
  const students = studentsData?.data || []

  const [view, setView] = useState<'marking' | 'summary'>('marking')
  const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth() + 1)
  const [summaryYear, setSummaryYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (attendanceData?.data) {
      const recordMap: Record<string, StudentAttendanceRecord> = {}
      attendanceData.data.forEach((record: any) => {
        recordMap[record.studentId] = {
          studentId: record.studentId,
          name: students.find((s: any) => s.id === record.studentId)?.name || record.studentId,
          status: record.status,
          remarks: record.remarks,
        }
      })
      dispatch(setMultipleRecords(recordMap))
    }
  }, [attendanceData, students])

  const studentRecords: StudentAttendanceRecord[] = students.map((student: any) => ({
    studentId: student.id,
    name: student.name,
    status: records[student.id]?.status || null,
    remarks: records[student.id]?.remarks || '',
  }))

  const handleDateChange = (date: string) => {
    dispatch(setSelectedDate(date))
  }

  const handleBatchChange = (batchId: string) => {
    dispatch(setSelectedBatchId(batchId || null))
    dispatch(clearRecords())
  }

  const handleRecordChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LEAVE') => {
    dispatch(setAttendanceRecord({ studentId, record: { studentId, status } }))
  }

  const handleRemarksChange = (studentId: string, remarks: string) => {
    dispatch(
      setAttendanceRecord({
        studentId,
        record: { ...records[studentId], remarks },
      })
    )
  }

  const handleBulkMark = (status: 'PRESENT' | 'ABSENT' | 'LEAVE') => {
    studentRecords.forEach((student) => {
      dispatch(setAttendanceRecord({ studentId: student.studentId, record: { studentId: student.studentId, status } }))
    })
  }

  const handleSubmitAttendance = async () => {
    if (!selectedBatchId) return

    const recordsToSubmit = studentRecords
      .filter((r) => r.status !== null)
      .map((r) => ({
        studentId: r.studentId,
        status: r.status!,
        remarks: r.remarks,
      }))

    if (recordsToSubmit.length === 0) {
      dispatch(clearError())
      alert('Please mark attendance for at least one student')
      return
    }

    try {
      await markAttendance({
        batchId: selectedBatchId,
        date: selectedDate,
        records: recordsToSubmit,
      }).unwrap()
      dispatch(clearRecords())
    } catch (err) {
      console.error('Failed to mark attendance:', err)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">
          Mark and manage attendance for your batches
        </p>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          variant={view === 'marking' ? 'default' : 'outline'}
          onClick={() => setView('marking')}
        >
          Mark Attendance
        </Button>
        <Button
          variant={view === 'summary' ? 'default' : 'outline'}
          onClick={() => setView('summary')}
        >
          View Summary
        </Button>
      </div>

      {view === 'marking' ? (
        <Card>
          <CardHeader>
            <CardTitle>Select Date and Batch</CardTitle>
            <CardDescription>
              Choose a date and batch to mark attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Select value={selectedBatchId || ''} onValueChange={handleBatchChange}>
                  <SelectTrigger id="batch">
                    <SelectValue placeholder="Select a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {view === 'marking' && selectedBatchId ? (
        <AttendanceMarkSheet
          date={selectedDate}
          students={studentRecords}
          onRecordChange={handleRecordChange}
          onRemarksChange={handleRemarksChange}
          isLoading={attendanceLoading}
          error={markResult.error?.data?.message}
          onSubmit={handleSubmitAttendance}
          submitLoading={markResult.isLoading}
          bulkMarkAllowed={true}
          onBulkMark={handleBulkMark}
        />
      ) : view === 'marking' ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Please select a batch to mark attendance</p>
          </CardContent>
        </Card>
      ) : null}

      {view === 'summary' && selectedBatchId ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Month and Year</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="month">Month</Label>
                <Select value={summaryMonth.toString()} onValueChange={(v) => setSummaryMonth(Number(v))}>
                  <SelectTrigger id="month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {new Date(2024, m - 1).toLocaleDateString('en-IN', {
                          month: 'long',
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="year">Year</Label>
                <Select value={summaryYear.toString()} onValueChange={(v) => setSummaryYear(Number(v))}>
                  <SelectTrigger id="year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025, 2026].map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <AttendanceSummaryCard
            month={summaryMonth}
            year={summaryYear}
            summaries={studentRecords.map((r) => ({
              studentId: r.studentId,
              name: r.name,
              totalDays: 20,
              presentDays: 16,
              absentDays: 3,
              leaveDays: 1,
              percentage: 80,
            }))}
            isLoading={false}
          />
        </div>
      ) : null}
    </div>
  )
}
