# EduCore V2: Technical Architecture & State Management

## 1. Database Architecture

### Entity Relationship Diagram

```
┌────────────┐
│  Teacher   │
│ (V1 exist) │
└──────┬─────┘
       │ 1:N
       │ teacherId
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
   ┌───▼────┐      ┌─────▼────┐       ┌────▼─────┐
   │Students│      │  Batches │       │ Payments │
   │(V1)    │      │  (NEW)   │       │  (V1)    │
   └───┬────┘      └─────┬────┘       └──────────┘
       │                 │
       │ N:N         ┌───┴────────┐
       │ junction    │            │
       │             │ 1:N        │ 1:N
   ┌───▼──────────┐  │            │
   │BatchStudents │  │     ┌──────▼────────┐
   │  (NEW)       │  │     │  Attendance   │
   └──────────────┘  │     │    (NEW)      │
                     │     └───────────────┘
                     │
                     └─ Batch has many Attendance
```

### Normalized Schema

**V1 Models (Unchanged)**
```
Teacher
├── id (PK)
├── email (UNIQUE)
├── passwordHash
├── name
├── phone
└── timestamps

Student
├── id (PK)
├── teacherId (FK)
├── name
├── parentName
├── parentPhone
├── parentEmail
├── monthlyFee
├── dueDay
├── isActive
└── timestamps

Payment
├── id (PK)
├── studentId (FK)
├── month
├── year
├── amountPaid
├── dateReceived
└── timestamps
```

**V2 New Models**
```
Batch
├── id (PK, CUID)
├── teacherId (FK) ← one teacher can have multiple batches
├── name
├── schedule (nullable)
├── createdAt
├── updatedAt
└── INDEX(teacherId) for fast teacher queries

BatchStudents (Junction Table)
├── batchId (FK, PK)
├── studentId (FK, PK)
├── enrolledDate
├── INDEX(studentId) for fast student lookups
└── CONSTRAINT: student can be in multiple batches

Attendance
├── id (PK, CUID)
├── studentId (FK)
├── batchId (FK)
├── date (DATE)
├── status (ENUM: 'present', 'absent', 'leave')
├── remarks (nullable)
├── createdAt
├── UNIQUE(studentId, batchId, date)
├── INDEX(batchId, date) for batch attendance on date
└── INDEX(studentId, batchId) for student history
```

### Query Optimization Strategy

```typescript
// DON'T: N+1 problem
batches.forEach(batch => {
  const students = db.student.findMany({ where: { batchId: batch.id } })
})

// DO: Include relations
const batches = db.batch.findMany({
  where: { teacherId },
  include: {
    students: { include: { attendance: true } },
    attendance: true
  }
})

// DO: Use specific select for large tables
const attendance = db.attendance.findMany({
  where: { batchId, date: today },
  select: {
    id: true,
    studentId: true,
    status: true,
    student: { select: { name: true } }
  },
  take: 100,
  skip: (page - 1) * 100
})
```

---

## 2. Backend API Architecture

### Service Layer Pattern

```
┌──────────────────────────────────────┐
│         Express Routes               │
│    (batch.routes, attendance.routes) │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│      Controllers                      │
│  (batch.controller, attendance.*)     │
│  - Input validation                   │
│  - Response formatting               │
│  - Error handling                    │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│      Services                        │
│  (batch.service, attendance.*)       │
│  - Business logic                    │
│  - Complex queries                   │
│  - Data transformation               │
│  - Validation rules                  │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│      Repositories                    │
│  (batch.repository, attendance.*)    │
│  - Data access layer                 │
│  - Prisma queries                    │
│  - Query building                    │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│      Prisma Client                   │
│  - ORM mapping                       │
│  - Type generated                    │
└──────────────────────────────────────┘
```

### API Contract Examples

**POST /api/v1/batches**
```typescript
// Request
{
  "name": "Morning Batch - Class 10",
  "schedule": "Mon, Wed, Fri - 7:00 AM"
}

// Response (201 Created)
{
  "id": "clc3pm4z5000108lc8d8x",
  "teacherId": "clc2pm4z5000108lc8d8y",
  "name": "Morning Batch - Class 10",
  "schedule": "Mon, Wed, Fri - 7:00 AM",
  "createdAt": "2026-03-02T10:30:00Z"
}

// Error (409 Conflict)
{
  "error": "Batch with this name already exists"
}
```

