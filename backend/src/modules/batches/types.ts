// Data Transfer Objects (DTOs) for Batch endpoints

export interface CreateBatchDTO {
  name: string
}

export interface BatchResponse {
  id: string
  teacherId: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface BatchWithStudentsResponse extends BatchResponse {
  students: Array<{
    id: string
    name: string
    parentName?: string
  }>
}

export interface EnrollStudentsDTO {
  studentIds: string[]
}

export interface EnrollStudentsResponse {
  enrolled: number
  failed: number
  message: string
}

export interface BatchListResponse {
  data: BatchResponse[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}
