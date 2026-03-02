import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { batchApi } from '../api/batches'

export interface Batch {
  id: string
  teacherId: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface BatchState {
  batches: Batch[]
  currentBatchId: string | null
  filter: {
    search: string
    sortBy: 'name' | 'createdAt'
    sortOrder: 'asc' | 'desc'
  }
  loading: boolean
  error: string | null
}

const initialState: BatchState = {
  batches: [],
  currentBatchId: null,
  filter: {
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
  },
  loading: false,
  error: null,
}

const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
    setCurrentBatch: (state, action: PayloadAction<string | null>) => {
      state.currentBatchId = action.payload
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.filter.search = action.payload
    },
    setSortBy: (state, action: PayloadAction<'name' | 'createdAt'>) => {
      state.filter.sortBy = action.payload
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.filter.sortOrder = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    resetFilter: (state) => {
      state.filter = {
        search: '',
        sortBy: 'name',
        sortOrder: 'asc',
      }
    },
  },
  extraReducers: (builder) => {
    // Get Batches
    builder
      .addMatcher(batchApi.endpoints.getBatches.matchPending, (state) => {
        state.loading = true
        state.error = null
      })
      .addMatcher(batchApi.endpoints.getBatches.matchFulfilled, (state, action) => {
        state.loading = false
        state.batches = action.payload.data
      })
      .addMatcher(batchApi.endpoints.getBatches.matchRejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch batches'
      })

    // Create Batch
    builder
      .addMatcher(batchApi.endpoints.createBatch.matchPending, (state) => {
        state.loading = true
        state.error = null
      })
      .addMatcher(batchApi.endpoints.createBatch.matchFulfilled, (state, action) => {
        state.loading = false
        state.batches.push(action.payload)
      })
      .addMatcher(batchApi.endpoints.createBatch.matchRejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create batch'
      })

    // Update Batch
    builder
      .addMatcher(batchApi.endpoints.updateBatch.matchPending, (state) => {
        state.loading = true
        state.error = null
      })
      .addMatcher(batchApi.endpoints.updateBatch.matchFulfilled, (state, action) => {
        state.loading = false
        const index = state.batches.findIndex((b) => b.id === action.payload.id)
        if (index !== -1) {
          state.batches[index] = action.payload
        }
      })
      .addMatcher(batchApi.endpoints.updateBatch.matchRejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update batch'
      })

    // Delete Batch
    builder
      .addMatcher(batchApi.endpoints.deleteBatch.matchPending, (state) => {
        state.loading = true
        state.error = null
      })
      .addMatcher(batchApi.endpoints.deleteBatch.matchFulfilled, (state) => {
        state.loading = false
        if (state.currentBatchId) {
          state.batches = state.batches.filter((b) => b.id !== state.currentBatchId)
          state.currentBatchId = null
        }
      })
      .addMatcher(batchApi.endpoints.deleteBatch.matchRejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete batch'
      })

    // Enroll Students
    builder
      .addMatcher(batchApi.endpoints.enrollStudents.matchPending, (state) => {
        state.loading = true
        state.error = null
      })
      .addMatcher(batchApi.endpoints.enrollStudents.matchFulfilled, (state) => {
        state.loading = false
      })
      .addMatcher(batchApi.endpoints.enrollStudents.matchRejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to enroll students'
      })
  },
})

export const {
  setCurrentBatch,
  setSearch,
  setSortBy,
  setSortOrder,
  clearError,
  resetFilter,
} = batchSlice.actions

export default batchSlice.reducer
