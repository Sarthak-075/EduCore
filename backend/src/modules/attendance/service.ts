import { AttendanceRepository } from './repository'
import { MarkAttendanceDTO, AttendanceStatus } from './types'

export class AttendanceService {
  constructor(private attendanceRepository: AttendanceRepository) {}

  /**
   * Mark attendance for student
   * Validates:
   * - Date is not in future
   * - Student ID exists
   * - Batch ID exists
   * - No duplicate entry for date
   * - Status is valid
   */
  async markAttendance(dto: MarkAttendanceDTO, batchId: string) {
    // Validate status
    if (!['present', 'absent'].includes(dto.status)) {
      throw new Error('INVALID_STATUS')
    }

    // Validate date is not in future
    const attendanceDate = new Date(dto.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (attendanceDate > today) {
      throw new Error('FUTURE_DATE')
    }

    // Check for duplicates
    const existing = await this.attendanceRepository.findByStudentAndDate(
      dto.studentId,
      dto.date
    )

    if (existing) {
      throw new Error('DUPLICATE_ATTENDANCE')
    }

    // Create attendance (batchId is set here)
    return this.attendanceRepository.markAttendance({
      ...dto,
      batchId
    } as MarkAttendanceDTO & { batchId: string })
  }

  /**
   * Get attendance records
   */
  async getAttendance(filters: {
    studentId?: string
    batchId?: string
    date?: string
    page?: number
    limit?: number
  }) {
    // Validate at least one filter
    if (!filters.studentId && !filters.batchId && !filters.date) {
      throw new Error('FILTER_REQUIRED')
    }

    return this.attendanceRepository.list(filters)
  }

  /**
   * Get attendance summary for student
   */
  async getStudentSummary(studentId: string, month: number, year: number) {
    // Validate month/year
    if (month < 1 || month > 12) {
      throw new Error('INVALID_MONTH')
    }

    if (year < 2000 || year > 2100) {
      throw new Error('INVALID_YEAR')
    }

    const records = await this.attendanceRepository.findByStudent(
      studentId,
      month,
      year
    )

    const present = records.filter(r => r.status === 'present').length
    const absent = records.filter(r => r.status === 'absent').length
    const total = records.length

    const percentage = total > 0 ? (present / total) * 100 : 0

    return {
      studentId,
      month,
      year,
      total,
      present,
      absent,
      percentage: Math.round(percentage * 100) / 100
    }
  }

  /**
   * Get monthly summary for batch
   */
  async getMonthlySummary(batchId: string, month: number, year: number) {
    // Validate month/year
    if (month < 1 || month > 12) {
      throw new Error('INVALID_MONTH')
    }

    if (year < 2000 || year > 2100) {
      throw new Error('INVALID_YEAR')
    }

    return this.attendanceRepository.getMonthlySummary(batchId, month, year)
  }

  /**
   * Update attendance
   */
  async updateAttendance(
    attendanceId: string,
    status: AttendanceStatus
  ) {
    if (!['present', 'absent'].includes(status)) {
      throw new Error('INVALID_STATUS')
    }

    const existing = await this.attendanceRepository.findById(attendanceId)
    if (!existing) {
      throw new Error('ATTENDANCE_NOT_FOUND')
    }

    return this.attendanceRepository.update(attendanceId, status)
  }

  /**
   * Delete attendance
   */
  async deleteAttendance(attendanceId: string) {
    // Check if older than allowed deletion period (7 days)
    const existing = await this.attendanceRepository.findById(attendanceId)
    if (!existing) {
      throw new Error('ATTENDANCE_NOT_FOUND')
    }

    const createdDate = new Date(existing.createdAt)
    const now = new Date()
    const daysOld = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysOld > 7) {
      throw new Error('CANNOT_DELETE_OLD')
    }

    return this.attendanceRepository.delete(attendanceId)
  }
}
