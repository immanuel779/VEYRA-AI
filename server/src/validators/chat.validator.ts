import { z } from 'zod';

const MAX_MESSAGES = 40;
const MAX_CONTENT = 8000;

export const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1).max(MAX_CONTENT),
      })
    )
    .min(1)
    .max(MAX_MESSAGES),
});