# V2 Development Quick Reference

## Project Setup

### Prerequisites
```bash
Node.js v18+
npm v9+
PostgreSQL (production) or SQLite (dev)
```

### Initial Setup
```bash
# Copy environment
cp .env.example .env

# Install dependencies
npm install

# Frontend only
npm install --save-dev @types/react @types/react-dom

# Backend Prisma setup
npx prisma init
npx prisma migrate dev --name initial

# Run dev server
npm run dev
```

---

## Code Generation Shortcuts

### Create a New Batch Endpoint (Backend)

**1. Add to Prisma Schema** (`backend/prisma/schema.prisma`)
```prisma
model YourModel {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

**2. Generate Prisma Types**
```bash
npx prisma generate
```

**3. Create Repository** (`backend/src/repositories/your.repository.ts`)
```typescript
export class YourRepository {
  async create(data: CreateYourDTO) {
    return prisma.your.create({ data })
  }
  
  async find(id: string) {
    return prisma.your.findUnique({ where: { id } })
  }
  
  async findMany(filter: FilterYourDTO) {
    return prisma.your.findMany({ where: filter })
  }
}
```

**4. Create Service** (`backend/src/services/your.service.ts`)
```typescript
export class YourService {
  constructor(private repo: YourRepository) {}
  
  async create(dto: CreateYourDTO) {
    // Validation
    if (!dto.name) throw new Error('Name required')
    
    // Business logic
    return this.repo.create(dto)
  }
}
```

**5. Create Controller** (`backend/src/controllers/your.controller.ts`)
```typescript
export class YourController {
  constructor(private service: YourService) {}
  
