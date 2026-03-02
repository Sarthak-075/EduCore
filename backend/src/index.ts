import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import dashboardRoutes from './routes/dashboard';
import { batchRoutes } from './modules/batches';
import { attendanceRoutes } from './modules/attendance';
import { authMiddleware } from './middleware/auth';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', authMiddleware, studentRoutes);
app.use('/api/v1/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/v1/batches', batchRoutes);
app.use('/api/v1/attendance', attendanceRoutes);

app.get('/api/v1/ping', (_req, res) => res.send('pong'));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
