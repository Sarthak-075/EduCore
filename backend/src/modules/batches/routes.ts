import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { BatchController } from './controller'
import { BatchService } from './service'
import { BatchRepository } from './repository'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const batchRepository = new BatchRepository(prisma)
const batchService = new BatchService(batchRepository)
const batchController = new BatchController(batchService)

export const batchRoutes = Router()

// Create batch
batchRoutes.post(
  '/',
  authenticate,
  batchController.createBatch.bind(batchController)
)

// List batches
batchRoutes.get(
  '/',
  authenticate,
  batchController.listBatches.bind(batchController)
)

// Get batch details
batchRoutes.get(
  '/:batchId',
  authenticate,
  batchController.getBatchDetails.bind(batchController)
)

// Update batch
batchRoutes.patch(
  '/:batchId',
  authenticate,
  batchController.updateBatch.bind(batchController)
)

// Delete batch
batchRoutes.delete(
  '/:batchId',
  authenticate,
  batchController.deleteBatch.bind(batchController)
)

// Enroll students
batchRoutes.post(
  '/:batchId/students',
  authenticate,
  batchController.enrollStudents.bind(batchController)
)

// Get batch students
batchRoutes.get(
  '/:batchId/students',
  authenticate,
  batchController.getBatchStudents.bind(batchController)
)

// Remove student from batch
batchRoutes.delete(
  '/:batchId/students/:studentId',
  authenticate,
  batchController.removeStudent.bind(batchController)
)

export default batchRoutes
