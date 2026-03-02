import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import { AttendanceController } from './controller'
import { AttendanceService } from './service'
import { AttendanceRepository } from './repository'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const attendanceRepository = new AttendanceRepository(prisma)
const attendanceService = new AttendanceService(attendanceRepository)
const attendanceController = new AttendanceController(attendanceService)

export const attendanceRoutes = Router()

// Mark attendance
attendanceRoutes.post(
  '/',
  authenticate,
  attendanceController.markAttendance.bind(attendanceController)
)

// Get attendance records
attendanceRoutes.get(
  '/',
  authenticate,
  attendanceController.getAttendance.bind(attendanceController)
)

// Get student summary
attendanceRoutes.get(
  '/summary/:studentId',
  authenticate,
  attendanceController.getStudentSummary.bind(attendanceController)
)

// Get batch monthly report
attendanceRoutes.get(
  '/report/:batchId',
  authenticate,
  attendanceController.getMonthlySummary.bind(attendanceController)
)

// Update attendance
attendanceRoutes.patch(
  '/:attendanceId',
  authenticate,
  attendanceController.updateAttendance.bind(attendanceController)
)

// Delete attendance
attendanceRoutes.delete(
  '/:attendanceId',
  authenticate,
  attendanceController.deleteAttendance.bind(attendanceController)
)

export default attendanceRoutes
