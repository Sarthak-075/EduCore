import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface Batch {
  id: string
  teacherId: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface EnrollStudentsResponse {
  enrolled: number
  failed: number
  message: string
}

export interface BatchStudent {
  id: string
  name: string
  parentName?: string
}

export interface BatchListResponse {
  data: Batch[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

export const batchApi = createApi({
  reducerPath: 'batchApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Batch'],
  endpoints: (builder) => ({
    // Queries
    getBatches: builder.query<BatchListResponse, { page?: number; limit?: number } | void>({
      query: (params) => {
        const page = (params as any)?.page || 1
        const limit = (params as any)?.limit || 20
        return `/batches?page=${page}&limit=${limit}`
      },
      providesTags: [{ type: 'Batch', id: 'LIST' }],
    }),

    getBatchById: builder.query<Batch & { students: BatchStudent[] }, string>({
      query: (batchId) => `/batches/${batchId}`,
      providesTags: (result, error, batchId) => [{ type: 'Batch', id: batchId }],
    }),

    getBatchStudents: builder.query<
      { data: BatchStudent[]; pagination: { page: number; limit: number; total: number } },
      { batchId: string; page?: number; limit?: number }
    >({
      query: ({ batchId, page = 1, limit = 50 }) =>
        `/batches/${batchId}/students?page=${page}&limit=${limit}`,
      providesTags: (result, error, { batchId }) => [
        { type: 'Batch', id: `${batchId}-students` },
      ],
    }),

    // Mutations
    createBatch: builder.mutation<Batch, { name: string }>({
      query: (body) => ({
        url: '/batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Batch', id: 'LIST' }],
    }),

    updateBatch: builder.mutation<Batch, { batchId: string; name: string }>({
      query: ({ batchId, name }) => ({
        url: `/batches/${batchId}`,
        method: 'PATCH',
        body: { name },
      }),
      invalidatesTags: (result, error, { batchId }) => [{ type: 'Batch', id: batchId }],
    }),

    deleteBatch: builder.mutation<void, string>({
      query: (batchId) => ({
        url: `/batches/${batchId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Batch', id: 'LIST' }],
    }),

    enrollStudents: builder.mutation<
      EnrollStudentsResponse,
      { batchId: string; studentIds: string[] }
    >({
      query: ({ batchId, studentIds }) => ({
        url: `/batches/${batchId}/students`,
        method: 'POST',
        body: { studentIds },
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: 'Batch', id: batchId },
        { type: 'Batch', id: `${batchId}-students` },
      ],
    }),

    removeStudent: builder.mutation<void, { batchId: string; studentId: string }>({
      query: ({ batchId, studentId }) => ({
        url: `/batches/${batchId}/students/${studentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: 'Batch', id: `${batchId}-students` },
      ],
    }),
  }),
})

export const {
  useGetBatchesQuery,
  useGetBatchByIdQuery,
  useGetBatchStudentsQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
  useEnrollStudentsMutation,
  useRemoveStudentMutation,
} = batchApi
