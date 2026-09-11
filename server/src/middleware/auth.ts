import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebase';

export interface AuthedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
  };
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = header.slice(7);

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (err) {
    console.error('[auth] token verification failed:', (err as Error).message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}