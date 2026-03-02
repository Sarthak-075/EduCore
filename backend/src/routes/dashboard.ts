import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.use(authMiddleware);

// Get dashboard summary for current month (or specified month/year)
router.get('/', async (req, res) => {
  const teacherId = req.teacherId;
  if (!teacherId) return res.status(401).json({ error: 'not logged in' });
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();

  try {
    // Get all active students for this teacher
    const students = await prisma.student.findMany({
      where: { teacherId, isActive: true },
      include: { payments: { where: { month, year } } },
    });

    // Compute statuses and aggregate
    let totalExpected = 0;
    let totalCollected = 0;
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;

    students.forEach((student) => {
      totalExpected += student.monthlyFee;
      const paid = student.payments.reduce((sum, p) => sum + p.amountPaid, 0);
      totalCollected += paid;

      if (paid >= student.monthlyFee) {
        paidCount++;
      } else if (paid > 0) {
        partialCount++;
      } else {
        pendingCount++;
      }
    });

    const totalPending = totalExpected - totalCollected;

    res.json({
      month,
      year,
      totalExpected,
      totalCollected,
      totalPending,
      countByStatus: { paid: paidCount, partial: partialCount, pending: pendingCount },
      percentage: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

export default router;
