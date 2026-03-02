import { Request, Response } from 'express'
import { BatchService } from './service'
import {
  CreateBatchDTO,
  BatchResponse,
  EnrollStudentsResponse,
  EnrollStudentsDTO
} from './types'

export class BatchController {
  constructor(private batchService: BatchService) {}

  /**
   * POST /batches
   * Create a new batch
   */
  async createBatch(req: Request, res: Response) {
    try {
      const teacherId = (req as any).teacherId
      if (!teacherId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const dto: CreateBatchDTO = req.body

      const batch = await this.batchService.createBatch(teacherId, dto)

      const response: BatchResponse = {
        id: batch.id,
        teacherId: batch.teacherId,
        name: batch.name,
        createdAt: batch.createdAt.toISOString(),
        updatedAt: batch.updatedAt.toISOString()
      }

      return res.status(201).json(response)
    } catch (error: any) {
      if (error.message === 'BATCH_NAME_REQUIRED') {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Batch name is required'
        })
      }

      if (error.message === 'BATCH_NAME_EXISTS') {
        return res.status(409).json({
          code: 'DUPLICATE_BATCH',
          message: 'Batch with this name already exists'
        })
      }

      console.error('Error creating batch:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * GET /batches
   * List all batches for teacher
   */
  async listBatches(req: Request, res: Response) {
    try {
      const teacherId = (req as any).teacherId
      if (!teacherId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1)
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20)

      const result = await this.batchService.getBatches(teacherId, page, limit)

      return res.status(200).json(result)
    } catch (error: any) {
      console.error('Error fetching batches:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * GET /batches/:batchId
   * Get batch details with students
   */
  async getBatchDetails(req: Request, res: Response) {
    try {
      const { batchId } = req.params

      const batch = await this.batchService.getBatchDetails(batchId)

      return res.status(200).json(batch)
    } catch (error: any) {
      if (error.message === 'BATCH_NOT_FOUND') {
        return res.status(404).json({
          code: 'BATCH_NOT_FOUND',
          message: 'Batch not found'
        })
      }

      console.error('Error fetching batch details:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * PATCH /batches/:batchId
   * Update batch
   */
  async updateBatch(req: Request, res: Response) {
    try {
      const { batchId } = req.params
      const { name } = req.body

      const batch = await this.batchService.updateBatch(batchId, name)

      const response: BatchResponse = {
        id: batch.id,
        teacherId: batch.teacherId,
        name: batch.name,
        createdAt: batch.createdAt.toISOString(),
        updatedAt: batch.updatedAt.toISOString()
      }

      return res.status(200).json(response)
    } catch (error: any) {
      if (error.message === 'BATCH_NOT_FOUND') {
        return res.status(404).json({
          code: 'BATCH_NOT_FOUND',
          message: 'Batch not found'
        })
      }

      if (error.message === 'BATCH_NAME_REQUIRED') {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Batch name is required'
        })
      }

      console.error('Error updating batch:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * DELETE /batches/:batchId
   * Delete batch
   */
  async deleteBatch(req: Request, res: Response) {
    try {
      const { batchId } = req.params

      await this.batchService.deleteBatch(batchId)

      return res.status(204).send()
    } catch (error: any) {
      if (error.message === 'BATCH_NOT_FOUND') {
        return res.status(404).json({
          code: 'BATCH_NOT_FOUND',
          message: 'Batch not found'
        })
      }

      if (error.message === 'BATCH_HAS_ATTENDANCE') {
        return res.status(409).json({
          code: 'CANNOT_DELETE_BATCH',
          message: 'Cannot delete batch with attendance records'
        })
      }

      console.error('Error deleting batch:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * POST /batches/:batchId/students
   * Enroll students in batch
   */
  async enrollStudents(req: Request, res: Response) {
    try {
      const { batchId } = req.params
      const dto: EnrollStudentsDTO = req.body

      const result = await this.batchService.enrollStudents(batchId, dto)

      return res.status(200).json(result)
    } catch (error: any) {
      if (error.message === 'BATCH_NOT_FOUND') {
        return res.status(404).json({
          code: 'BATCH_NOT_FOUND',
          message: 'Batch not found'
        })
      }

      if (error.message === 'STUDENTS_REQUIRED') {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'At least one student ID is required'
        })
      }

      console.error('Error enrolling students:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * GET /batches/:batchId/students
   * Get students in batch
   */
  async getBatchStudents(req: Request, res: Response) {
    try {
      const { batchId } = req.params
      const page = Math.max(1, parseInt(req.query.page as string) || 1)
      const limit = Math.max(1, parseInt(req.query.limit as string) || 50)

      const result = await this.batchService.getBatchStudents(
        batchId,
        page,
        limit
      )

      return res.status(200).json(result)
    } catch (error: any) {
      if (error.message === 'BATCH_NOT_FOUND') {
        return res.status(404).json({
          code: 'BATCH_NOT_FOUND',
          message: 'Batch not found'
        })
      }

      console.error('Error fetching batch students:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * DELETE /batches/:batchId/students/:studentId
   * Remove student from batch
   */
  async removeStudent(req: Request, res: Response) {
    try {
      const { batchId, studentId } = req.params

      await this.batchService.removeStudent(studentId, batchId)

      return res.status(204).send()
    } catch (error: any) {
      if (error.message === 'BATCH_NOT_FOUND') {
        return res.status(404).json({
          code: 'BATCH_NOT_FOUND',
          message: 'Batch not found'
        })
      }

      console.error('Error removing student:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}
