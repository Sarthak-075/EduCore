# EduCore V2: Attendance Module - Implementation Roadmap

## Executive Summary
Transitioning from V1 (student/fee management) to V2 (attendance tracking). This is a **horizontal feature expansion** requiring new data models, API endpoints, state management, and UI components while maintaining V1 functionality.

---

## Phase 0: Preparation (Day 1)

### Database Schema Extension
```sql
-- New Tables
CREATE TABLE batches (
  id VARCHAR PRIMARY KEY,
  teacherId VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  schedule VARCHAR,
  createdAt TIMESTAMP,
  FOREIGN KEY (teacherId) REFERENCES teachers(id)
);

CREATE TABLE attendance (
  id VARCHAR PRIMARY KEY,
  studentId VARCHAR NOT NULL,
  batchId VARCHAR NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'leave') NOT NULL,
  remarks VARCHAR,
  createdAt TIMESTAMP,
  UNIQUE(studentId, batchId, date),
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (batchId) REFERENCES batches(id)
);

CREATE TABLE batch_students (
  batchId VARCHAR NOT NULL,
  studentId VARCHAR NOT NULL,
  enrolledDate TIMESTAMP,
  PRIMARY KEY (batchId, studentId),
  FOREIGN KEY (batchId) REFERENCES batches(id),
  FOREIGN KEY (studentId) REFERENCES students(id)
);
```

### Prisma Schema Updates
```prisma
model Batch {
  id           String       @id @default(cuid())
  teacherId    String
  teacher      Teacher      @relation(fields: [teacherId], references: [id])
  name         String
  schedule     String?
  students     Student[]    @relation("BatchStudents")
  attendance   Attendance[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}

model Attendance {
  id        String   @id @default(cuid())
  studentId String
  student   Student  @relation(fields: [studentId], references: [id])
  batchId   String
  batch     Batch    @relation(fields: [batchId], references: [id])
  date      DateTime
  status    String   // 'present' | 'absent' | 'leave'
  remarks   String?
  createdAt DateTime @default(now())
  
  @@unique([studentId, batchId, date])
}

// Update Student model
model Student {
  // ... existing fields ...
  batches      Batch[]       @relation("BatchStudents")
  attendance   Attendance[]
}

// Update Teacher model
model Teacher {
  // ... existing fields ...
  batches      Batch[]
}
```

---

## Phase 1: Backend Wiring (Days 2-3)

### Step 1.1: Repository Layer
**Files to create:**
- `backend/src/modules/batches/batch.repository.ts`
- `backend/src/modules/attendance/attendance.repository.ts`

**Batch Repository:**
```typescript
class BatchRepository {
  // CRUD operations
  create(data: CreateBatchDTO): Promise<Batch>
  findByTeacher(teacherId: string): Promise<Batch[]>
  findById(id: string): Promise<Batch>
  update(id: string, data: UpdateBatchDTO): Promise<Batch>
  delete(id: string): Promise<void>
  
  // Batch-Student relations
  addStudent(batchId: string, studentId: string): Promise<void>
  removeStudent(batchId: string, studentId: string): Promise<void>
  getStudents(batchId: string): Promise<Student[]>
}
```

**Attendance Repository:**
```typescript
class AttendanceRepository {
  // CRUD
  create(data: CreateAttendanceDTO): Promise<Attendance>
  findByDate(batchId: string, date: Date): Promise<Attendance[]>
  findStudentHistory(studentId: string, batchId: string): Promise<Attendance[]>
  update(id: string, data: UpdateAttendanceDTO): Promise<Attendance>
  
  // Bulk operations
  recordBulk(records: AttendanceRecord[]): Promise<Attendance[]>
  getAttendanceStats(studentId: string, batchId: string): Promise<AttendanceStats>
}
```

**Dependencies:** Prisma client ✓ (already available)

---

### Step 1.2: Service Layer
**Files to create:**
- `backend/src/modules/batches/batch.service.ts`
- `backend/src/modules/attendance/attendance.service.ts`

**Batch Service:**
```typescript
class BatchService {
  // Business logic
  createBatch(teacherId: string, data: CreateBatchDTO): Promise<Batch>
  getBatches(teacherId: string): Promise<Batch[]>
  enrollStudent(batchId: string, studentId: string): Promise<void>
  getStudentsForBatch(batchId: string): Promise<StudentWithAttendance[]>
  
  // Validation
  validateBatchOwnership(batchId: string, teacherId: string): Promise<boolean>
  validateStudentEnrollment(studentId: string, batchId: string): Promise<boolean>
}
```

