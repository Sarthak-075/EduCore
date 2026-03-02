# V2 Testing Strategy & Checklist

## Testing Pyramid

```
                    ▲
                   / \
                  /   \
                 /  E2E \      End-to-end
                /       _\     (5%)
               /       / \
              /       /   \
             / Integration  \  Integration
            /       Tests    \ (15%)
           /               _  \
          /               / \   \
         /               /   \   \
        /      Unit      /     \   \
       /      Tests     /       \   \
      /_______________/__________\___\  (80%)
```

---

## Unit Testing

### Frontend Component Tests

**Location:** `src/app/components/__tests__/`

#### 1. Batch Components

**BatchForm.test.tsx**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BatchForm from '../BatchForm'

describe('BatchForm Component', () => {
  it('should render form fields', () => {
    render(<BatchForm onSubmit={jest.fn()} />)
    
    expect(screen.getByLabelText('Batch Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Schedule (Optional)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create batch/i })).toBeInTheDocument()
  })
  
  it('should disable submit button when name is empty', () => {
    render(<BatchForm onSubmit={jest.fn()} />)
    const submitBtn = screen.getByRole('button', { name: /create batch/i })
    
    expect(submitBtn).toBeDisabled()
  })
  
  it('should call onSubmit with form data', async () => {
    const mockSubmit = jest.fn()
    const user = userEvent.setup()
    
    render(<BatchForm onSubmit={mockSubmit} />)
    
    await user.type(screen.getByLabelText('Batch Name'), 'Morning Batch')
    await user.type(screen.getByLabelText('Schedule'), 'Mon, Wed, Fri')
    await user.click(screen.getByRole('button', { name: /create batch/i }))
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Morning Batch',
        schedule: 'Mon, Wed, Fri'
      })
    })
  })
  
  it('should display validation error for duplicate batch name', async () => {
    const mockSubmit = jest.fn().mockRejectedValue({
      code: 'DUPLICATE_BATCH',
      message: 'Batch already exists'
    })
    
    render(<BatchForm onSubmit={mockSubmit} />)
    // ... user interactions
    
    await waitFor(() => {
      expect(screen.getByText(/Batch already exists/i)).toBeInTheDocument()
    })
  })
})
```

**AttendanceMarkSheet.test.tsx**
```typescript
describe('AttendanceMarkSheet Component', () => {
  it('should render all enrolled students', () => {
    const students = [
      { id: 's1', name: 'Arjun' },
      { id: 's2', name: 'Priya' }
    ]
    
    render(<AttendanceMarkSheet batchId="batch1" students={students} />)
    
    expect(screen.getByText('Arjun')).toBeInTheDocument()
    expect(screen.getByText('Priya')).toBeInTheDocument()
  })
  
  it('should toggle attendance status on button click', async () => {
    const user = userEvent.setup()
    const students = [{ id: 's1', name: 'Arjun' }]
    
    render(<AttendanceMarkSheet batchId="batch1" students={students} />)
    
    const presentBtn = screen.getByRole('button', { name: 'Present' })
    await user.click(presentBtn)
    
    expect(presentBtn).toHaveClass('bg-green-500')
  })
  
  it('should validate all records before submission', async () => {
    const user = userEvent.setup()
    render(<AttendanceMarkSheet batchId="batch1" students={mockStudents} />)
    
    // Select only 1 student, leave others unselected
    const presentButtons = screen.getAllByRole('button', { name: 'Present' })
    await user.click(presentButtons[0])
    
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    expect(screen.getByText(/all students must be marked/i)).toBeInTheDocument()
  })
  
  it('should handle bulk marking efficiently', async () => {
    const largeStudentList = Array.from({ length: 100 }, (_, i) => ({
      id: `s${i}`,
      name: `Student ${i}`
    }))
    
    const { container } = render(
      <AttendanceMarkSheet batchId="batch1" students={largeStudentList} />
    )
    
    // Should render with virtualization (not all 100 rows immediately)
    expect(container.querySelectorAll('tr').length).toBeLessThan(30)
  })
})
```

**BatchList.test.tsx**
```typescript
describe('BatchList Component', () => {
  it('should display loading skeleton', () => {
    render(<BatchList isLoading={true} batches={[]} />)
    expect(screen.getByTestId('batch-skeleton')).toBeInTheDocument()
  })
  
  it('should display error state', () => {
    render(<BatchList isLoading={false} batches={[]} error="Failed to load" />)
    expect(screen.getByText(/Failed to load/i)).toBeInTheDocument()
  })
  
  it('should display batch cards', () => {
    const batches = [
      { id: 'b1', name: 'Morning Batch', _count: { students: 25 } }
    ]
    render(<BatchList isLoading={false} batches={batches} />)
    
    expect(screen.getByText('Morning Batch')).toBeInTheDocument()
    expect(screen.getByText(/students: 25/i)).toBeInTheDocument()
  })
  
  it('should support sorting', async () => {
    const user = userEvent.setup()
    render(<BatchList batches={mockBatches} onSort={jest.fn()} />)
    
    await user.click(screen.getByRole('button', { name: /sort by name/i }))
    // Verify sort applied
  })
})
```

#### 2. Attendance Components

**AttendanceList.test.tsx**
```typescript
describe('AttendanceList Component', () => {
  it('should filter by status', async () => {
    const user = userEvent.setup()
    const records = [
      { id: 'a1', studentId: 's1', status: 'present' },
      { id: 'a2', studentId: 's2', status: 'absent' }
    ]
    
    render(<AttendanceList records={records} />)
    
    await user.click(screen.getByRole('button', { name: /absent/i }))
    
    expect(screen.queryByText('Arjun (Present)')).not.toBeInTheDocument()
    expect(screen.getByText('Priya (Absent)')).toBeInTheDocument()
  })
  
  it('should display date in user timezone', () => {
    const record = { date: '2026-03-02T00:00:00Z' }
    render(<AttendanceList records={[record]} />)
    
    // Should convert to local timezone
    const dateText = screen.getByText(/2026-03-02|2026-03-01/) // Depending on timezone
    expect(dateText).toBeInTheDocument()
  })
})
```

### Backend Service Tests

**Location:** `backend/src/__tests__/`

#### 1. Batch Service

**batch.service.test.ts**
```typescript
import { BatchService } from '../services/batch.service'
import { BatchRepository } from '../repositories/batch.repository'

