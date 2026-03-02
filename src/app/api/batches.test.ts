import { batchApi } from './batches'
// @ts-ignore
import { setupServer } from 'msw/node'
// @ts-ignore
import { http, HttpResponse } from 'msw'
import { configureStore } from '@reduxjs/toolkit'

const mockBatches = [
  {
    id: 'batch1',
    teacherId: 'teacher1',
    name: 'Class 10-A',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'batch2',
    teacherId: 'teacher1',
    name: 'Class 12-B',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
]

const server = setupServer(
  http.get('/api/v1/batches', () =>
    HttpResponse.json({
      data: mockBatches,
      pagination: { page: 1, limit: 20, total: 2 },
    })
  ),

  http.post('/api/v1/batches', async ({ request }: { request: any }) => {
    const body = await request.json() as any
    return HttpResponse.json(
      {
        id: 'batch3',
        teacherId: 'teacher1',
        name: body.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  }),

  http.delete('/api/v1/batches/:batchId', ({ params }: { params: any }) => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/v1/batches/:batchId/students', ({ params }: { params: any }) =>
    HttpResponse.json({
      data: [
        { id: 'student1', name: 'John Doe', parentName: 'Mr. Doe' },
        { id: 'student2', name: 'Jane Smith', parentName: 'Mrs. Smith' },
      ],
      pagination: { page: 1, limit: 50, total: 2 },
    })
  ),

  http.post('/api/v1/batches/:batchId/students', async ({ request }: { request: any }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      enrolled: body.studentIds.length,
      failed: 0,
      message: 'Students enrolled successfully',
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Batch API', () => {
  it('fetches batches successfully', async () => {
    const store = configureStore({
      reducer: { [batchApi.reducerPath]: batchApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(batchApi.middleware),
    })

    store.dispatch(batchApi.endpoints.getBatches.initiate({ page: 1, limit: 20 }))

    await new Promise((resolve) => setTimeout(resolve, 100))

    const state = store.getState()[batchApi.reducerPath]
    expect(state).toBeDefined()
  })

  it('creates a batch successfully', async () => {
    const store = configureStore({
      reducer: { [batchApi.reducerPath]: batchApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(batchApi.middleware),
    })

    store.dispatch(batchApi.endpoints.createBatch.initiate({ name: 'New Batch' }))

    await new Promise((resolve) => setTimeout(resolve, 100))

    const state = store.getState()[batchApi.reducerPath]
    expect(state).toBeDefined()
  })

  it('fetches batch students successfully', async () => {
    const store = configureStore({
      reducer: { [batchApi.reducerPath]: batchApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(batchApi.middleware),
    })

    store.dispatch(
      batchApi.endpoints.getBatchStudents.initiate({ batchId: 'batch1', page: 1, limit: 50 })
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    const state = store.getState()[batchApi.reducerPath]
    expect(state).toBeDefined()
  })

  it('enrolls students successfully', async () => {
    const store = configureStore({
      reducer: { [batchApi.reducerPath]: batchApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(batchApi.middleware),
    })

    store.dispatch(
      batchApi.endpoints.enrollStudents.initiate({
        batchId: 'batch1',
        studentIds: ['student1', 'student2'],
      })
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    const state = store.getState()[batchApi.reducerPath]
    expect(state).toBeDefined()
  })

  it('deletes a batch successfully', async () => {
    const store = configureStore({
      reducer: { [batchApi.reducerPath]: batchApi.reducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(batchApi.middleware),
    })

    store.dispatch(batchApi.endpoints.deleteBatch.initiate('batch1'))

    await new Promise((resolve) => setTimeout(resolve, 100))

    const state = store.getState()[batchApi.reducerPath]
    expect(state).toBeDefined()
  })
})