**Attendance Service:**
```typescript
class AttendanceService {
  // Core operations
  markAttendance(studentId: string, batchId: string, date: Date, status: string): Promise<Attendance>
  markBulkAttendance(batchId: string, date: Date, records: AttendanceRecord[]): Promise<Attendance[]>
  updateAttendance(id: string, status: string, remarks?: string): Promise<Attendance>
  
  // Analytics
  getStudentAttendancePercentage(studentId: string, batchId: string): Promise<number>
  getBatchAttendanceReport(batchId: string, month: number, year: number): Promise<AttendanceReport>
  getAbsenteeList(batchId: string, date: Date): Promise<Student[]>
  
  // Validation
  validateAttendanceDate(date: Date): boolean
  checkDuplicateEntry(studentId: string, batchId: string, date: Date): Promise<boolean>
}
```

**Dependencies:** BatchRepository ✓, AttendanceRepository ✓

---

### Step 1.3: Controller Layer
**Files to create:**
- `backend/src/modules/batches/batch.controller.ts`
- `backend/src/modules/attendance/attendance.controller.ts`

**Batch Controller:**
```typescript
class BatchController {
  // Handler methods
  createBatch(req: Request, res: Response): Promise<void>
  getBatches(req: Request, res: Response): Promise<void>
  enrollStudent(req: Request, res: Response): Promise<void>
  removeStudent(req: Request, res: Response): Promise<void>
  getBatchStudents(req: Request, res: Response): Promise<void>
}
```

**Attendance Controller:**
```typescript
class AttendanceController {
  // Handler methods
  markAttendance(req: Request, res: Response): Promise<void>
  markBulkAttendance(req: Request, res: Response): Promise<void>
  updateAttendance(req: Request, res: Response): Promise<void>
  getAttendanceRecord(req: Request, res: Response): Promise<void>
  getAttendanceReport(req: Request, res: Response): Promise<void>
  getStudentStats(req: Request, res: Response): Promise<void>
  
  // Validations
  validateRequest(req: Request, fieldRules: Record): boolean
}
```

**Dependencies:** BatchService ✓, AttendanceService ✓, authMiddleware ✓

---

### Step 1.4: Routes
**Files to create:**
- `backend/src/modules/batches/batch.routes.ts`
- `backend/src/modules/attendance/attendance.routes.ts`

**Batch Routes:**
```typescript
router.post('/', authMiddleware, batchController.createBatch)
router.get('/', authMiddleware, batchController.getBatches)
router.post('/:id/students', authMiddleware, batchController.enrollStudent)
router.delete('/:id/students/:studentId', authMiddleware, batchController.removeStudent)
router.get('/:id/students', authMiddleware, batchController.getBatchStudents)
```

**Attendance Routes:**
```typescript
router.post('/mark', authMiddleware, attendanceController.markAttendance)
router.post('/bulk', authMiddleware, attendanceController.markBulkAttendance)
router.put('/:id', authMiddleware, attendanceController.updateAttendance)
router.get('/batch/:batchId/date/:date', authMiddleware, attendanceController.getAttendanceRecord)
router.get('/report/:batchId', authMiddleware, attendanceController.getAttendanceReport)
router.get('/student/:studentId/stats', authMiddleware, attendanceController.getStudentStats)
```

**Dependencies:** All controllers ✓, authMiddleware ✓

---

### Step 1.5: Index Integration
**File:** `backend/src/index.ts`

```typescript
// Add to imports
import batchRoutes from './modules/batches/batch.routes'
import attendanceRoutes from './modules/attendance/attendance.routes'

// Add to middleware stack (after auth)
app.use('/api/v1/batches', batchRoutes)
app.use('/api/v1/attendance', attendanceRoutes)
```

**Dependencies:** Both route files ✓

---

## Phase 2: State Management (Days 3-4)

### Redux Store Structure

**Files to create:**
- `src/app/store/slices/batchSlice.ts`
- `src/app/store/slices/attendanceSlice.ts`

**Batch Slice:**
```typescript
interface BatchState {
  batches: Batch[]
  currentBatch: Batch | null
  loading: boolean
  error: string | null
  filters: { searchTerm: string }
}

const batchSlice = createSlice({
  name: 'batches',
  initialState,
  reducers: {
    setBatches, setCurrentBatch, addBatch, updateBatch, removeBatch, setLoading, setError
  }
})
```