describe('BatchService', () => {
  let service: BatchService
  let mockRepo: jest.Mocked<BatchRepository>
  
  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      find: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any
    
    service = new BatchService(mockRepo)
  })
  
  describe('create', () => {
    it('should create batch with valid data', async () => {
      const dto = { name: 'Morning Batch', schedule: 'Mon, Wed' }
      const expectedBatch = { id: 'b1', ...dto }
      
      mockRepo.create.mockResolvedValue(expectedBatch)
      
      const result = await service.create('teacher1', dto)
      
      expect(result).toEqual(expectedBatch)
      expect(mockRepo.create).toHaveBeenCalledWith({
        ...dto,
        teacherId: 'teacher1'
      })
    })
    
    it('should throw error for empty name', async () => {
      const dto = { name: '', schedule: 'Mon, Wed' }
      
      await expect(service.create('teacher1', dto))
        .rejects.toThrow('Batch name is required')
    })
    
    it('should throw error if batch name already exists', async () => {
      const dto = { name: 'Morning Batch' }
      mockRepo.findMany.mockResolvedValue([{ id: 'b1', name: 'Morning Batch' }])
      
      await expect(service.create('teacher1', dto))
        .rejects.toThrow('Batch already exists')
    })
  })
  
  describe('enrollStudents', () => {
    it('should enroll multiple students', async () => {
      const batchId = 'b1'
      const studentIds = ['s1', 's2', 's3']
      
      mockRepo.enrollStudents.mockResolvedValue(3)
      
      const result = await service.enrollStudents(batchId, studentIds)
      
      expect(result).toEqual(3)
    })
    
    it('should filter out duplicate enrollments', async () => {
      mockRepo.enrollStudents.mockImplementation(async (batchId, studentIds) => {
        // Simulate: s1 already enrolled
        return studentIds.length - 1
      })
      
      const result = await service.enrollStudents('b1', ['s1', 's1', 's2'])
      
      expect(result).toBe(1) // Only s2 enrolled
    })
  })
})
```

#### 2. Attendance Service

**attendance.service.test.ts**
```typescript
import { AttendanceService } from '../services/attendance.service'
import { AttendanceRepository } from '../repositories/attendance.repository'