  @Post()
  async create(req: Request, res: Response) {
    try {
      const result = await this.service.create(req.body)
      res.status(201).json(result)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }
}
```

**6. Add Routes** (`backend/src/routes/your.routes.ts`)
```typescript
router.post('/your', authenticate, yourController.create.bind(yourController))
```

---

## Frontend Component Template

### Create Attendee List Component

**Path:** `src/app/components/attendance/AttendanceList.tsx`

```typescript
import { useMemo } from 'react'
import { useGetAttendanceRecordQuery } from '@/services/attendanceApi'
import { useAppDispatch, useAppSelector } from '@/store'

export function AttendanceList({ batchId, date }: Props) {
  const dispatch = useAppDispatch()
  
  // Get from RTK Query
  const { data: records, isLoading, error } = useGetAttendanceRecordQuery({
    batchId,
    date
  })
  
  // Get from Redux
  const { statusFilter } = useAppSelector(state => state.attendance.filters)
  
  // Compute filtered list
  const filtered = useMemo(() => {
    if (!records) return []
    if (statusFilter === 'all') return records
    return records.filter(r => r.status === statusFilter)
  }, [records, statusFilter])
  
  if (isLoading) return <Skeleton count={5} />
  if (error) return <ErrorAlert error={error} />
  
  return (
    <div className="space-y-2">
      {filtered.map(record => (
        <AttendanceListItem key={record.id} record={record} />
      ))}
    </div>
  )
}

interface Props {
  batchId: string
  date: Date
}
```

---

## Redux Setup Checklist

### Create New Slice

**Step 1:** Create slice file (`src/store/slices/your.slice.ts`)
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState: YourState = {
  data: [],
  loading: false,
  error: null
}

const yourSlice = createSlice({
  name: 'your',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<YourData[]>) => {
      state.data = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    }
  }
})

export const { setData, setLoading } = yourSlice.actions
export default yourSlice.reducer
```

**Step 2:** Register in store (`src/store/index.ts`)
```typescript
import yourReducer from './slices/your.slice'

export const store = configureStore({
  reducer: {
    your: yourReducer,
    // ... other slices
  }
})
```

**Step 3:** Use in component
```typescript
import { useAppDispatch, useAppSelector } from '@/store'
import { setData } from '@/store/slices/your.slice'

function YourComponent() {
  const dispatch = useAppDispatch()
  const { data } = useAppSelector(state => state.your)
  
  useEffect(() => {
    dispatch(setData(newData))
  }, [])
}
```

---

## RTK Query Setup

### Create API Slice

**Path:** `src/services/yourApi.ts`

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const yourApi = createApi({
  reducerPath: 'yourApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL
  }),
  tagTypes: ['Your'],
  endpoints: (builder) => ({
    /// QUERIES
    getYour: builder.query<Your[], void>({
      query: () => '/your',
      providesTags: ['Your']
    }),
    
    getYourDetail: builder.query<Your, string>({
      query: (id) => `/your/${id}`,
      providesTags: (result, error, id) => [{ type: 'Your', id }]
    }),
    
    /// MUTATIONS
    createYour: builder.mutation<Your, CreateYourDTO>({
      query: (data) => ({
        url: '/your',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Your']
    }),
    
    updateYour: builder.mutation<Your, UpdateYourDTO>({
      query: ({ id, ...data }) => ({
        url: `/your/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Your', id }]
    }),
    
    deleteYour: builder.mutation<void, string>({
      query: (id) => ({
        url: `/your/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Your']
    })
  })
})

export const {
  useGetYourQuery,
  useGetYourDetailQuery,
  useCreateYourMutation,
  useUpdateYourMutation,
  useDeleteYourMutation
} = yourApi
```

---

## Database Migrations

### Create Migration

```bash
# After updating schema.prisma
npx prisma migrate dev --name descriptive_name

# Examples:
npx prisma migrate dev --name add_attendance_fields
npx prisma migrate dev --name add_batch_unique_constraint
```

### Common Migrations

**Add New Table**
```prisma
model NewTable {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
}
```

**Add Field to Existing Table**
```prisma
model Batch {
  // ... existing fields
  description String? // Add as optional first, then make required
}
```

**Create Index**
```prisma
model Attendance {
  // ... fields
  
  @@index([batchId, date])
  @@unique([studentId, batchId, date])
}
```

---

## Testing Patterns

### Component Test Template

```typescript
// src/app/components/__tests__/AttendanceList.test.tsx

import { render, screen } from '@testing-library/react'
import { AttendanceList } from '../AttendanceList'

describe('AttendanceList', () => {
  it('should render attendance records', () => {
    render(<AttendanceList batchId="1" date={new Date()} />)
    
    // Assertions
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})
```

### API Test Template

```typescript
// backend/src/__tests__/attendance.test.ts

describe('POST /api/v1/attendance/bulk', () => {
  it('should mark attendance for multiple students', async () => {
    const response = await request(app)
      .post('/api/v1/attendance/bulk')
      .send({
        batchId: 'batch1',
        date: '2026-03-02',
        records: [
          { studentId: 's1', status: 'present' }
        ]
      })
    
    expect(response.status).toBe(201)
    expect(response.body.created).toBe(1)
  })
})
```

---

## Git Workflow

### Branch Naming
```
feature/attendance-list          # New feature
fix/duplicate-attendance-bug     # Bug fix
refactor/attendance-service      # Refactoring
docs/attendance-api              # Documentation
```

### Commit Pattern
```bash
# Feature
git commit -m "feat(attendance): add bulk marking endpoint"

# Fix
git commit -m "fix(attendance): handle duplicate entries"

# Update docs
git commit -m "docs(attendance): add API reference"
```

### Push & PR
```bash
git push origin feature/your-feature
# Then create PR on GitHub with description:
# - What: Describe the change
# - Why: Explain motivation
# - Testing: How was it tested
# - Checklist: [ ] TypeScript [ ] Tests [ ] Docs
```

---

## Debugging Checklist

### Frontend Issue
- [ ] Check Redux DevTools for state shape
- [ ] Inspect network tab for API responses
- [ ] Verify RTK Query cache invalidation
- [ ] Check console for TypeScript warnings

### Backend Issue
- [ ] Check `/api/v1/health` endpoint
- [ ] Verify database connection in `.env`
- [ ] Look at server logs: `npm run dev`
- [ ] Test endpoint in Postman

### Database Issue
- [ ] Check schema: `npx prisma studio`
- [ ] Verify migrations applied: `npx prisma migrate status`
- [ ] Reset if needed: `npx prisma migrate reset`

---

## Performance Checklist

- [ ] API queries are paginated (take/skip 50 records)
- [ ] Database has indexes on frequently queried fields
- [ ] Redux state is normalized (not nested deeply)
- [ ] RTK Query cache tags are specific (not overly broad)
- [ ] Components use `useMemo` for expensive computations
- [ ] Images are lazy-loaded
- [ ] Bundle size is monitored (target <200KB gzip)

---

## Useful Commands

```bash
# Development
npm run dev              # Start frontend + backend
npm run frontend        # Frontend only
npm run backend         # Backend only

# Testing
npm run test            # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report

# Quality
npm run lint            # ESLint check
npm run format          # Prettier format
npm run typecheck       # TypeScript check

# Database
npx prisma studio      # Visual DB browser
npx prisma migrate dev # Create migration
npx prisma generate    # Generate types

# Build
npm run build           # Production build
npm run preview         # Preview build

# Docker
docker-compose up       # Start all services
docker-compose logs     # View logs
```

---

## Environment Variables

**Frontend** (`.env`)
```
VITE_API_URL=http://localhost:3001/api
VITE_AUTH_TOKEN_KEY=token
```

**Backend** (`.env`)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key
```

---

## Architecture Reference

```
┌─────────────────────────────────────────────────────┐
│                User Interface Layer                 │
│  React Components + Redux State + RTK Query Cache  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼ HTTP / REST
┌─────────────────────────────────────────────────────┐
│               API Server (Express)                  │
│  Controllers → Services → Repositories → Prisma    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼ ORM Queries
┌─────────────────────────────────────────────────────┐
│            Database (PostgreSQL/SQLite)             │
│  Users ← Teachers ← Batches ← Attendance ← Reports │
└─────────────────────────────────────────────────────┘
```

---

## Support & Documentation

- **API Docs:** See `V2_TECHNICAL_ARCHITECTURE.md`
- **Implementation Guide:** See `V2_IMPLEMENTATION_ROADMAP.md`
- **Troubleshooting:** Check GitHub issues
- **Slack Channel:** #educore-v2-dev (if applicable)

Good luck! 🚀