**Attendance Slice:**
```typescript
interface AttendanceState {
  records: Attendance[]
  selectedDate: Date
  currentBatchId: string | null
  report: AttendanceReport | null
  bulkMode: boolean
  loading: boolean
  error: string | null
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setRecords, setSelectedDate, setBatchId, setReport, setBulkMode, setLoading, setError
  }
})
```

---

### API Integration (RTK Query)

**Files to create:**
- `src/app/api/batches.ts`
- `src/app/api/attendance.ts`

**Batch API:**
```typescript
export const batchApi = createApi({
  // Queries
  useGetBatchesQuery()
  useGetBatchStudentsQuery(batchId)
  
  // Mutations
  useCreateBatchMutation()
  useUpdateBatchMutation()
  useDeleteBatchMutation()
  useEnrollStudentMutation()
  useRemoveStudentMutation()
})
```

**Attendance API:**
```typescript
export const attendanceApi = createApi({
  // Queries
  useGetAttendanceRecordQuery(batchId, date)
  useGetAttendanceReportQuery(batchId, month, year)
  useGetStudentStatsQuery(studentId)
  
  // Mutations
  useMarkAttendanceMutation()
  useMarkBulkAttendanceMutation()
  useUpdateAttendanceMutation()
})
```

**Dependencies:** RTK Query ✓ (already configured), backend API ✓

---

## Phase 3: Frontend Components (Days 4-5)

### Directory Structure
```
src/app/components/
├── attendance/
│   ├── AttendanceMarkSheet.tsx
│   ├── AttendanceReport.tsx
│   ├── StudentAttendanceCard.tsx
│   └── BulkMarkAttendance.tsx
└── batches/
    ├── BatchList.tsx
    ├── BatchForm.tsx
    ├── BatchStudents.tsx
    └── EnrollStudentModal.tsx

src/app/screens/
├── BatchesScreen.tsx
├── AttendanceScreen.tsx
└── AttendanceReportScreen.tsx
```

### Dependency Chain
1. **Atomic Components** (reusable)
   - `AttendanceStatusBadge.tsx`
   - `DatePicker.tsx` (already exists)
   - `BulkActionButton.tsx`

2. **Feature Components** (use atoms)
   - `AttendanceMarkSheet.tsx`
   - `BatchList.tsx`
   - `StudentAttendanceCard.tsx`

3. **Screen Components** (use features)
   - `AttendanceScreen.tsx`
   - `BatchesScreen.tsx`

4. **Routing** (integrate screens)
   - Update `routes.tsx`

---

## Phase 4: Data Flow Architecture

### Create Student → Add to Batch → Mark Attendance Flow

```
┌─────────────────────────────────────────────────────────────┐
│ ENTRY POINT: Batches Screen                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │ Create Batch         │
         │ (BatchForm.tsx)      │
         └───────────┬──────────┘
                     │ POST /api/v1/batches
                     ▼
         ┌─────────────────────────────────────┐
         │ Backend: BatchService.create()      │
         │ - Save to DB                        │
         │ - Return Batch object               │
         └────────────┬────────────────────────┘
                      │ Response: { id, name, ... }
                      ▼
         ┌──────────────────────────────────────┐
         │ Frontend: RTK Query responds         │
         │ - Store in Redux batchSlice         │
         │ - Update UI                         │
         └────────────┬─────────────────────────┘
                      │
         ┌────────────▼──────────────────────┐
         │ Enroll Students to Batch          │
         │ (BatchStudents.tsx)               │
         └────────────┬──────────────────────┘
                      │
    ┌─────────────────┴──────────────────┐
    │ For each student:                  │
    │ POST /api/v1/batches/:id/students  │
    │                                    │
    └─────────────────┬──────────────────┘
                      │
         ┌────────────▼────────────────────────┐
         │ Backend: BatchService.enrollStudent │
         │ - Link Student ↔ Batch             │
         │ - Return success                   │
         └────────────┬─────────────────────────┘
                      │ Response: { success: true }
                      ▼
         ┌──────────────────────────────────┐
         │ Mark Attendance                  │
         │ (AttendanceMarkSheet.tsx)        │
         └────────────┬─────────────────────┘
                      │
    ┌─────────────────┴────────────────────┐
    │ Bulk operation:                      │
    │ POST /api/v1/attendance/bulk         │
    │ Payload: [                           │
    │   { studentId, status, date, ... }   │
    │ ]                                    │
    │                                      │
    └────────────────┬─────────────────────┘
                     │
        ┌────────────▼──────────────────────────┐
        │ Backend: AttendanceService.markBulk() │
        │ - Validate all records                │
        │ - Check for duplicates                │
        │ - Save to DB (transaction)            │
        │ - Return saved records                │
        └────────────┬───────────────────────────┘
                     │ Response: [{ id, status, ... }]
                     ▼
        ┌──────────────────────────────────────┐
        │ Frontend: Update state                │
        │ - Store attendance records            │
        │ - Refresh UI with marks              │
        │ - Toast notification: "Success"      │
        └──────────────────────────────────────┘
```

