import type { Response } from 'express';
import { streamChat } from '../services/ai.service';
import type { AuthedRequest } from '../middleware/auth';

interface IncomingMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chatStream(req: AuthedRequest, res: Response) {
  const body = req.body as { messages?: IncomingMessage[] };
  const messages = body.messages || [];

  const trimmed = messages.slice(-20).map((m) => ({
    role: m.role === 'system' ? 'user' : (m.role as 'user' | 'assistant'),
    content: m.content,
  }));

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  let clientClosed = false;
  req.on('close', () => {
    clientClosed = true;
  });

  await streamChat(trimmed, {
    onChunk: (text) => {
      if (clientClosed) return;
      res.write(text);
    },
    onDone: () => {
      if (clientClosed) return;
      res.end();
    },
    onStatus: (status) => {
      if (clientClosed) return;
      res.write(`\n[[STATUS:${status}]]\n`);
    },
    onError: (err) => {
      console.error('[chat] stream error:', err.message);
      if (clientClosed) return;
      res.write('\n\n_⚠️ VEYRA hit an error generating this response._');
      res.end();
    },
  });
}
