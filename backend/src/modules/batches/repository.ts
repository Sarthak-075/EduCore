import { PrismaClient } from '@prisma/client'

export class BatchRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new batch
   */
  async create(teacherId: string, name: string) {
    return this.prisma.batch.create({
      data: {
        teacherId,
        name
      }
    })
  }

  /**
   * Find batch by ID
   */
  async findById(batchId: string) {
    return this.prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            parentName: true
          }
        }
      }
    })
  }

  /**
   * Find all batches for a teacher
   */
  async findByTeacherId(
    teacherId: string,
    options: { page: number; limit: number } = { page: 1, limit: 20 }
  ) {
    const skip = (options.page - 1) * options.limit

    const [batches, total] = await Promise.all([
      this.prisma.batch.findMany({
        where: { teacherId },
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.batch.count({
        where: { teacherId }
      })
    ])

    return {
      data: batches,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    }
  }

  /**
   * Update batch name
   */
  async update(batchId: string, name: string) {
    return this.prisma.batch.update({
      where: { id: batchId },
      data: { name }
    })
  }

  /**
   * Delete batch (if no attendance records)
   */
  async delete(batchId: string) {
    return this.prisma.batch.delete({
      where: { id: batchId }
    })
  }

  /**
   * Check if batch exists
   */
  async exists(batchId: string): Promise<boolean> {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId }
    })
    return !!batch
  }

  /**
   * Check if batch name already exists for teacher
   */
  async nameExists(teacherId: string, name: string): Promise<boolean> {
    const batch = await this.prisma.batch.findFirst({
      where: {
        teacherId,
        name
      }
    })
    return !!batch
  }

  /**
   * Enroll students in batch
   */
  async enrollStudents(batchId: string, studentIds: string[]) {
    // Get existing enrollment IDs
    const existingStudents = await this.prisma.student.findMany({
      where: {
        id: { in: studentIds },
        isActive: true
      },
      select: { id: true }
    })

    const existingIds = new Set(existingStudents.map(s => s.id))

    // Filter valid, non-duplicate students
    const validIds = studentIds.filter(id => existingIds.has(id))

    if (validIds.length === 0) {
      return 0
    }

    // Update students with batch ID
    await this.prisma.student.updateMany({
      where: {
        id: { in: validIds }
      },
      data: { batchId }
    })

    return validIds.length
  }

  /**
   * Get students in batch
   */
  async getBatchStudents(
    batchId: string,
    options: { page: number; limit: number } = { page: 1, limit: 50 }
  ) {
    const skip = (options.page - 1) * options.limit

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where: { batchId },
        skip,
        take: options.limit,
        select: {
          id: true,
          name: true,
          parentName: true,
          parentPhone: true,
          monthlyFee: true
        }
      }),
      this.prisma.student.count({
        where: { batchId }
      })
    ])

    return {
      data: students,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    }
  }

  /**
   * Remove student from batch
   */
  async removeStudent(studentId: string, batchId: string) {
    return this.prisma.student.update({
      where: { id: studentId },
      data: { batchId: null }
    })
  }

  /**
   * Get attendance count for batch (for deletion validation)
   */
  async getAttendanceCount(batchId: string): Promise<number> {
    return this.prisma.attendance.count({
      where: { batchId }
    })
  }
}
