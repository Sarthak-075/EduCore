import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../utils/hooks'
import {
  useGetBatchesQuery,
  useGetBatchStudentsQuery,
} from '../api/batches'
import {
  useGetAttendanceQuery,
  useMarkAttendanceMutation,
} from '../api/attendance'
import {
  setSelectedDate,
  setSelectedBatchId,
  setAttendanceRecord,
  setMultipleRecords,
  clearRecords,
  clearError,
} from '../store/attendanceSlice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { CalendarIcon } from 'lucide-react'
import { AttendanceMarkSheet, StudentAttendanceRecord } from '../components/attendance/AttendanceMarkSheet'
import { AttendanceSummaryCard } from '../components/attendance/AttendanceSummaryCard'
import { ErrorAlert, SuccessAlert } from '../components/ui/alerts'
import { getErrorMessage } from '../services/errorHandler'
import { AttendanceState } from '../types'

export const AttendanceScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const attendanceState = useAppSelector((state) => state.attendance as AttendanceState)
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
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (attendanceData?.data) {
      const recordMap: Record<string, { studentId: string; status?: 'PRESENT' | 'ABSENT' | 'LEAVE'; remarks?: string }> = {}
      attendanceData.data.forEach((record: { studentId: string; status: string; remarks?: string }) => {
        recordMap[record.studentId] = {
          studentId: record.studentId,
          status: record.status as 'PRESENT' | 'ABSENT' | 'LEAVE',
          remarks: record.remarks,
        }
      })
      dispatch(setMultipleRecords(recordMap as any))
    }
  }, [attendanceData, students, dispatch])

  const studentRecords: StudentAttendanceRecord[] = students.map((student: { id: string; name: string }) => ({
    studentId: student.id,
    name: student.name,
    status: (records[student.id]?.status || null) as 'PRESENT' | 'ABSENT' | 'LEAVE' | null,
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
    const currentRecord = records[studentId];
    dispatch(
      setAttendanceRecord({
        studentId,
        record: { 
          studentId, 
          status: (currentRecord?.status || 'PRESENT') as 'PRESENT' | 'ABSENT' | 'LEAVE',
          remarks 
        },
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
      setSuccessMsg('Attendance marked successfully')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error('Failed to mark attendance:', getErrorMessage(err))
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

      {successMsg && (
        <SuccessAlert message={successMsg} />
      )}

      {error && (
        <ErrorAlert error={typeof error === 'string' ? error : 'An error occurred'} title="Error" />
      )}

      {markResult.error && (
        <ErrorAlert error={getErrorMessage(markResult.error)} title="Failed to mark attendance" />
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
                <input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          error={getErrorMessage(markResult.error)}
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
