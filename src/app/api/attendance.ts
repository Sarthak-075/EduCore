import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface AttendanceRecord {
  id: string
  batchId: string
  studentId: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LEAVE'
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface MarkAttendancePayload {
  batchId: string
  date: string
  records: Array<{
    studentId: string
    status: 'PRESENT' | 'ABSENT' | 'LEAVE'
    remarks?: string
  }>
}

export interface AttendanceResponse {
  batchId: string
  date: string
  marked: number
  total: number
}

export interface StudentAttendanceSummary {
  studentId: string
  name: string
  totalDays: number
  presentDays: number
  absentDays: number
  leaveDays: number
  percentage: number
}

export interface AttendanceReport {
  batchId: string
  month: number
  year: number
  summary: StudentAttendanceSummary[]
}

export interface BulkAttendanceResponse {
  success: number
  failed: number
  errors?: Array<{ studentId: string; error: string }>
}

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Attendance', 'AttendanceReport'],
  endpoints: (builder) => ({
    // Queries
    getAttendance: builder.query<
      {
        data: AttendanceRecord[]
        pagination: { page: number; limit: number; total: number }
      },
      { batchId: string; date?: string; page?: number; limit?: number }
    >({
      query: ({ batchId, date, page = 1, limit = 50 }) => {
        let url = `/batches/${batchId}/attendance?page=${page}&limit=${limit}`
        if (date) url += `&date=${date}`
        return url
      },
      providesTags: (result, error, { batchId, date }) => [
        { type: 'Attendance', id: `${batchId}-${date || 'all'}` },
      ],
    }),

    getStudentAttendanceSummary: builder.query<StudentAttendanceSummary, string>({
      query: (studentId) => `/attendance/summary/${studentId}`,
      providesTags: (result, error, studentId) => [
        { type: 'AttendanceReport', id: studentId },
      ],
    }),

    getMonthlySummary: builder.query<
      AttendanceReport,
      { batchId: string; month: number; year: number }
    >({
      query: ({ batchId, month, year }) =>
        `/batches/${batchId}/attendance/summary?month=${month}&year=${year}`,
      providesTags: (result, error, { batchId, month, year }) => [
        { type: 'AttendanceReport', id: `${batchId}-${year}-${month}` },
      ],
    }),

    getAttendanceRecord: builder.query<AttendanceRecord, string>({
      query: (recordId) => `/attendance/${recordId}`,
      providesTags: (result, error, recordId) => [
        { type: 'Attendance', id: recordId },
      ],
    }),

    // Mutations
    markAttendance: builder.mutation<AttendanceResponse, MarkAttendancePayload>({
      query: (payload) => ({
        url: `/batches/${payload.batchId}/attendance`,
        method: 'POST',
        body: {
          date: payload.date,
          records: payload.records,
        },
      }),
      invalidatesTags: (result, error, { batchId, date }) => [
        { type: 'Attendance', id: `${batchId}-${date}` },
        { type: 'AttendanceReport', id: 'LIST' },
      ],
    }),

    updateAttendance: builder.mutation<
      AttendanceRecord,
      { recordId: string; status: 'PRESENT' | 'ABSENT' | 'LEAVE'; remarks?: string }
    >({
      query: ({ recordId, status, remarks }) => ({
        url: `/attendance/${recordId}`,
        method: 'PATCH',
        body: { status, remarks },
      }),
      invalidatesTags: (result, error, { recordId }) => [
        { type: 'Attendance', id: recordId },
        { type: 'AttendanceReport', id: 'LIST' },
      ],
    }),

    deleteAttendance: builder.mutation<void, string>({
      query: (recordId) => ({
        url: `/attendance/${recordId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),

    resetMonthlyAttendance: builder.mutation<
      { deleted: number },
      { batchId: string; month: number; year: number }
    >({
      query: ({ batchId, month, year }) => ({
        url: `/batches/${batchId}/attendance/reset`,
        method: 'DELETE',
        body: { month, year },
      }),
      invalidatesTags: (result, error, { batchId, month, year }) => [
        { type: 'AttendanceReport', id: `${batchId}-${year}-${month}` },
      ],
    }),
  }),
})

export const {
  useGetAttendanceQuery,
  useGetStudentAttendanceSummaryQuery,
  useGetMonthlySummaryQuery,
  useGetAttendanceRecordQuery,
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useResetMonthlyAttendanceMutation,
} = attendanceApi
