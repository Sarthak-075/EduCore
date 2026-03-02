import { BatchRepository } from './repository'
import { CreateBatchDTO, EnrollStudentsDTO } from './types'

export class BatchService {
  constructor(private batchRepository: BatchRepository) {}

  /**
   * Create a new batch
   * Validates:
   * - Batch name is not empty
   * - Batch name doesn't already exist for this teacher
   */
  async createBatch(teacherId: string, dto: CreateBatchDTO) {
    // Validate input
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('BATCH_NAME_REQUIRED')
    }

    const nameExists = await this.batchRepository.nameExists(
      teacherId,
      dto.name.trim()
    )
    if (nameExists) {
      throw new Error('BATCH_NAME_EXISTS')
    }

    return this.batchRepository.create(teacherId, dto.name.trim())
  }

  /**
   * Get all batches for teacher
   */
  async getBatches(teacherId: string, page = 1, limit = 20) {
    if (page < 1) page = 1
    if (limit < 1 || limit > 100) limit = 20

    return this.batchRepository.findByTeacherId(teacherId, { page, limit })
  }

  /**
   * Get batch details with students
   */
  async getBatchDetails(batchId: string) {
    const batch = await this.batchRepository.findById(batchId)
    if (!batch) {
      throw new Error('BATCH_NOT_FOUND')
    }

    return batch
  }

  /**
   * Update batch name
   */
  async updateBatch(batchId: string, name: string) {
    if (!name || name.trim().length === 0) {
      throw new Error('BATCH_NAME_REQUIRED')
    }

    const batch = await this.batchRepository.findById(batchId)
    if (!batch) {
      throw new Error('BATCH_NOT_FOUND')
    }

    return this.batchRepository.update(batchId, name.trim())
  }

  /**
   * Delete batch
   * Validates:
   * - Batch exists
   * - No attendance records exist
   */
  async deleteBatch(batchId: string) {
    const batch = await this.batchRepository.findById(batchId)
    if (!batch) {
      throw new Error('BATCH_NOT_FOUND')
    }

    const attendanceCount = await this.batchRepository.getAttendanceCount(
      batchId
    )
    if (attendanceCount > 0) {
      throw new Error('BATCH_HAS_ATTENDANCE')
    }

    return this.batchRepository.delete(batchId)
  }

  /**
   * Enroll students in batch
   * Validates:
   * - Batch exists
   * - Students exist and are active
   * - No duplicates in request
   */
  async enrollStudents(batchId: string, dto: EnrollStudentsDTO) {
    // Validate batch exists
    const batchExists = await this.batchRepository.exists(batchId)
    if (!batchExists) {
      throw new Error('BATCH_NOT_FOUND')
    }

    // Validate input
    if (!dto.studentIds || dto.studentIds.length === 0) {
      throw new Error('STUDENTS_REQUIRED')
    }

    // Remove duplicates
    const uniqueStudentIds = Array.from(new Set(dto.studentIds))

    // Enroll students
    const enrolled = await this.batchRepository.enrollStudents(
      batchId,
      uniqueStudentIds
    )

    return {
      enrolled,
      failed: uniqueStudentIds.length - enrolled,
      message: `${enrolled} student(s) enrolled successfully`
    }
  }

  /**
   * Get students in batch
   */
  async getBatchStudents(batchId: string, page = 1, limit = 50) {
    const batchExists = await this.batchRepository.exists(batchId)
    if (!batchExists) {
      throw new Error('BATCH_NOT_FOUND')
    }

    if (page < 1) page = 1
    if (limit < 1 || limit > 200) limit = 50

    return this.batchRepository.getBatchStudents(batchId, { page, limit })
  }

  /**
   * Remove student from batch
   */
  async removeStudent(studentId: string, batchId: string) {
    const batch = await this.batchRepository.findById(batchId)
    if (!batch) {
      throw new Error('BATCH_NOT_FOUND')
    }

    return this.batchRepository.removeStudent(studentId, batchId)
  }
}
