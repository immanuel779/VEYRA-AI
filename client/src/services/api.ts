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
  onDelta: (delta: string) => void;
}

export async function streamChat({
  messages,
  token,
  signal,
  onDelta,
}: StreamChatOptions): Promise<void> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
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

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) onDelta(chunk);
  }

  const tail = decoder.decode();
  if (tail) onDelta(tail);
}
