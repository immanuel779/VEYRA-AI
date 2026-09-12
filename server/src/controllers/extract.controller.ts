import type { Response } from 'express';
import { extractMany } from '../services/extractor.service';
import type { AuthedRequest } from '../middleware/auth';

interface ExtractBody {
  attachments?: Array<{ url: string; mime: string; name: string }>;
}

export async function extractFiles(req: AuthedRequest, res: Response) {
  const { attachments } = req.body as ExtractBody;

  if (!Array.isArray(attachments) || attachments.length === 0) {
    return res.json({ results: [] });
  }

  const limited = attachments.slice(0, 5);
  const results = await extractMany(
    limited.map((a) => ({
      url: a.url,
      mime: a.mime || 'application/octet-stream',
      name: a.name || 'file',
    }))
  );

  res.json({ results });
}
