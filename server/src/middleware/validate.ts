import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues || [];
      const first = issues[0];
      return res.status(400).json({
        error: first
          ? `${first.path.join('.')}: ${first.message}`
          : 'Invalid request body',
      });
    }
    req.body = result.data;
    next();
  };
}