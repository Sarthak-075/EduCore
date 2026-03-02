import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// signup
router.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'name, email, password required' });
  }
  try {
    const existing = await prisma.teacher.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'email already in use' });
    const hash = await bcrypt.hash(password, 10);
    const teacher = await prisma.teacher.create({
      data: { name, email, phone, passwordHash: hash },
    });
    // create token
    const token = jwt.sign({ teacherId: teacher.id }, process.env.JWT_SECRET || 'dev', {
      expiresIn: '7d',
    });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ id: teacher.id, name: teacher.name, email: teacher.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }
  try {
    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) return res.status(401).json({ error: 'invalid credentials' });
    const valid = await bcrypt.compare(password, teacher.passwordHash);
    if (!valid) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ teacherId: teacher.id }, process.env.JWT_SECRET || 'dev', {
      expiresIn: '7d',
    });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ id: teacher.id, name: teacher.name, email: teacher.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// me
router.get('/me', async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'not logged in' });
  try {
    const data: any = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    const teacher = await prisma.teacher.findUnique({ where: { id: data.teacherId } });
    if (!teacher) return res.status(401).json({ error: 'invalid token' });
    res.json({ id: teacher.id, name: teacher.name, email: teacher.email, phone: teacher.phone });
  } catch (err) {
    res.status(401).json({ error: 'invalid token' });
  }
});

// update profile
router.put('/me', async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'not logged in' });
  try {
    const data: any = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    const { name, phone } = req.body;
    const teacher = await prisma.teacher.update({
      where: { id: data.teacherId },
      data: { name, phone },
    });
    res.json({ id: teacher.id, name: teacher.name, email: teacher.email, phone: teacher.phone });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'invalid token' });
  }
});

// logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

export default router;
