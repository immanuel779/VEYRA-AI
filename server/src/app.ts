import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import apiRoutes from './routes';

const app = express();

// Trust the first proxy (Vite dev / hosting platforms) so rate-limit keys work
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false, // API only — no HTML served
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', apiRoutes);

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Never leak stack traces to clients
  console.error('[error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;