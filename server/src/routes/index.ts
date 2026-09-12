import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';
import { chatStream } from '../controllers/chat.controller';
import { extractFiles } from '../controllers/extract.controller';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import { generalLimiter, chatLimiter } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';
import { chatBodySchema } from '../validators/chat.validator';

const router = Router();

router.use(generalLimiter);

router.get('/health', healthCheck);

router.get('/auth/me', requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: req.user });
});

router.post(
  '/chat',
  requireAuth,
  chatLimiter,
  validateBody(chatBodySchema),
  chatStream
);

router.post('/extract', requireAuth, chatLimiter, extractFiles);

export default router;
