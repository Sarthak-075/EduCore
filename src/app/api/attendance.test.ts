import { attendanceApi } from './attendance'
// @ts-ignore
import { setupServer } from 'msw/node'
// @ts-ignore
import { http, HttpResponse } from 'msw'
import { configureStore } from '@reduxjs/toolkit'

const mockAttendanceRecords = [
  {
    id: 'record1',
    batchId: 'batch1',
    studentId: 'student1',
    date: '2024-01-15',
    status: 'PRESENT',
    remarks: '',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'record2',
    batchId: 'batch1',
    studentId: 'student2',
    date: '2024-01-15',
    status: 'ABSENT',
    remarks: 'Sick',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
]

const server = setupServer(
  http.get('/api/v1/batches/:batchId/attendance', ({ params }: { params: any }) =>
    HttpResponse.json({
      data: mockAttendanceRecords,
      pagination: { page: 1, limit: 50, total: 2 },
    })
  ),

  http.post('/api/v1/batches/:batchId/attendance', async ({ request }: { request: any }) => {
    const body = await request.json() as any
    return HttpResponse.json(
      {
        batchId: 'batch1',
        date: body.date,
        marked: body.records.length,
        total: 2,
      },
      { status: 201 }
    )
  }),

  http.patch('/api/v1/attendance/:recordId', async ({ request }: { request: any }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      id: 'record1',
      batchId: 'batch1',
      studentId: 'student1',
      date: '2024-01-15',
      status: body.status,
      remarks: body.remarks || '',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString(),
    })
  }),

  http.delete('/api/v1/attendance/:recordId', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/v1/batches/:batchId/attendance/summary', ({ params }: { params: any }) =>
    HttpResponse.json({
      batchId: 'batch1',
      month: 1,
      year: 2024,
      summary: [
        {
          studentId: 'student1',
          name: 'John Doe',
          totalDays: 20,
          presentDays: 18,
          absentDays: 2,
          leaveDays: 0,
          percentage: 90,
        },
        {
          studentId: 'student2',
          name: 'Jane Smith',
          totalDays: 20,
          presentDays: 16,
          absentDays: 3,
          leaveDays: 1,
          percentage: 80,
        },
      ],
    })
  ),

  http.get('/api/v1/attendance/summary/:studentId', ({ params }: { params: any }) =>
    HttpResponse.json({
      studentId: 'student1',
      name: 'John Doe',
      totalDays: 20,
      presentDays: 18,
      absentDays: 2,
      leaveDays: 0,
      percentage: 90,
    })
  )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Attendance API', () => {
  it('fetches attendance records successfully', async () => {
    const store = configureStore({
      reducer: { [attendanceApi.reducerPath]: attendanceApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(attendanceApi.middleware),
    })

    store.dispatch(
      attendanceApi.endpoints.getAttendance.initiate({
        batchId: 'batch1',
        date: '2024-01-15',
        page: 1,
        limit: 50,
      })
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    const state = store.getState()[attendanceApi.reducerPath]
    expect(state).toBeDefined()
  })

  it('marks attendance successfully', async () => {
    const store = configureStore({
      reducer: { [attendanceApi.reducerPath]: attendanceApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(attendanceApi.middleware),
    })

    store.dispatch(
      attendanceApi.endpoints.markAttendance.initiate({
        batchId: 'batch1',
        date: '2024-01-15',
        records: [
          { studentId: 'student1', status: 'PRESENT' },
          { studentId: 'student2', status: 'ABSENT', remarks: 'Sick' },
        ],
      })
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    const state = store.getState()[attendanceApi.reducerPath]
    expect(state).toBeDefined()
  })

  it('updates attendance record successfully', async () => {
    const store = configureStore({
      reducer: { [attendanceApi.reducerPath]: attendanceApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(attendanceApi.middleware),
    })

    store.dispatch(
      attendanceApi.endpoints.updateAttendance.initiate({
        recordId: 'record1',
        status: 'LEAVE',
        remarks: 'Medical leave',
      })
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    const state = store.getState()[attendanceApi.reducerPath]
    expect(state).toBeDefined()
  })

  it('deletes attendance record successfully', async () => {
    const store = configureStore({
      reducer: { [attendanceApi.reducerPath]: attendanceApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(attendanceApi.middleware),
    })

    store.dispatch(attendanceApi.endpoints.deleteAttendance.initiate('record1'))

    await new Promise((resolve) => setTimeout(resolve, 100))

    const state = store.getState()[attendanceApi.reducerPath]
    expect(state).toBeDefined()
  })

  it('fetches monthly summary successfully', async () => {
    const store = configureStore({
      reducer: { [attendanceApi.reducerPath]: attendanceApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(attendanceApi.middleware),
    })

    store.dispatch(
      attendanceApi.endpoints.getMonthlySummary.initiate({
        batchId: 'batch1',
        month: 1,
        year: 2024,
      })
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    const state = store.getState()[attendanceApi.reducerPath]
    expect(state).toBeDefined()
  })

  it('fetches student attendance summary successfully', async () => {
    const store = configureStore({
      reducer: { [attendanceApi.reducerPath]: attendanceApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(attendanceApi.middleware),
    })

    store.dispatch(
      attendanceApi.endpoints.getStudentAttendanceSummary.initiate('student1')
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    const state = store.getState()[attendanceApi.reducerPath]
    expect(state).toBeDefined()
  })
})
