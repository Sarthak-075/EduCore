import { PrismaClient } from '@prisma/client'
import { MarkAttendanceDTO, AttendanceStatus } from './types'

export class AttendanceRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find attendance record by ID
   */
  async findById(attendanceId: string) {
    return this.prisma.attendance.findUnique({
      where: { id: attendanceId }
    })
  }

  /**
   * Mark attendance for a student on a specific date
   */
  async markAttendance(dto: MarkAttendanceDTO & { batchId: string }) {
    const date = new Date(dto.date)

    return this.prisma.attendance.create({
      data: {
        studentId: dto.studentId,
        batchId: dto.batchId,
        date,
        status: dto.status
      },
      include: {
        student: {
          select: {
            name: true
          }
        }
      }
    })
  }

  /**
   * Check if attendance already marked for student on date
   */
  async findByStudentAndDate(studentId: string, date: string) {
    const dateObj = new Date(date)

    return this.prisma.attendance.findFirst({
      where: {
        studentId,
        date: {
          gte: dateObj,
          lt: new Date(dateObj.getTime() + 86400000) // +24 hours for same day
        }
      }
    })
  }

  /**
   * Get attendance records for a date
   */
  async findByDate(date: string, batchId?: string) {
    const dateObj = new Date(date)

    return this.prisma.attendance.findMany({
      where: {
        date: {
          gte: dateObj,
          lt: new Date(dateObj.getTime() + 86400000)
        },
        ...(batchId && { batchId })
      },
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
  }

  /**
   * Get attendance for student
   */
  async findByStudent(studentId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    return this.prisma.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      orderBy: { date: 'asc' }
    })
  }

  /**
   * Get attendance summary for batch on a date
   */
  async findByBatchAndDate(batchId: string, date: string) {
    const dateObj = new Date(date)

    return this.prisma.attendance.findMany({
      where: {
        batchId,
        date: {
          gte: dateObj,
          lt: new Date(dateObj.getTime() + 86400000)
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  /**
   * Get attendance records (list with pagination)
   */
  async list(
    filters: {
      studentId?: string
      batchId?: string
      date?: string
      page?: number
      limit?: number
    }
  ) {
    const page = Math.max(1, filters.page || 1)
    const limit = Math.max(1, Math.min(100, filters.limit || 20))
    const skip = (page - 1) * limit

    const where: any = {}
    if (filters.studentId) where.studentId = filters.studentId
    if (filters.batchId) where.batchId = filters.batchId

    if (filters.date) {
      const dateObj = new Date(filters.date)
      where.date = {
        gte: dateObj,
        lt: new Date(dateObj.getTime() + 86400000)
      }
    }

    const [records, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.attendance.count({ where })
    ])

    return {
      data: records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Update attendance status
   */
  async update(attendanceId: string, status: AttendanceStatus) {
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { status },
      include: {
        student: {
          select: {
            name: true
          }
        }
      }
    })
  }

  /**
   * Delete attendance record
   */
  async delete(attendanceId: string) {
    return this.prisma.attendance.delete({
      where: { id: attendanceId }
    })
  }

  /**
   * Get monthly summary for batch
   */
  async getMonthlySummary(batchId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const records = await this.prisma.attendance.findMany({
      where: {
        batchId,
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Group by student
    const studentMap = new Map<string, any>()

    records.forEach(record => {
      if (!studentMap.has(record.studentId)) {
        studentMap.set(record.studentId, {
          id: record.student.id,
          name: record.student.name,
          present: 0,
          absent: 0
        })
      }

      const student = studentMap.get(record.studentId)
      if (record.status === 'present') {
        student.present++
      } else {
        student.absent++
      }
    })

    const students = Array.from(studentMap.values())

    return {
      month,
      year,
      totalRecords: records.length,
      students
    }
  }
}
