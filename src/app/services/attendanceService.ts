/**
 * Attendance service layer
 * Wraps attendanceApi and provides domain-level operations with error handling
 */

import { attendanceApi, MarkAttendancePayload, AttendanceRecord } from '../api/attendance'

export interface AttendanceService {
  markAttendance: (payload: MarkAttendancePayload) => any
  getAttendance: (batchId: string, date?: string, page?: number, limit?: number) => any
  getMonthlySummary: (batchId: string, month: number, year: number) => any
  getStudentSummary: (studentId: string) => any
  updateRecord: (recordId: string, status: 'PRESENT' | 'ABSENT' | 'LEAVE', remarks?: string) => any
  deleteRecord: (recordId: string) => any
}

export const attendanceService: AttendanceService = {
  markAttendance: (payload) => {
    if (!payload.batchId) throw new Error('Batch ID is required')
    if (!payload.date) throw new Error('Date is required')
    if (!payload.records || payload.records.length === 0) {
      throw new Error('At least one attendance record is required')
    }

    // Validate future dates
    const recordDate = new Date(payload.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (recordDate > today) {
      throw new Error('Cannot mark attendance for future dates')
    }

    // Validate each record
    payload.records.forEach((record, index) => {
      if (!record.studentId) {
        throw new Error(`Record ${index + 1}: Student ID is required`)
      }
      if (!['PRESENT', 'ABSENT', 'LEAVE'].includes(record.status)) {
        throw new Error(
          `Record ${index + 1}: Invalid status. Must be PRESENT, ABSENT, or LEAVE`
        )
      }
    })

    return attendanceApi.endpoints.markAttendance.initiate(payload)
  },

  getAttendance: (batchId, date, page = 1, limit = 50) => {
    if (!batchId) throw new Error('Batch ID is required')
    return attendanceApi.endpoints.getAttendance.initiate({
      batchId,
      date,
      page,
      limit,
    })
  },

  getMonthlySummary: (batchId, month, year) => {
    if (!batchId) throw new Error('Batch ID is required')
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12')
    }
    if (year < 2000) {
      throw new Error('Year must be valid')
    }
    return attendanceApi.endpoints.getMonthlySummary.initiate({
      batchId,
      month,
      year,
    })
  },

  getStudentSummary: (studentId) => {
    if (!studentId) throw new Error('Student ID is required')
    return attendanceApi.endpoints.getStudentAttendanceSummary.initiate(studentId)
  },

  updateRecord: (recordId, status, remarks) => {
    if (!recordId) throw new Error('Record ID is required')
    if (!['PRESENT', 'ABSENT', 'LEAVE'].includes(status)) {
      throw new Error('Invalid status. Must be PRESENT, ABSENT, or LEAVE')
    }
    return attendanceApi.endpoints.updateAttendance.initiate({
      recordId,
      status,
      remarks,
    })
  },

  deleteRecord: (recordId) => {
    if (!recordId) throw new Error('Record ID is required')
    return attendanceApi.endpoints.deleteAttendance.initiate(recordId)
  },
}