**POST /api/v1/batches/:batchId/students**
```typescript
// Request
{
  "studentIds": ["student1", "student2", "student3"]
}

// Response (200 OK)
{
  "enrolled": 3,
  "failed": 0,
  "message": "All students enrolled successfully"
}

// Error (400 Bad Request)
{
  "error": "Student not_enrolled is not enrolled in batch",
  "details": {
    "reason": "StudentNotFoundInBatch",
    "studentId": "not_enrolled"
  }
}
```

**POST /api/v1/attendance/bulk**
```typescript
// Request
{
  "batchId": "clc3pm4z5000108lc8d8x",
  "date": "2026-03-02",
  "records": [
    { "studentId": "s1", "status": "present", "remarks": "" },
    { "studentId": "s2", "status": "absent", "remarks": "Sick leave" },
    { "studentId": "s3", "status": "leave", "remarks": "Family emergency" }
  ]
}

// Response (201 Created)
{
  "created": 3,
  "failed": 0,
  "records": [
    { "id": "att1", "studentId": "s1", "status": "present" },
    { "id": "att2", "studentId": "s2", "status": "absent" },
    { "id": "att3", "studentId": "s3", "status": "leave" }
  ]
}

// Error (400 Bad Request)
{
  "error": "Validation failed",
  "failed": [
    {
      "studentId": "s1",
      "reason": "DuplicateEntry",
      "message": "Attendance already marked for this date"
    }
  ]
}
```

**GET /api/v1/attendance/report/:batchId**
```typescript
// Query params: ?month=3&year=2026&studentId=optional

// Response (200 OK)
{
  "batchId": "clc3pm4z5000108lc8d8x",
  "month": 3,
  "year": 2026,
  "summary": {
    "totalDays": 25,
    "studentsEnrolled": 30
  },
  "students": [
    {
      "id": "s1",
      "name": "Arjun Sharma",
      "present": 23,
      "absent": 1,
      "leave": 1,
      "percentage": 95.83
    }
  ]
}
```

---

## 3. State Management Architecture

### Redux Store Shape

```typescript
interface RootState {
  // V1 (unchanged)
  auth: AuthState
  students: StudentState
  dashboard: DashboardState
  payments: PaymentState
  
  // V2 (new)
  batches: BatchState
  attendance: AttendanceState
}

// NEW: Batch State
interface BatchState {
  // Data
  batches: Batch[]
  currentBatchId: string | null
  
  // Pagination
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  
  // Filters
  filters: {
    searchTerm: string
    sortBy: 'name' | 'createdAt'
  }
  
  // UI State
  isCreating: boolean
  isEditing: boolean
  selectedBatchForEnrollment: Batch | null
  
  // Async
  loading: boolean
  error: string | null
  success: string | null
}

// NEW: Attendance State
interface AttendanceState {
  // Data
  records: Attendance[]
  report: AttendanceReport | null
  
  // Selection
  selectedDate: Date
  selectedBatchId: string | null
  selectedStudentId: string | null
  
  // Bulk Operations
  bulkMode: boolean
  bulkRecords: Map<string, 'present' | 'absent' | 'leave'>
  bulkDate: Date | null
  
  // Filtering
  filters: {
    status: 'all' | 'present' | 'absent' | 'leave'
    dateRange: [Date, Date]
  }
  
  // Async
  loading: boolean
  error: string | null
}
```

### State Mutations (Redux Slices)

**batchSlice.ts**
```typescript
const batchSlice = createSlice({
  name: 'batches',
  initialState,
  reducers: {
    // Setters
    setBatches: (state, action) => {
      state.batches = action.payload
    },
    setCurrentBatch: (state, action) => {
      state.currentBatchId = action.payload
    },
    addBatch: (state, action) => {
      state.batches.push(action.payload)
    },
    updateBatchInState: (state, action) => {
      const index = state.batches.findIndex(b => b.id === action.payload.id)
      if (index !== -1) state.batches[index] = action.payload
    },
    removeBatchFromState: (state, action) => {
      state.batches = state.batches.filter(b => b.id !== action.payload)
    },
    
    // Filters
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload
      state.pagination.page = 1 // Reset pagination on filter
    },
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload
    },
    
    // UI
    setIsCreating: (state, action) => {
      state.isCreating = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    }
  },
  extraReducers: (builder) => {
    // RTK Query fulfilled/pending/rejected
    builder
      .addMatcher(
        batchApi.endpoints.getBatches.matchFulfilled,
        (state, action) => {
          state.batches = action.payload
          state.loading = false
        }
      )
      .addMatcher(
        batchApi.endpoints.createBatch.matchFulfilled,
        (state, action) => {
          state.batches.push(action.payload)
          state.isCreating = false
        }
      )
  }
})
```

