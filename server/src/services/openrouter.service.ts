import OpenAI from 'openai';
import { env } from '../config/env';

const openrouter = env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://veyra-ai-pi.vercel.app',
        'X-Title': 'VEYRA AI',
      },
    })
  : null;

// Confirmed-working free coding model on OpenRouter.
// Browse alternatives: https://openrouter.ai/models?max_price=0
const CODING_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
  onStatus?: (status: string) => void;
}

/**
 * Returns true on success, false if OpenRouter failed and the caller
 * should fall back to another provider.
 */
export async function streamCodingResponse(
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  callbacks: StreamCallbacks
): Promise<boolean> {
  if (!openrouter) {
    console.warn('[openrouter] not configured — skipping');
    return false;
  }

  try {
    callbacks.onStatus?.('Engaging expert coding mode…');

    const stream = await openrouter.chat.completions.create({
      model: CODING_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
      ],
      temperature: 0.3,
      max_tokens: 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) callbacks.onChunk(delta);
    }

    callbacks.onDone();
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'OpenRouter request failed';
    console.error('[openrouter] failed:', msg);
    return false;
  }
}

export function isOpenRouterConfigured(): boolean {
  return openrouter !== null;
}
