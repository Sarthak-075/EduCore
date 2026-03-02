/**
 * Batch service layer
 * Wraps batchApi and provides domain-level operations with error handling
 */

import { batchApi, Batch } from '../api/batches'
import { getErrorMessage } from './errorHandler'

export interface BatchListParams {
  page?: number
  limit?: number
  search?: string
}

export interface BatchService {
  listBatches: (params: BatchListParams) => any
  createBatch: (name: string) => any
  updateBatch: (batchId: string, name: string) => any
  deleteBatch: (batchId: string) => any
  getBatchStudents: (batchId: string, page?: number, limit?: number) => any
  enrollStudents: (batchId: string, studentIds: string[]) => any
  removeStudent: (batchId: string, studentId: string) => any
}

export const batchService: BatchService = {
  listBatches: (params) => {
    return batchApi.endpoints.getBatches.initiate({
      page: params.page || 1,
      limit: params.limit || 20,
    })
  },

  createBatch: (name) => {
    if (!name || name.trim().length === 0) {
      throw new Error('Batch name is required')
    }
    if (name.trim().length < 2) {
      throw new Error('Batch name must be at least 2 characters')
    }
    if (name.trim().length > 100) {
      throw new Error('Batch name must not exceed 100 characters')
    }
    return batchApi.endpoints.createBatch.initiate({ name: name.trim() })
  },

  updateBatch: (batchId, name) => {
    if (!batchId) throw new Error('Batch ID is required')
    if (!name || name.trim().length === 0) {
      throw new Error('Batch name is required')
    }
    return batchApi.endpoints.updateBatch.initiate({
      batchId,
      name: name.trim(),
    })
  },

  deleteBatch: (batchId) => {
    if (!batchId) throw new Error('Batch ID is required')
    return batchApi.endpoints.deleteBatch.initiate(batchId)
  },

  getBatchStudents: (batchId, page = 1, limit = 50) => {
    if (!batchId) throw new Error('Batch ID is required')
    return batchApi.endpoints.getBatchStudents.initiate({
      batchId,
      page,
      limit,
    })
  },

  enrollStudents: (batchId, studentIds) => {
    if (!batchId) throw new Error('Batch ID is required')
    if (!studentIds || studentIds.length === 0) {
      throw new Error('At least one student must be selected')
    }
    return batchApi.endpoints.enrollStudents.initiate({
      batchId,
      studentIds,
    })
  },

  removeStudent: (batchId, studentId) => {
    if (!batchId) throw new Error('Batch ID is required')
    if (!studentId) throw new Error('Student ID is required')
    return batchApi.endpoints.removeStudent.initiate({
      batchId,
      studentId,
    })
  },
}