**attendanceSlice.ts**
```typescript
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    // Data
    setRecords: (state, action) => {
      state.records = action.payload
    },
    setReport: (state, action) => {
      state.report = action.payload
    },
    
    // Selection
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload
    },
    setSelectedBatch: (state, action) => {
      state.selectedBatchId = action.payload
    },
    
    // Bulk mode
    enableBulkMode: (state, action) => {
      state.bulkMode = true
      state.bulkDate = action.payload.date
      state.bulkRecords.clear()
    },
    disableBulkMode: (state) => {
      state.bulkMode = false
      state.bulkRecords.clear()
      state.bulkDate = null
    },
    addBulkRecord: (state, action) => {
      const { studentId, status } = action.payload
      state.bulkRecords.set(studentId, status)
    },
    removeBulkRecord: (state, action) => {
      state.bulkRecords.delete(action.payload)
    },
    
    // Filtering
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload
    },
    
    // Async
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    }
  },
  extraReducers: builder => {
    // RTK Query hooks
    builder.addMatcher(
      attendanceApi.endpoints.markBulkAttendance.matchFulfilled,
      (state, action) => {
        state.records = action.payload
        state.bulkMode = false
        state.bulkRecords.clear()
        state.loading = false
      }
    )
  }
})
```

### RTK Query API Slices

**batchApi.ts**
```typescript
export const batchApi = createApi({
  reducerPath: 'batchApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'include',
    prepareHeaders: (headers) => {
      // Auth headers if needed
      return headers
    }
  }),
  endpoints: (builder) => ({
    // Queries
    getBatches: builder.query<Batch[], void>({
      query: () => '/batches',
      providesTags: ['Batch'],
      // Transform response to normalize data
      transformResponse: (response: BatchResponse) => {
        return response.data || []
      }
    }),
    
    getBatchStudents: builder.query<Student[], string>({
      query: (batchId) => `/batches/${batchId}/students`,
      providesTags: (result, error, batchId) => [{ type: 'BatchStudents', id: batchId }]
    }),
    
    // Mutations
    createBatch: builder.mutation<Batch, CreateBatchDTO>({
      query: (data) => ({
        url: '/batches',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Batch']
    }),
    
    enrollStudents: builder.mutation<void, EnrollStudentsDTO>({
      query: ({ batchId, studentIds }) => ({
        url: `/batches/${batchId}/students`,
        method: 'POST',
        body: { studentIds }
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: 'BatchStudents', id: batchId }
      ]
    })
  })
})

export const {
  useGetBatchesQuery,
  useGetBatchStudentsQuery,
  useCreateBatchMutation,
  useEnrollStudentsMutation
} = batchApi
```

**attendanceApi.ts**
```typescript
export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1'
  }),
  endpoints: (builder) => ({
    // Queries
    getAttendanceRecord: builder.query<Attendance[], GetAttendanceDTO>({
      query: ({ batchId, date }) => 
        `/attendance?batchId=${batchId}&date=${date}`,
      providesTags: (result, error, { batchId, date }) => [
        { type: 'Attendance', id: `${batchId}-${date}` }
      ]
    }),
    
    getAttendanceReport: builder.query<AttendanceReport, GetReportDTO>({
      query: ({ batchId, month, year }) =>
        `/attendance/report/${batchId}?month=${month}&year=${year}`,
      providesTags: (result, error, { batchId, month, year }) => [
        { type: 'AttendanceReport', id: `${batchId}-${month}-${year}` }
      ]
    }),
    
    // Mutations
    markAttendance: builder.mutation<Attendance, MarkAttendanceDTO>({
      query: (data) => ({
        url: '/attendance/mark',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { batchId, date }) => [
        { type: 'Attendance', id: `${batchId}-${date}` }
      ]
    }),
    
    markBulkAttendance: builder.mutation<Attendance[], MarkBulkDTO>({
      query: (data) => ({
        url: '/attendance/bulk',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { batchId, date }) => [
        { type: 'Attendance', id: `${batchId}-${date}` }
      ]
    })
  })
})
```

