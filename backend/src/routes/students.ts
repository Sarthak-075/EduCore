import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = Router();

function authMiddleware(req: any, res: any, next: any) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'not logged in' });
  try {
    const data: any = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    req.teacherId = data.teacherId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'invalid token' });
  }
}

// Helper to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper to compute payment status for current month
async function computePaymentStatus(studentId: string, monthlyFee: number): Promise<'paid' | 'partial' | 'pending'> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  const payment = await prisma.payment.findFirst({
    where: { studentId, month: currentMonth, year: currentYear }
  });
  
  if (!payment) return 'pending';
  if (payment.amountPaid >= monthlyFee) return 'paid';
  return 'partial';
}

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const teacherId = req.teacherId;
  const students = await prisma.student.findMany({ where: { teacherId } });
  
  // Compute status and add avatar for each student
  const enrichedStudents = await Promise.all(
    students.map(async (s) => ({
      ...s,
      avatar: getInitials(s.name),
      status: await computePaymentStatus(s.id, s.monthlyFee),
    }))
  );
  
  res.json(enrichedStudents);
});

router.post('/', async (req, res) => {
  const teacherId = req.teacherId;
  if (!teacherId) return res.status(401).json({ error: 'not logged in' });
  const { name, parentName, parentPhone, monthlyFee, dueDay } = req.body;
  if (!name || monthlyFee == null || dueDay == null) {
    return res.status(400).json({ error: 'name, monthlyFee, dueDay required' });
  }
  const student = await prisma.student.create({
    data: { teacherId, name, parentName, parentPhone, monthlyFee, dueDay },
  });
  
  res.json({
    ...student,
    avatar: getInitials(student.name),
    status: 'pending' as const,
  });
});

router.put('/:id', async (req, res) => {
  const teacherId = req.teacherId;
  if (!teacherId) return res.status(401).json({ error: 'not logged in' });
  const { id } = req.params;
  const data = req.body;
  try {
    const student = await prisma.student.updateMany({
      where: { id, teacherId },
      data,
    });
    if (student.count === 0) return res.status(404).json({ error: 'not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'internal' });
  }
});

router.delete('/:id', async (req, res) => {
  const teacherId = req.teacherId;
  if (!teacherId) return res.status(401).json({ error: 'not logged in' });
  const { id } = req.params;
  await prisma.student.updateMany({ where: { id, teacherId }, data: { isActive: false } });
  res.json({ success: true });
});

// payments for student
router.post('/:id/payments', async (req, res) => {
  const teacherId = req.teacherId;
  if (!teacherId) return res.status(401).json({ error: 'not logged in' });
  const { id } = req.params;
  const { month, year, amountPaid, dateReceived } = req.body;
  if (month == null || year == null || amountPaid == null) {
    return res.status(400).json({ error: 'month, year, amountPaid required' });
  }
  try {
    // verify student belongs to teacher
    const student = await prisma.student.findFirst({ where: { id, teacherId } });
    if (!student) return res.status(404).json({ error: 'student not found' });
    const payment = await prisma.payment.create({
      data: { studentId: id, month, year, amountPaid, dateReceived: dateReceived || new Date() },
    });
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

export default router;
