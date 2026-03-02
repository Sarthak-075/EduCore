# EduCore V2 - Official Specification
**Aligned with PRD & TRD (March 2, 2026)**

## 1. Problem & Goals

### Problem
- Teachers struggle with manual attendance registers
- Hard to analyze patterns over time  
- Need digital tracking for V2 daily engagement

### Goals
- ✅ Enable batch creation
- ✅ Allow daily attendance marking (present/absent)
- ✅ Show attendance summary per student
- ✅ Increase daily active usage

### Non-Goals
- ❌ Timetable management
- ❌ Parent login
- ❌ Exams module
- ❌ Notifications (V2 scope)

---

## 2. Database Schema

### Current V1 Tables (Unchanged)
```
teachers
├── id (PK)
├── email
├── passwordHash
├── name
└── phone

students
├── id (PK)
├── teacherId (FK) → teachers
├── name
├── parentName
├── parentPhone
├── parentEmail
├── monthlyFee
├── dueDay
└── isActive

payments
├── id (PK)
├── studentId (FK) → students
├── month
├── year
├── amountPaid
└── dateReceived
```

### V2 New Tables

**batches** (NEW)
```
batches
├── id (PK, CUID)
├── teacherId (FK) → teachers
├── name (VARCHAR, NOT NULL)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

Constraints:
  - INDEX(teacherId) for fast teacher queries
```

**attendance** (NEW)
```
attendance
├── id (PK, CUID)
├── studentId (FK) → students
├── date (DATE)
├── status (ENUM: 'present' | 'absent')
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

Constraints:
  - UNIQUE(studentId, date) to prevent duplicates
  - INDEX(studentId, date) for performance
```

### Updated students Table
```
students
├── ... (all existing fields)
├── batchId (FK) → batches [NULLABLE]
└── When student is removed from batch, set to NULL
```

**Why This Design:**
- Simple 1:N relationship (1 batch → N students)
- Direct foreign key on students table
- No junction table complexity
- Fast queries for "all students in batch"

---

## 3. Architecture Update

**No infrastructure change required.** Modular monolith remains.

### Backend Module Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── batches/
│   │   │   ├── controller.ts      # Request handlers
│   │   │   ├── service.ts         # Business logic
│   │   │   ├── repository.ts      # Data access
│   │   │   ├── routes.ts          # Endpoint registration
│   │   │   └── types.ts           # DTOs & data types
│   │   │
│   │   ├── attendance/
│   │   │   ├── controller.ts
│   │   │   ├── service.ts
│   │   │   ├── repository.ts
│   │   │   ├── routes.ts
│   │   │   └── types.ts
│   │   │
│   │   └── index.ts              # Export all modules
│   │
│   ├── middleware/
│   │   └── auth.ts               # JWT validation
│   │
│   ├── types/
│   │   └── index.ts              # Shared types
│   │
│   └── index.ts                  # App entry point
│
├── prisma/
│   └── schema.prisma              # Update with new models
│
└── package.json
```

---

## 4. API Endpoints

### Batch Management

**POST /batches**
```
Create a new batch
Request: { name: string }
Response: { id, teacherId, name, createdAt }
Error: 401 (Unauthorized), 400 (Validation)
```

**GET /batches**
```
List all batches for teacher
Query params: ?page=1&limit=20
Response: { data: Batch[], pagination: {...} }
Error: 401
```

**GET /batches/:batchId**
```
Get batch details with students
Response includes student list in batch
```

**POST /batches/:batchId/students**
```
Assign students to batch
Request: { studentIds: string[] }
Response: { enrolled: number, failed: number }
```

### Attendance Marking

**POST /attendance**
```
Mark attendance for single student
Request: {
  studentId: string,
  date: YYYY-MM-DD,
  status: 'present' | 'absent'
}
Response: { id, studentId, date, status, createdAt }
Error: 409 (Duplicate), 400 (Validation)
```

**GET /attendance**
```
Get attendance records
Query: ?date=YYYY-MM-DD&studentId=s1
Returns: Attendance[] for given day/student
```

**GET /attendance/summary/:studentId**
```
Get attendance summary (monthly)
Query: ?month=3&year=2026
Response: {
  total: number,
  present: number,
  absent: number,
  percentage: number
}
```

---

## 5. Frontend Features

### Screens (Minimal)

1. **BatchesScreen**
   - List batches
   - Create batch button
   - Click batch → manage students

2. **StudentManagementScreen**
   - List all students (checkboxes)
   - Select/deselect for enrollment
   - Enroll button

3. **AttendanceScreen**
   - Date picker (today default)
   - List students in batch
   - Toggle present/absent
   - Submit button

4. **StudentProfileScreen** (Enhance)
   - Add attendance summary card
   - Show monthly percentage

### Components
- BatchCard
- AttendanceToggle (Present/Absent buttons)
- AttendanceSummaryCard
- DatePicker

---

## 6. Security

### Authentication
- JWT token required for all endpoints
- Validate `Authorization: Bearer {token}` header
- Reject if missing or invalid

### Data Validation
```typescript
// POST /attendance
- studentId: must exist in students table
- date: must not be future date
- status: must be 'present' or 'absent'
- Unique check: (studentId, date) must not exist
```

### Authorization
- Teachers can only access their own batches
- SQL: `WHERE teacherId = currentTeacherId`

---

## 7. Scalability Requirements

### Database Performance
- Index on (studentId, date) for queries
- Batch operations: Can handle 100+ students per batch
- Growth: Vertical scaling sufficient for V2

### Backend
- No horizontal scaling needed
- Keep modular for future microservices

### Frontend
- No special optimization needed (current performance fine)

---

## 8. Implementation Timeline

### Phase 0: Database (Day 1)
- [ ] Update Prisma schema
- [ ] Create migration
- [ ] Test schema in Prisma Studio

### Phase 1: Backend (Days 1-2)
- [ ] BatchRepository & BatchService
- [ ] BatchController & routes
- [ ] AttendanceRepository & AttendanceService
- [ ] AttendanceController & routes
- [ ] Test all endpoints

### Phase 2: Frontend State (Day 2)
- [ ] Redux slices (batch, attendance)
- [ ] RTK Query APIs
- [ ] Wiring to store

### Phase 3: UI Components (Day 3)
- [ ] Batch screens
- [ ] Attendance marking
- [ ] Summary cards
- [ ] Integration

### Phase 4: Testing & Polish (Day 4)
- [ ] API integration tests
- [ ] Component tests
- [ ] E2E tests
- [ ] Bug fixes

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Weekly attendance usage | > 50% | Track in analytics |
| Batch creation rate | > 5/week | Dashboard counter |
| Sessions per teacher | > 2x | Session tracking |
| Attendance accuracy | > 95% | Data validation |

---

## 10. Open Questions for Clarification

- [ ] Should batch have optional `schedule` field? (Current spec says name only)
- [ ] Can students be in multiple batches? (Current spec: 1 batchId per student)
- [ ] Should we show attendance trends on dashboard? (Out of scope for V2?)
- [ ] Bulk attendance marking? (Mark entire batch at once?)

---

**Document Version:** 1.0  
**Last Updated:** March 2, 2026  
**Status:** Ready for Implementation
