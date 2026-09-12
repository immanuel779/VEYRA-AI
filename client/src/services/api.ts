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

export interface StreamChatOptions {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
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

    // Extract [[STATUS:...]] markers from the stream
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