describe('AttendanceService', () => {
  let service: AttendanceService
  let mockRepo: jest.Mocked<AttendanceRepository>
  
  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      createBulk: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any
    
    service = new AttendanceService(mockRepo)
  })
  
  describe('markAttendance', () => {
    it('should mark single attendance record', async () => {
      const dto = {
        studentId: 's1',
        batchId: 'b1',
        date: new Date('2026-03-02'),
        status: 'present'
      }
      
      mockRepo.create.mockResolvedValue({ id: 'a1', ...dto })
      
      const result = await service.markAttendance(dto)
      
      expect(result.id).toBeDefined()
      expect(result.status).toBe('present')
    })
    
    it('should prevent duplicate entries', async () => {
      const dto = {
        studentId: 's1',
        batchId: 'b1',
        date: new Date('2026-03-02'),
        status: 'present'
      }
      
      mockRepo.findUnique.mockResolvedValue({ id: 'exist' })
      
      await expect(service.markAttendance(dto))
        .rejects.toThrow('DUPLICATE_ATTENDANCE')
    })
    
    it('should prevent future dates', async () => {
      const dto = {
        studentId: 's1',
        batchId: 'b1',
        date: new Date(Date.now() + 86400000), // Tomorrow
        status: 'present'
      }
      
      await expect(service.markAttendance(dto))
        .rejects.toThrow('Cannot mark attendance for future dates')
    })
    
    it('should validate student is enrolled', async () => {
      const dto = {
        studentId: 's1',
        batchId: 'b1',
        date: new Date('2026-03-02'),
        status: 'present'
      }
      
      mockRepo.validateEnrollment.mockResolvedValue(false)
      
      await expect(service.markAttendance(dto))
        .rejects.toThrow('STUDENT_NOT_ENROLLED')
    })
  })
  
  describe('markBulkAttendance', () => {
    it('should mark attendance for multiple students', async () => {
      const dto = {
        batchId: 'b1',
        date: new Date('2026-03-02'),
        records: [
          { studentId: 's1', status: 'present' },
          { studentId: 's2', status: 'absent' }
        ]
      }
      
      mockRepo.createBulk.mockResolvedValue([
        { id: 'a1', ...dto.records[0] },
        { id: 'a2', ...dto.records[1] }
      ])
      
      const result = await service.markBulkAttendance(dto)
      
      expect(result.created).toBe(2)
      expect(result.failed).toBe(0)
    })
    
    it('should handle partial failures', async () => {
      const dto = {
        batchId: 'b1',
        date: new Date('2026-03-02'),
        records: [
          { studentId: 's1', status: 'present' },
          { studentId: 's2', status: 'present' } // Duplicate
        ]
      }
      
      mockRepo.findUnique.mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'exist' })
      
      const result = await service.markBulkAttendance(dto)
      
      expect(result.created).toBe(1)
      expect(result.failed).toBe(1)
      expect(result.failed_records).toHaveLength(1)
      expect(result.failed_records[0].reason).toBe('DUPLICATE_ENTRY')
    })
    
    it('should use transaction for atomic operation', async () => {
      const transactSpy = jest.spyOn(mockRepo, 'createBulk')
      
      await service.markBulkAttendance({
        batchId: 'b1',
        date: new Date('2026-03-02'),
        records: [
          { studentId: 's1', status: 'present' },
          { studentId: 's2', status: 'absent' }
        ]
      })
      
      expect(transactSpy).toHaveBeenCalled()
      // Verify transaction was used
    })
  })
})
```

### Repository Tests

**batch.repository.test.ts**
```typescript
describe('BatchRepository', () => {
  let repo: BatchRepository
  let prisma: PrismaClient
  
  beforeAll(async () => {
    prisma = new PrismaClient()
    repo = new BatchRepository(prisma)
  })
  
  afterEach(async () => {
    await prisma.batch.deleteMany({})
  })
  
  afterAll(async () => {
    await prisma.$disconnect()
  })
  
  it('should create batch', async () => {
    const batch = await repo.create({
      teacherId: 'teacher1',
      name: 'Morning Batch'
    })
    
    expect(batch.id).toBeDefined()
    expect(batch.name).toBe('Morning Batch')
  })
  
  it('should find batch by id', async () => {
    const created = await repo.create({
      teacherId: 'teacher1',
      name: 'Morning Batch'
    })
    
    const found = await repo.find(created.id)
    
    expect(found?.id).toBe(created.id)
  })
  
  it('should find batches with student count', async () => {
    // Test N+1 prevention
    const batches = await repo.findMany('teacher1', {
      include: { _count: { select: { students: true } } }
    })
    
    expect(batches).toBeDefined()
  })
})
```

---

## Integration Testing

**Location:** `backend/src/__tests__/integration/`

### API Route Integration Tests

**batch.integration.test.ts**
```typescript
import request from 'supertest'
import app from '../../../app'
import { prismaMock } from '../mocks/prisma'

