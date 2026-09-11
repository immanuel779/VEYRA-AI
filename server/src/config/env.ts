import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  RATE_LIMIT_GENERAL: Number(process.env.RATE_LIMIT_GENERAL) || 120,
  RATE_LIMIT_CHAT: Number(process.env.RATE_LIMIT_CHAT) || 20,
} as const;

if (!env.GROQ_API_KEY) {
  console.warn('[env] Missing GROQ_API_KEY. Chat will fail.');
}