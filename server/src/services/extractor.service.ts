import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

const MAX_TEXT_CHARS = 200_000; // ~50k tokens

export interface ExtractInput {
  url: string;
  mime: string;
  name: string;
}

export interface ExtractResult {
  url: string;
  textContent: string | null;
  error?: string;
}

export async function extractTextFromFile(
  input: ExtractInput
): Promise<ExtractResult> {
  const { url, mime, name } = input;

  try {
    // Images skip text extraction — Stage 3 handles them via Gemini
    if (mime.startsWith('image/')) {
      return { url, textContent: null };
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch file (${res.status})`);

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = '';

    const lowerName = name.toLowerCase();
    const lowerMime = mime.toLowerCase();

    if (lowerMime === 'application/pdf' || lowerName.endsWith('.pdf')) {
      const parsed = await pdfParse(buffer);
      text = parsed.text || '';
    } else if (
      lowerMime ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      lowerMime === 'application/msword' ||
      lowerName.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || '';
    } else if (
      lowerMime === 'text/plain' ||
      lowerMime === 'text/csv' ||
      lowerMime === 'text/markdown' ||
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.csv') ||
      lowerName.endsWith('.md')
    ) {
      text = buffer.toString('utf-8');
    } else {
      return { url, textContent: null, error: 'Unsupported file type' };
    }

    const trimmed = text.trim().slice(0, MAX_TEXT_CHARS);
    return { url, textContent: trimmed || null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Extraction failed';
    console.error('[extract] failed for', name, '-', msg);
    return { url, textContent: null, error: msg };
  }
}

export async function extractMany(
  inputs: ExtractInput[]
): Promise<ExtractResult[]> {
  return Promise.all(inputs.map(extractTextFromFile));
}