describe('Batch API Integration', () => {
  const token = 'valid-jwt-token'
  const teacherId = 'teacher1'
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  describe('POST /api/v1/batches', () => {
    it('should create batch successfully', async () => {
      prismaMock.batch.create.mockResolvedValue({
        id: 'b1',
        teacherId,
        name: 'Morning Batch',
        schedule: 'Mon, Wed, Fri',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      const response = await request(app)
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Morning Batch',
          schedule: 'Mon, Wed, Fri'
        })
        .expect(201)
      
      expect(response.body).toHaveProperty('id')
      expect(response.body.name).toBe('Morning Batch')
    })
    
    it('should return 401 without token', async () => {
      await request(app)
        .post('/api/v1/batches')
        .send({ name: 'Morning Batch' })
        .expect(401)
    })
    
    it('should return 400 with validation error', async () => {
      const response = await request(app)
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400)
      
      expect(response.body).toHaveProperty('code', 'VALIDATION_ERROR')
    })
  })
  
  describe('GET /api/v1/batches', () => {
    it('should list batches with pagination', async () => {
      prismaMock.batch.findMany.mockResolvedValue([
        {
          id: 'b1',
          name: 'Morning Batch',
          teacherId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
      
      prismaMock.batch.count.mockResolvedValue(1)
      
      const response = await request(app)
        .get('/api/v1/batches?page=1&limit=20')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      
      expect(response.body.data).toHaveLength(1)
      expect(response.body.pagination.total).toBe(1)
    })
  })
  
  describe('POST /api/v1/batches/:batchId/students', () => {
    it('should enroll students', async () => {
      const response = await request(app)
        .post('/api/v1/batches/b1/students')
        .set('Authorization', `Bearer ${token}`)
        .send({ studentIds: ['s1', 's2'] })
        .expect(200)
      
      expect(response.body.enrolled).toBe(2)
    })
  })
})
```

**attendance.integration.test.ts**
```typescript
describe('Attendance API Integration', () => {
  const token = 'valid-jwt-token'
  
  describe('POST /api/v1/attendance/bulk', () => {
    it('should mark attendance for batch', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          batchId: 'b1',
          date: '2026-03-02',
          records: [
            { studentId: 's1', status: 'present', remarks: '' },
            { studentId: 's2', status: 'absent', remarks: 'Sick' }
          ]
        })
        .expect(201)
      
      expect(response.body.created).toBe(2)
      expect(response.body.records).toHaveLength(2)
    })
    
    it('should handle duplicate detection', async () => {
      // First call succeeds
      await request(app)
        .post('/api/v1/attendance/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          batchId: 'b1',
          date: '2026-03-02',
          records: [{ studentId: 's1', status: 'present' }]
        })
        .expect(201)
      
      // Second call for same date should fail
      const response = await request(app)
        .post('/api/v1/attendance/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          batchId: 'b1',
          date: '2026-03-02',
          records: [{ studentId: 's1', status: 'absent' }]
        })
        .expect(400)
      
      expect(response.body.failed_records[0].reason).toBe('DUPLICATE_ENTRY')
    })
    
    it('should handle large bulk operations', async () => {
      const largeRecords = Array.from({ length: 100 }, (_, i) => ({
        studentId: `s${i}`,
        status: 'present'
      }))
      
      const startTime = Date.now()
      
      await request(app)
        .post('/api/v1/attendance/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          batchId: 'b1',
          date: '2026-03-02',
          records: largeRecords
        })
        .expect(201)
      
      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(5000) // Should complete in < 5 seconds
    })
  })
  
  describe('GET /api/v1/attendance/report/:batchId', () => {
    it('should generate attendance report', async () => {
      const response = await request(app)
        .get('/api/v1/attendance/report/b1?month=3&year=2026')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
      
      expect(response.body).toHaveProperty('batchId')
      expect(response.body).toHaveProperty('month', 3)
      expect(response.body).toHaveProperty('students')
      expect(response.body.students[0]).toHaveProperty('percentage')
    })
  })
})
```

---

## E2E Testing

**Location:** `e2e/`

### User Journey Tests

**batch-creation.e2e.test.ts** (using Playwright)
```typescript
import { test, expect } from '@playwright/test'

