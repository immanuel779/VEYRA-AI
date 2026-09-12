import { z } from 'zod';

const MAX_MESSAGES = 60;
const MAX_CONTENT = 10000;
const MAX_ATTACHMENTS_PER_MESSAGE = 5;

const attachmentSchema = z.object({
  url: z.string().url(),
  type: z.enum(['image', 'file']),
  mime: z.string(),
  name: z.string().max(255),
  size: z.number().optional(),
  publicId: z.string().optional(),
  textContent: z.string().optional(),
});

export const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(MAX_CONTENT),
        attachments: z
          .array(attachmentSchema)
          .max(MAX_ATTACHMENTS_PER_MESSAGE)
          .optional(),
      })
    )
    .min(1)
    .max(MAX_MESSAGES),
  webSearch: z.boolean().optional(),
});
