import { Request, Response } from 'express'
import { AttendanceService } from './service'
import { MarkAttendanceDTO, AttendanceRecordResponse } from './types'

export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  /**
   * POST /attendance
   * Mark attendance for a student
   */
  async markAttendance(req: Request, res: Response) {
    try {
      const dto: MarkAttendanceDTO = req.body
      const { batchId } = req.query

      if (!batchId) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'batchId query parameter is required'
        })
      }

      const record = await this.attendanceService.markAttendance(
        dto,
        batchId as string
      )

      const response: AttendanceRecordResponse = {
        id: record.id,
        studentId: record.studentId,
        date: record.date.toISOString(),
        status: record.status as 'present' | 'absent',
        createdAt: record.createdAt.toISOString(),
        student: {
          name: record.student?.name || ''
        }
      }

      return res.status(201).json(response)
    } catch (error: any) {
      if (error.message === 'INVALID_STATUS') {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: "Status must be 'present' or 'absent'"
        })
      }

      if (error.message === 'FUTURE_DATE') {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Cannot mark attendance for future dates'
        })
      }

      if (error.message === 'DUPLICATE_ATTENDANCE') {
        return res.status(409).json({
          code: 'DUPLICATE_ATTENDANCE',
          message: 'Attendance already marked for this date'
        })
      }

      console.error('Error marking attendance:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * GET /attendance
   * Get attendance records
   */
  async getAttendance(req: Request, res: Response) {
    try {
      const { studentId, batchId, date, page, limit } = req.query

      const result = await this.attendanceService.getAttendance({
        studentId: studentId as string | undefined,
        batchId: batchId as string | undefined,
        date: date as string | undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20
      })

      return res.status(200).json(result)
    } catch (error: any) {
      if (error.message === 'FILTER_REQUIRED') {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'At least one filter (studentId, batchId, or date) is required'
        })
      }

      console.error('Error fetching attendance:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * GET /attendance/summary/:studentId
   * Get attendance summary for student
   */
  async getStudentSummary(req: Request, res: Response) {
    try {
      const { studentId } = req.params
      const { month, year } = req.query

      const currentDate = new Date()
      const m = month ? parseInt(month as string) : currentDate.getMonth() + 1
      const y = year ? parseInt(year as string) : currentDate.getFullYear()

      const summary = await this.attendanceService.getStudentSummary(
        studentId,
        m,
        y
      )

      return res.status(200).json(summary)
    } catch (error: any) {
      if (error.message === 'INVALID_MONTH') {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Month must be between 1 and 12'
        })
      }

      if (error.message === 'INVALID_YEAR') {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Year must be between 2000 and 2100'
        })
      }

      console.error('Error fetching summary:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * GET /attendance/report/:batchId
   * Get monthly summary for batch
   */
  async getMonthlySummary(req: Request, res: Response) {
    try {
      const { batchId } = req.params
      const { month, year } = req.query

      const currentDate = new Date()
      const m = month ? parseInt(month as string) : currentDate.getMonth() + 1
      const y = year ? parseInt(year as string) : currentDate.getFullYear()

      const summary = await this.attendanceService.getMonthlySummary(batchId, m, y)

      return res.status(200).json(summary)
    } catch (error: any) {
      if (error.message === 'INVALID_MONTH') {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Month must be between 1 and 12'
        })
      }

      if (error.message === 'INVALID_YEAR') {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Year must be between 2000 and 2100'
        })
      }

      console.error('Error fetching report:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * PATCH /attendance/:attendanceId
   * Update attendance record
   */
  async updateAttendance(req: Request, res: Response) {
    try {
      const { attendanceId } = req.params
      const { status } = req.body

      if (!status) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Status is required'
        })
      }

      const record = await this.attendanceService.updateAttendance(
        attendanceId,
        status
      )

      const response: AttendanceRecordResponse = {
        id: record.id,
        studentId: record.studentId,
        date: record.date.toISOString(),
        status: record.status as 'present' | 'absent',
        createdAt: record.createdAt.toISOString(),
        student: {
          name: record.student?.name || ''
        }
      }

      return res.status(200).json(response)
    } catch (error: any) {
      if (error.message === 'ATTENDANCE_NOT_FOUND') {
        return res.status(404).json({
          code: 'ATTENDANCE_NOT_FOUND',
          message: 'Attendance record not found'
        })
      }

      if (error.message === 'INVALID_STATUS') {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: "Status must be 'present' or 'absent'"
        })
      }

      console.error('Error updating attendance:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * DELETE /attendance/:attendanceId
   * Delete attendance record
   */
  async deleteAttendance(req: Request, res: Response) {
    try {
      const { attendanceId } = req.params

      await this.attendanceService.deleteAttendance(attendanceId)

      return res.status(204).send()
    } catch (error: any) {
      if (error.message === 'ATTENDANCE_NOT_FOUND') {
        return res.status(404).json({
          code: 'ATTENDANCE_NOT_FOUND',
          message: 'Attendance record not found'
        })
      }

      if (error.message === 'CANNOT_DELETE_OLD') {
        return res.status(409).json({
          code: 'CANNOT_DELETE_OLD',
          message: 'Cannot delete attendance records older than 7 days'
        })
      }

      console.error('Error deleting attendance:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}
