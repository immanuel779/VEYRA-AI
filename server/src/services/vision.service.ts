import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

const ai = env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
  : null;

const VISION_MODEL = 'gemini-3.6-flash';
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

export interface VisionImage {
  url: string;
  mime: string;
  name?: string;
}

export interface VisionCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
  onStatus?: (status: string) => void;
}

const SYSTEM_INSTRUCTION = `You are VEYRA AI, created by Oluwadamilare Opeyemi Emmanuel (CEO of CodeCraft Technologies, founder of CodeCraft Academy).

You are analyzing images the user has sent. Describe what you actually see. Answer questions about the image accurately. Be specific — mention text, colors, layout, objects, expressions, and context where relevant.

If the user asks something the image doesn't reveal, say so honestly. Never invent details.

Do NOT mention that you are Gemini, Google, or any specific AI model. You are VEYRA AI.`;

async function fetchImageAsBase64(url: string): Promise<{ data: string; mime: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`);
  const arrayBuffer = await res.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error('Image too large (max 8 MB per image).');
  }
  return {
    data: Buffer.from(arrayBuffer).toString('base64'),
    mime: res.headers.get('content-type') || 'image/jpeg',
  };
}

export async function analyzeImages(
  prompt: string,
  images: VisionImage[],
  callbacks: VisionCallbacks
): Promise<void> {
  if (!ai) {
    callbacks.onError(new Error('Image understanding is not configured.'));
    return;
  }

  try {
    const limited = images.slice(0, MAX_IMAGES);

    callbacks.onStatus?.(
      `Looking at ${limited.length} image${limited.length > 1 ? 's' : ''}…`
    );

    const imageParts = await Promise.all(
      limited.map(async (img) => {
        const { data, mime } = await fetchImageAsBase64(img.url);
        return {
          inlineData: {
            mimeType: img.mime || mime,
            data,
          },
        };
      })
    );

    const contents = [
      {
        role: 'user',
        parts: [
          ...imageParts,
          { text: prompt || 'Describe this image in detail.' },
        ],
      },
    ];

    const stream = await ai.models.generateContentStream({
      model: VISION_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text || '';
      if (text) callbacks.onChunk(text);
    }

    callbacks.onDone();
  } catch (err) {
    callbacks.onError(err as Error);
  }
}

export function isVisionConfigured(): boolean {
  return ai !== null;
}
