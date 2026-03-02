import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { attendanceApi } from '../api/attendance'

export interface AttendanceRecord {
  studentId: string
  status: 'PRESENT' | 'ABSENT' | 'LEAVE'
  remarks?: string
}

export interface AttendanceState {
  selectedDate: string // YYYY-MM-DD
  selectedBatchId: string | null
  records: Record<string, AttendanceRecord> // studentId -> record
  bulkMode: boolean
  bulkRecords: Record<string, AttendanceRecord> // For bulk operations
  unsavedChanges: boolean
  loading: boolean
  error: string | null
  successMessage: string | null
}

const today = new Date().toISOString().split('T')[0]

const initialState: AttendanceState = {
  selectedDate: today,
  selectedBatchId: null,
  records: {},
  bulkMode: false,
  bulkRecords: {},
  unsavedChanges: false,
  loading: false,
  error: null,
  successMessage: null,
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload
      state.records = {}
      state.unsavedChanges = false
    },
    setSelectedBatchId: (state, action: PayloadAction<string | null>) => {
      state.selectedBatchId = action.payload
      state.records = {}
      state.unsavedChanges = false
    },
    setAttendanceRecord: (
      state,
      action: PayloadAction<{ studentId: string; record: AttendanceRecord }>,
    ) => {
      state.records[action.payload.studentId] = action.payload.record
      state.unsavedChanges = true
    },
    setMultipleRecords: (state, action: PayloadAction<Record<string, AttendanceRecord>>) => {
      state.records = action.payload
      state.unsavedChanges = false
    },
    toggleBulkMode: (state) => {
      state.bulkMode = !state.bulkMode
      if (!state.bulkMode) {
        state.bulkRecords = {}
      }
    },
    setBulkRecord: (
      state,
      action: PayloadAction<{ studentId: string; record: AttendanceRecord }>,
    ) => {
      state.bulkRecords[action.payload.studentId] = action.payload.record
    },
    clearBulkRecords: (state) => {
      state.bulkRecords = {}
    },
    addBulkRecord: (
      state,
      action: PayloadAction<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LEAVE' }>,
    ) => {
      const { studentId, status } = action.payload
      state.bulkRecords[studentId] = {
        studentId,
        status,
        remarks: '',
      }
    },
    removeBulkRecord: (state, action: PayloadAction<string>) => {
      delete state.bulkRecords[action.payload]
    },
    clearRecords: (state) => {
      state.records = {}
      state.unsavedChanges = false
    },
    clearError: (state) => {
      state.error = null
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null
    },
    resetState: (state) => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    // Get Attendance
    builder
      .addMatcher(attendanceApi.endpoints.getAttendance.matchPending, (state) => {
        state.loading = true
        state.error = null
      })
      .addMatcher(attendanceApi.endpoints.getAttendance.matchFulfilled, (state, action) => {
        state.loading = false
        const records: Record<string, AttendanceRecord> = {}
        action.payload.data.forEach((record) => {
          records[record.studentId] = {
            studentId: record.studentId,
            status: record.status,
            remarks: record.remarks,
          }
        })
        state.records = records
        state.unsavedChanges = false
      })
      .addMatcher(attendanceApi.endpoints.getAttendance.matchRejected, (state, action) => {
        state.loading = false
        const errorMsg = typeof action.error.message === 'string' 
          ? action.error.message 
          : 'Failed to fetch attendance'
        state.error = errorMsg
      })

    // Mark Attendance
    builder
      .addMatcher(attendanceApi.endpoints.markAttendance.matchPending, (state) => {
        state.loading = true
        state.error = null
      })
      .addMatcher(attendanceApi.endpoints.markAttendance.matchFulfilled, (state, action) => {
        state.loading = false
        state.records = {}
        state.bulkRecords = {}
        state.unsavedChanges = false
        state.successMessage = `Attendance marked for ${action.payload.marked}/${action.payload.total} students`
      })
      .addMatcher(attendanceApi.endpoints.markAttendance.matchRejected, (state, action) => {
        state.loading = false
        const errorMsg = typeof action.error.message === 'string' 
          ? action.error.message 
          : 'Failed to mark attendance'
        state.error = errorMsg
      })

    // Update Attendance
    builder
      .addMatcher(attendanceApi.endpoints.updateAttendance.matchPending, (state) => {
        state.loading = true
        state.error = null
      })
      .addMatcher(
        attendanceApi.endpoints.updateAttendance.matchFulfilled,
        (state, action) => {
          state.loading = false
          state.records[action.payload.studentId] = {
            studentId: action.payload.studentId,
            status: action.payload.status,
            remarks: action.payload.remarks,
          }
          state.successMessage = 'Attendance updated'
        },
      )
      .addMatcher(attendanceApi.endpoints.updateAttendance.matchRejected, (state, action) => {
        state.loading = false
        const errorMsg = typeof action.error.message === 'string' 
          ? action.error.message 
          : 'Failed to update attendance'
        state.error = errorMsg
      })

    // Delete Attendance
    builder
      .addMatcher(attendanceApi.endpoints.deleteAttendance.matchPending, (state) => {
        state.loading = true
        state.error = null
      })
      .addMatcher(
        attendanceApi.endpoints.deleteAttendance.matchFulfilled,
        (state, action) => {
          state.loading = false
          state.successMessage = 'Attendance record deleted'
        },
      )
      .addMatcher(attendanceApi.endpoints.deleteAttendance.matchRejected, (state, action) => {
        state.loading = false
        const errorMsg = typeof action.error.message === 'string' 
          ? action.error.message 
          : 'Failed to delete attendance'
        state.error = errorMsg
      })

    // Get Monthly Summary
    builder
      .addMatcher(attendanceApi.endpoints.getMonthlySummary.matchPending, (state) => {
        state.loading = true
        state.error = null
      })
      .addMatcher(
        attendanceApi.endpoints.getMonthlySummary.matchRejected,
        (state, action) => {
          state.loading = false
          const errorMsg = typeof action.error.message === 'string' 
            ? action.error.message 
            : 'Failed to fetch monthly summary'
          state.error = errorMsg
        },
      )
  },
})

export const {
  setSelectedDate,
  setSelectedBatchId,
  setAttendanceRecord,
  setMultipleRecords,
  toggleBulkMode,
  setBulkRecord,
  clearBulkRecords,
  addBulkRecord,
  removeBulkRecord,
  clearRecords,
  clearError,
  clearSuccessMessage,
  resetState,
} = attendanceSlice.actions

export default attendanceSlice.reducer