---

## 4. Data Flow Diagrams

### User Interaction Flow

```
User Creates Batch
        │
        ▼
┌──────────────────┐
│ BatchForm Modal  │
├──────────────────┤
│ Input validation │
│ - Name required  │
│ - Schedule opt   │
└────────┬─────────┘
         │ User clicks "Create"
         │ Dispatch mutation
         ▼
┌──────────────────────────────────────┐
│ Redux: createBatch mutation          │
│ - Set UI to loading state           │
│ - Call API                          │
└────────┬─────────────────────────────┘
         │
         ▼ HTTP POST /batches
┌──────────────────────────────────────┐
│ Backend: BatchController.createBatch │
│ - Validate input                    │
│ - Check teaches owns it             │
│ - Call service                      │
└────────┬─────────────────────────────┘
         │
         ▼ Service layer
┌──────────────────────────────────────┐
│ BatchService.create()                │
│ - Check permissions                 │
│ - Build data                        │
│ - Call repository                   │
└────────┬─────────────────────────────┘
         │
         ▼ Prisma
┌──────────────────────────────────────┐
│ prisma.batch.create()                │
│ - INSERT into DB                    │
│ - Return record                     │
└────────┬─────────────────────────────┘
         │
         ◀─ HTTP 201 + Batch object
┌──────────────────────────────────────┐
│ RTK Query: Fulfill mutation          │
│ - Cache response                    │
│ - Invalidate 'Batch' tag           │
└────────┬─────────────────────────────┘
         │
         ▼ Refetch (auto)
┌──────────────────────────────────────┐
│ RTK Query: getBatches query          │
│ - Fetch updated list                │
└────────┬─────────────────────────────┘
         │
         ◀─ Updated batches array
┌──────────────────────────────────────┐
│ Redux: setBatches action             │
│ - Update state.batches[]            │
│ - Set loading = false               │
└────────┬─────────────────────────────┘
         │
         ▼ Component re-render
┌──────────────────────────────────────┐
│ BatchList component                  │
│ - Read state.batches from store     │
│ - Display new batch in list         │
│ - Show success toast                │
└──────────────────────────────────────┘
```

### Attendance Marking Data Flow

```
AttendanceMarkSheet Component (Table)
        │
        ├─ Student 1 ─ Status: [Absent] ◄─ User clicks Present
        ├─ Student 2 ─ Status: [Present]
        └─ Student 3 ─ Status: [Leave]
        │
        ▼ Bulk Collection
┌──────────────────────────────────────────┐
│ State: bulkRecords Map                   │
│ {                                        │
│   "s1": "present",                       │
│   "s2": "present",                       │
│   "s3": "leave"                          │
│ }                                        │
└────────┬─────────────────────────────────┘
         │ User clicks "Mark Attendance"
         │ Dispatch markBulkAttendance mutation
         ▼
┌──────────────────────────────────────────┐
│ RTK Query Mutation                       │
│ {                                        │
│   batchId: "batch123",                   │
│   date: "2026-03-02",                    │
│   records: [                             │
│     { studentId: "s1", status: "present" }
│     { studentId: "s2", status: "present" }
│     { studentId: "s3", status: "leave" }
│   ]                                      │
│ }                                        │
└────────┬─────────────────────────────────┘
         │ POST /api/v1/attendance/bulk
         ▼
┌──────────────────────────────────────────┐
│ Backend: AttendanceController            │
│ - Validate all records                   │
│ - Extract batchId, date                  │
│ - Call service                           │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ AttendanceService                        │
│ - Validate date not in future            │
│ - For each record:                       │
│   - Check student enrolled               │
│   - Check no duplicate                   │
│ - Batch insert with transaction          │
└────────┬─────────────────────────────────┘
         │
         ▼ Prisma Transaction
┌──────────────────────────────────────────┐
│ DB: $transaction([                       │
│   attendance.create({s1,present,...}),   │
│   attendance.create({s2,present,...}),   │
│   attendance.create({s3,leave,...})      │
│ ])                                       │
└────────┬─────────────────────────────────┘
         │ Success
         ▼ [att1, att2, att3]
┌──────────────────────────────────────────┐
│ RTK Query                                │
│ - Cache response                         │
│ - Invalidate related tags               │
│ - Auto-refetch getAttendanceRecord      │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Redux: attendanceSlice                   │
│ - setRecords(att1, att2, att3)           │
│ - disableBulkMode()                      │
│ - setLoading(false)                      │
└────────┬─────────────────────────────────┘
         │
         ▼ Component re-render
┌──────────────────────────────────────────┤
│ AttendanceMarkSheet                      │
│ - All status badges update               │
│ - Toast: "Attendance marked (3)"         │
│ - Bulk selection cleared                 │
└──────────────────────────────────────────┘
```

