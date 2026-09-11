import type { Request, Response } from 'express';
import { adminDb } from '../config/firebase';

export async function healthCheck(_req: Request, res: Response) {
  let db: 'ok' | 'error' = 'error';
  try {
    await adminDb.collection('conversations').limit(1).get();
    db = 'ok';
  } catch (err) {
    console.error('[health] firestore check failed:', err);
    db = 'error';
  }

  res.json({
    status: 'ok',
    service: 'veyra-api',
    db,
    timestamp: new Date().toISOString(),
  });
}