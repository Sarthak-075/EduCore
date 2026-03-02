import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      teacherId?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'not logged in' });
  }
  try {
    const data: any = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    req.teacherId = data.teacherId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
};

// Alias for new modules
export const authenticate = authMiddleware;