---

## 5. Error Handling Strategy

### Error Boundary & Recovery

```typescript
// API Error Types
enum AttendanceErrorCode {
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  STUDENT_NOT_ENROLLED = 'STUDENT_NOT_ENROLLED',
  BATCH_NOT_FOUND = 'BATCH_NOT_FOUND',
  INVALID_DATE = 'INVALID_DATE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// Error Response Format
interface APIErrorResponse {
  code: AttendanceErrorCode
  message: string
  details?: Record<string, any>
  timestamp: string
}

// Frontend Error Handling
function AttendanceMarkSheet() {
  const [error, setError] = useState<AttendanceErrorCode | null>(null)
  
  const { mutate: markBulk } = useMarkBulkAttendanceMutation()
  
  const handleSubmit = async () => {
    try {
      await markBulk(data).unwrap()
      setError(null)
      showSuccessToast('Attendance marked successfully')
    } catch (err: any) {
      const errorCode = err.data?.code
      
      switch (errorCode) {
        case 'DUPLICATE_ENTRY':
          setError('DUP')
          showErrorToast('Some records already marked. Please refresh.')
          break
          
        case 'STUDENT_NOT_ENROLLED':
          setError('ENROLL')
          showErrorToast('One or more students not enrolled in this batch.')
          break
          
        case 'INVALID_DATE':
          setError('DATE')
          showErrorToast('Cannot mark attendance for future dates.')
          break
          
        default:
          setError('UNKNOWN')
          showErrorToast('Failed to mark attendance. Please try again.')
      }
    }
  }
  
  return (
    <div>
      {error && <ErrorAlert code={error} onDismiss={() => setError(null)} />}
      {/* UI */}
    </div>
  )
}
```

---

## 6. Performance Optimization

### Caching Strategy

```typescript
// RTK Query Cache Configuration
const batchApi = createApi({
  endpoints: (builder) => ({
    getBatches: builder.query({
      query: () => '/batches',
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
      // Refetch if stale for > 1 hour
      refetchOnMountOrArgChange: 3600
    }),
    
    getAttendanceRecord: builder.query({
      query: ({ batchId, date }) => `/attendance?batchId=${batchId}&date=${date}`,
      // Keep until manually invalidated
      keepUnusedDataFor: Infinity
    })
  })
})
```

### Query Optimization

```typescript
// BAD: Fetches entire batch with all students and attendance
const batch = await prisma.batch.findUnique({
  where: { id: batchId },
  include: { students: { include: { attendance: true } } }
})

// GOOD: Selective fields based on use case
const batch = await prisma.batch.findUnique({
  where: { id: batchId },
  select: {
    id: true,
    name: true,
    students: {
      select: { id: true, name: true }
    }
  }
})

// GOOD: Paginated attendance for date
const todayAttendance = await prisma.attendance.findMany({
  where: {
    batchId,
    date: today
  },
  select: {
    id: true,
    studentId: true,
    status: true,
    student: { select: { name: true } }
  },
  take: 50,
  orderBy: { student: { name: 'asc' } }
})
```

---

## Conclusion

This technical architecture ensures:
- ✅ **Clear separation of concerns** (repository → service → controller)
- ✅ **Type safety** throughout (TypeScript + Prisma)
- ✅ **Efficient state management** (Redux + RTK Query)
- ✅ **Optimal DB queries** (indexes, selective loading)
- ✅ **Robust error handling** (specific error codes)
- ✅ **Performance** (caching, pagination)
- ✅ **Easy testing** (layered architecture)
