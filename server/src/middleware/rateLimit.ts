import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { env } from '../config/env';

const WINDOW_MS = 15 * 60 * 1000;

export const generalLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: env.RATE_LIMIT_GENERAL,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({ error: 'Too many requests. Please slow down.' });
  },
});

export const chatLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: env.RATE_LIMIT_CHAT,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error:
        'You are sending messages too fast. Please wait a moment before trying again.',
    });
  },
});