test.describe('Batch Creation Journey', () => {
  test('user should create batch and enroll students', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:3000')
    await page.fill('[name="email"]', 'teacher@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard')
    
    // 2. Navigate to batches
    await page.click('a:has-text("Batches")')
    await page.waitForURL('**/batches')
    
    // 3. Click create batch button
    await page.click('button:has-text("Create Batch")')
    
    // 4. Fill form
    await page.fill('[name="name"]', 'Morning Class 10')
    await page.fill('[name="schedule"]', 'Mon, Wed, Fri - 7 AM')
    await page.click('button:has-text("Create")')
    
    // 5. Verify batch created
    await expect(page.locator('text=Morning Class 10')).toBeVisible()
    
    // 6. Enroll students
    await page.click('button:has-text("Manage Students")')
    await page.click('[data-testid="student-s1"]')
    await page.click('[data-testid="student-s2"]')
    await page.click('button:has-text("Enroll Selected")')
    
    // 7. Verify enrollment
    await expect(page.locator('text=2 students enrolled')).toBeVisible()
  })
})
```

**attendance-marking.e2e.test.ts**
```typescript
test.describe('Attendance Marking Journey', () => {
  test('user should mark attendance for batch', async ({ page }) => {
    // Login and navigate to batch
    await page.goto('http://localhost:3000/batches/b1/attendance')
    
    // 1. Select date
    await page.click('[data-testid="date-picker"]')
    await page.click('button:has-text("2")')
    
    // 2. Mark attendance
    const students = await page.locator('[data-testid="student-row"]').count()
    
    for (let i = 0; i < students; i++) {
      await page.click(
        `[data-testid="student-${i}"] button:has-text("Present")`
      )
    }
    
    // 3. Submit
    await page.click('button:has-text("Mark Attendance")')
    
    // 4. Verify success
    await expect(page.locator('text=Attendance marked successfully')).toBeVisible()
    
    // 5. Generate report
    await page.click('a:has-text("View Report")')
    await expect(page.locator('text=Attendance Report')).toBeVisible()
  })
})
```

---

## Performance Testing

**Location:** `performance/`

### Load Testing

```bash
# Using Apache JMeter or k6

# Example k6 script
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 50,
  duration: '5m'
}

export default function () {
  // Simulate 50 concurrent users marking attendance
  const response = http.post('http://localhost:3001/api/v1/attendance/bulk', {
    batchId: 'b1',
    date: new Date().toISOString().split('T')[0],
    records: Array.from({ length: 50 }, (_, i) => ({
      studentId: `s${i}`,
      status: 'present'
    }))
  })
  
  check(response, {
    'status is 201': (r) => r.status === 201,
    'response time < 2 seconds': (r) => r.timings.duration < 2000
  })
  
  sleep(1)
}
```

---

## Test Execution Plan

### Pre-Commit (Local)
```bash
npm run test:unit          # Unit tests only (~30s)
npm run typecheck          # TypeScript check (~10s)
npm run lint               # ESLint check (~15s)
```

### Pre-Push (CI)
```bash
npm run test               # All tests with coverage
npm run test:integration  # Integration tests
npm run build             # Production build
```

### Pre-Release (Staging)
```bash
npm run test:e2e          # E2E tests against staging
npm run test:performance  # Load testing
npm run test:security     # OWASP checks
```

---

## Coverage Goals

| Category | Goal | Current |
|----------|------|---------|
| Statements | 80% | - |
| Branches | 75% | - |
| Functions | 80% | - |
| Lines | 80% | - |

---

## Test Data Seeding

**Location:** `backend/prisma/seed.ts`

```typescript
async function main() {
  // Create test teacher
  const teacher = await prisma.teacher.upsert({
    where: { email: 'teacher@test.com' },
    update: {},
    create: {
      email: 'teacher@test.com',
      name: 'Test Teacher',
      phone: '9999999999'
    }
  })
  
  // Create batches
  const batch = await prisma.batch.create({
    data: {
      teacherId: teacher.id,
      name: 'Test Batch',
      students: {
        connect: [
          { id: 's1' },
          { id: 's2' },
          { id: 's3' }
        ]
      }
    }
  })
  
  console.log('Seed data created')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Run seeding:**
```bash
npx prisma db seed
```

---

## Continuous Testing

### GitHub Actions CI

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run coverage
      
      - uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage-final.json
```

---

## Debugging Tests

```bash
# Run single test
npm run test -- BatchForm.test.tsx

# Debug mode
node --inspect-brk node_modules/.bin/jest

# Watch mode
npm run test:watch

# Generate report
npm run test:coverage -- --html
```

---

## Checklist Before Release

- [ ] All unit tests passing (100%)
- [ ] All integration tests passing
- [ ] E2E tests passing on staging
- [ ] Code coverage > 80%
- [ ] No TypeScript errors
- [ ] All ESLint rules passing
- [ ] Performance tests < 2s response time
- [ ] Load tests at 50 concurrent users
- [ ] Database migrations tested
- [ ] Documentation updated

---

**Last Updated:** 2026-03-02
**Test Framework Version:** Jest 29.x, Playwright 1.x
