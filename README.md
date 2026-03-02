# EduCore - Tuition & Fee Management System

A modern, full-stack application for managing student records, fee tracking, and payment history.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + RTK Query + Tailwind CSS
- **Backend**: Express.js + TypeScript + Prisma + SQLite (dev) / PostgreSQL (prod)
- **Testing**: Jest + React Testing Library (frontend), Jest + Supertest (backend)
- **DevOps**: Docker, GitHub Actions CI/CD

## Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

2. **Setup environment:**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

3. **Database setup:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npm run seed  # Load test data
   cd ..
   ```

4. **Development:**
   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: Backend
   cd backend && npm run dev
   ```

   Frontend: `http://localhost:5173`
   Backend: `http://localhost:4000`

## Scripts

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # ESLint check
npm run typecheck    # TypeScript validation
npm run test:unit    # Run unit tests
```

### Backend
```bash
cd backend
npm run dev          # Start with hot-reload
npm run build        # Build TypeScript
npm run seed         # Seed database
npm run lint         # ESLint check
npm run typecheck    # TypeScript validation
```

## Testing

```bash
# Run all tests
npm run test

# Frontend only
npm run test:unit

# Backend tests (when configured)
cd backend && npm run test
```

Coverage reports are generated in `coverage/` directory.

## CI/CD

GitHub Actions pipeline runs on every push:
- ✅ Lint & type-check
- ✅ Unit & integration tests
- ✅ Build frontend & backend
- ✅ Build Docker image (optional)

## Docker

```bash
# Build image
docker build -t educore-app .

# Run container
docker run -e DATABASE_URL=file:./dev.db -p 4000:4000 educore-app

# With docker-compose
docker-compose up
```

## Project Structure

```
├── src/app/
│   ├── screens/          # Page components
│   ├── components/       # Reusable UI components
│   ├── api/              # RTK Query endpoints
│   ├── constants/        # App constants
│   └── types/            # TypeScript types
├── backend/
│   ├── src/routes/       # API endpoints
│   ├── src/middleware/   # Auth & custom middleware
│   └── prisma/           # DB schema & migrations
└── public/               # Static assets

```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Current user
- `PUT /api/v1/auth/me` - Update profile
- `POST /api/v1/auth/logout` - Logout

### Students
- `GET /api/v1/students` - List all students
- `POST /api/v1/students` - Create student
- `PUT /api/v1/students/:id` - Update student
- `DELETE /api/v1/students/:id` - Soft delete

### Payments
- `POST /api/v1/students/:id/payments` - Record payment
- `GET /api/v1/dashboard` - Dashboard summary

## Security

- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt
- CORS enabled for configured origins
- Input validation on all endpoints
- TypeScript for type safety

## Performance Optimization

- Production build: ~500KB gzip (frontend bundle)
- RTK Query caching & request deduplication
- Optimistic updates for better UX
- Lazy loading components with React.lazy()

## Deployment

### Vercel (Frontend)
```bash
npm install -g vercel
vercel
```

### Render/Heroku (Backend)
```bash
# Set environment variables in platform dashboard
# Push to main branch triggers automatic deployment
```

### Self-hosted
See `Dockerfile` and `docker-compose.yml` for containerized deployment.

## Contributing

1. Create feature branch: `git checkout -b feature/xyz`
2. Run tests: `npm run test`
3. Lint code: `npm run lint`
4. Push and create PR

## License

MIT