### State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    REDUX STORE                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌───────────────────────┐  ┌──────────────────────────┐   │
│ │  batchSlice           │  │  attendanceSlice         │   │
│ ├───────────────────────┤  ├──────────────────────────┤   │
│ │ - batches[]           │  │ - records[]              │   │
│ │ - currentBatch        │  │ - selectedDate           │   │
│ │ - filters             │  │ - currentBatchId         │   │
│ │ - loading             │  │ - report                 │   │
│ │ - error               │  │ - bulkMode               │   │
│ └───────────────────────┘  │ - loading                │   │
│                            │ - error                  │   │
│                            └──────────────────────────┘   │
│                                                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
      ┌────────────┴─────────────┐
      │                          │
   ┌──▼──────────────┐    ┌──────▼──────────────┐
   │  COMPONENTS     │    │  RTK QUERY CACHE    │
   ├─────────────────┤    ├─────────────────────┤
   │ BatchList      │    │ batchApi            │
   │ AttendanceUI   │    │ attendanceApi       │
   │ ReportCards    │    │ studentApi (V1)     │
   └────────┬────────┘    └──────┬──────────────┘
            │                    │
            └────────┬───────────┘
                     │
            ┌────────▼──────────┐
            │  BACKEND API      │
            │  /api/v1/*        │
            └───────────────────┘
```

---

## Phase 5: Risk Assessment & Mitigation

### Critical Risk Areas

| Risk | Impact | Mitigation | Priority |
|------|--------|-----------|----------|
| **Duplicate attendance entries** | Data integrity | Unique constraint on (studentId, batchId, date); frontend validation | CRITICAL |
| **Student-Batch relationship loss** | Orphaned records | Foreign key constraints; cascade delete policy review | CRITICAL |
| **Bulk operation performance** | UI freeze on large batches | Batch API with pagination; async processing for 100+ records | HIGH |
| **Date-based queries slow** | Report generation lag | Index on attendance.date; DB query optimization | HIGH |
| **Concurrent attendance marking** | Race conditions | Pessimistic locking; transaction isolation | HIGH |
| **State sync mismatch** | UI shows stale data | Immediate refetch after mutations; cache invalidation | MEDIUM |
| **Large report generation** | Memory issues | Pagination; streaming CSV export | MEDIUM |

### Mitigation Strategies

**1. Data Validation (Backend-First)**
```typescript
// In AttendanceService
async markAttendance(...) {
  // Check 1: Student exists
  await validateStudent(studentId)
  
  // Check 2: Batch exists and student enrolled
  await validateBatchEnrollment(studentId, batchId)
  
  // Check 3: Date is valid
  validateAttendanceDate(date)
  
  // Check 4: No duplicate
  const existing = await findDuplicate(studentId, batchId, date)
  if (existing) throw new Error('Already marked')
  
  // Check 5: Use transaction
  return await db.$transaction(async (tx) => {
    return tx.attendance.create(data)
  })
}
```

**2. Optimization (Queries & Indexing)**
```prisma
// In schema.prisma
model Attendance {
  @@index([batchId, date])
  @@index([studentId, batchId])
  @@unique([studentId, batchId, date])
}
```

**3. Error Handling (Granular)**
```typescript
// Custom error types
class DuplicateAttendanceError extends Error {}
class StudentNotEnrolledError extends Error {}
class InvalidDateError extends Error {}

// In controller
try {
  await service.markAttendance(...)
} catch (e) {
  if (e instanceof DuplicateAttendanceError) {
    return res.status(409).json({ error: 'Already marked' })
  }
  if (e instanceof StudentNotEnrolledError) {
    return res.status(400).json({ error: 'Not enrolled in batch' })
  }
  // ...
}
```

---

## Phase 6: Dependency Order (Critical Path)

### Execution Sequence

```
Day 1: Database Preparation
├── Create Prisma schema (batches, attendance, batch_students)
├── Run prisma migrate
├── Seed sample data
└── ✓ GATE: Schema validated in DB

Day 2-3: Backend API (Sequential)
├── Step 1: Create BatchRepository
│   └── ✓ Can query batches
├── Step 2: Create AttendanceRepository
│   └── ✓ Can CRUD attendance
├── Step 3: Create BatchService
│   └── Depends on: BatchRepository ✓
├── Step 4: Create AttendanceService
│   └── Depends on: AttendanceRepository ✓, BatchService ✓
├── Step 5: Create BatchController
│   └── Depends on: BatchService ✓
├── Step 6: Create AttendanceController
│   └── Depends on: AttendanceService ✓
├── Step 7: Create batch.routes
│   └── Depends on: BatchController ✓
├── Step 8: Create attendance.routes
│   └── Depends on: AttendanceController ✓
├── Step 9: Register routes in index.ts
│   └── Depends on: Both route files ✓
└── ✓ GATE: Postman test all endpoints

Day 4: State & API Integration
├── Create Redux slices (batchSlice, attendanceSlice)
├── Create RTK Query (batchApi, attendanceApi)
├── Integrate with existing store
└── ✓ GATE: Redux DevTools shows correct state

Day 5: Frontend Components
├── Create atomic components
├── Create feature components
├── Create screen components
├── Update routes.tsx
└── ✓ GATE: All screens render without errors

Day 6: Integration & Testing
├── E2E testing (create batch → add student → mark attendance)
├── Error scenario testing
├── Performance testing (bulk operations)
└── ✓ GATE: All flows working end-to-end
```

---

## Phase 7: Implementation Checklist

### Backend Wiring
- [ ] Prisma schema updated and migrated
- [ ] BatchRepository implemented (CRUD + relations)
- [ ] AttendanceRepository implemented (CRUD + bulk)
- [ ] BatchService implemented (business logic)
- [ ] AttendanceService implemented (analytics)
- [ ] BatchController implemented (handlers)
- [ ] AttendanceController implemented (handlers)
- [ ] batch.routes configured
- [ ] attendance.routes configured
- [ ] Routes registered in index.ts
- [ ] API tested in Postman

### Frontend State
- [ ] batchSlice created
- [ ] attendanceSlice created
- [ ] batchApi RTK Query created
- [ ] attendanceApi RTK Query created
- [ ] Store integration verified

### Frontend UI
- [ ] BatchList component
- [ ] BatchForm modal
- [ ] BatchStudents enrollment UI
- [ ] AttendanceMarkSheet (table view)
- [ ] BulkMarkAttendance (form)
- [ ] AttendanceReport
- [ ] StudentAttendanceCard
- [ ] Screens: BatchesScreen, AttendanceScreen
- [ ] Routes updated

### Quality Gates
- [ ] All TypeScript errors resolved
- [ ] Lint passing
- [ ] Error handling for all risk scenarios
- [ ] Database constraints in place
- [ ] Transaction safety verified

---

## Phase 8: Deployment Checklist

```bash
# Backend
npm run lint         # ✓ Pass
npm run typecheck    # ✓ Pass
npm run test         # ✓ Coverage > 80%
npm run build        # ✓ No errors

# Database
npm run seed         # ✓ Test data loaded
npx prisma migrate deploy  # ✓ Production ready

# Frontend
npm run lint         # ✓ Pass
npm run typecheck    # ✓ Pass
npm run test         # ✓ New tests passing
npm run build        # ✓ No errors

# Git
git add .
git commit -m "feat: Add attendance tracking module (V2)"
git push origin main
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time | < 200ms | Postman test 100 records |
| Bulk Mark (100 students) | < 2s | Load test |
| Type Safety | 100% | Zero TS errors |
| Test Coverage | > 80% | Coverage report |
| Lint Score | Clean | ESLint output |
| Database Queries | Indexed | EXPLAIN PLAN analysis |

---

## Rollback Plan

If issues arise at any gate:

1. **Schema issues**: `git reset HEAD~1 && npx prisma migrate resolve --rolled-back <migration-name>`
2. **Backend API issues**: Simple revert; no data model change → fast rollback
3. **Frontend state issues**: Revert Redux slices; RTK Query resets automatically
4. **Integration issues**: Disable new routes in index.ts; serve V1 only

---

**Status: Ready for Implementation**

This roadmap ensures:
✅ **Sequential dependencies** - no blocked tasks
✅ **Data integrity** - database constraints + service validation
✅ **Quality gates** - verify at each phase
✅ **Risk mitigation** - identified and addressed
✅ **Performance** - indexing and optimization planned
✅ **Testability** - clear integration points
✅ **Rollback safety** - quick revert options

**Estimated Timeline: 6 days of development**
