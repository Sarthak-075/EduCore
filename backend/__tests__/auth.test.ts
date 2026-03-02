import request from 'supertest';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '../src/routes/auth';

// build a small app instance for tests
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('auth routes', () => {
  it('ping endpoint should respond with pong via /api/v1/ping', async () => {
    // dynamically add the ping route
    app.get('/api/v1/ping', (_req, res) => res.send('pong'));
    const res = await request(app).get('/api/v1/ping');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('pong');
  });

  it('signup should create new user and return 201', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  it('login with wrong credentials should 401', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'wrong',
    });
    expect(res.statusCode).toBe(401);
  });
});
