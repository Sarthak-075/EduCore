// Data Transfer Objects (DTOs) for Attendance endpoints

export type AttendanceStatus = 'present' | 'absent'

export interface MarkAttendanceDTO {
  studentId: string
  date: string // YYYY-MM-DD
  status: AttendanceStatus
}

export interface AttendanceRecordResponse {
  id: string
  studentId: string
  date: string // ISO datetime
  status: AttendanceStatus
  createdAt: string
  student?: {
    name: string
  }
}

export interface AttendanceSummaryDTO {
  month: number // 1-12
  year: number
  studentId?: string // Optional: filter by student
}

export interface AttendanceSummaryResponse {
  total: number
  present: number
  absent: number
  percentage: number
  month: number
  year: number
  students?: Array<{
    id: string
    name: string
    present: number
    absent: number
    percentage: number
  }>
}

export interface AttendanceListResponse {
  data: AttendanceRecordResponse[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}
