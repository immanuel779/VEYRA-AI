import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.error || err?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export interface StreamChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Array<{
    url: string;
    type: 'image' | 'file';
    mime: string;
    name: string;
    size?: number;
    publicId?: string;
    textContent?: string;
  }>;
}

export interface StreamChatOptions {
  messages: StreamChatMessage[];
  token: string;
  signal?: AbortSignal;
  webSearch?: boolean;
  onDelta: (delta: string) => void;
  onStatus?: (status: string) => void;
}

export async function streamChat({
  messages,
  token,
  signal,
  webSearch,
  onDelta,
  onStatus,
}: StreamChatOptions): Promise<void> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, webSearch }),
    signal,
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  if (!res.body) throw new Error('Streaming not supported in this browser');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let processed = '';
    while (true) {
      const start = buffer.indexOf('[[STATUS:');
      if (start === -1) {
        processed += buffer;
        buffer = '';
        break;
      }
      processed += buffer.slice(0, start);
      const end = buffer.indexOf(']]', start);
      if (end === -1) break;
      const status = buffer.slice(start + 9, end);
      onStatus?.(status);
      buffer = buffer.slice(end + 2);
    }

    if (processed) onDelta(processed);
  }

  if (buffer) onDelta(buffer);
}

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

export async function extractFiles(
  attachments: ExtractInput[],
  token: string
): Promise<ExtractResult[]> {
  if (attachments.length === 0) return [];

  const res = await fetch(`${API_BASE}/api/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ attachments }),
  });

  if (!res.ok) {
    console.error('[extract] failed:', res.status);
    return attachments.map((a) => ({ url: a.url, textContent: null }));
  }

  const data = await res.json();
  return data.results || [];
}
