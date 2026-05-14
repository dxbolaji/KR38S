/**
 * backend/server.js
 *
 * TRACE Express application entry point.
 *
 * Route map:
 *   /health              — health check (no auth)
 *   /api/campaigns       — campaign CRUD
 *   /api/transactions    — payment initiation, payout, verify
 *   /api/verify          — public ledger verification
 *   /api/webhooks        — Squad webhook receiver (raw body)
 *
 * CRITICAL: The /api/webhooks route MUST use express.raw() to preserve
 * the raw body for HMAC signature validation. It is registered BEFORE
 * the global express.json() middleware to avoid body parsing conflicts.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import env from './config/env.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';

import campaignRoutes     from './routes/campaigns.js';
import transactionRoutes  from './routes/transactions.js';
import webhookRoutes      from './routes/webhooks.js';
import verifyRoutes       from './routes/verify.js';
import { startWeb3Watcher } from './services/web3Service.js';

const app = express();

// ─── Security middleware ──────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(globalLimiter);

// ─── Logging ──────────────────────────────────────────────────────────────────

app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── WEBHOOK ROUTE — raw body MUST be registered before express.json() ───────

app.use(
  '/api/webhooks',
  express.raw({ type: 'application/json' }),
  webhookRoutes
);

// ─── JSON body parser (all other routes) ─────────────────────────────────────

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TRACE API',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/campaigns',    campaignRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/verify',       verifyRoutes);

// ─── Web3 watcher — polls TRON blockchain for crypto payments ────────────────

startWeb3Watcher();

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.path} not found` });
});

// ─── Central error handler (must be last) ────────────────────────────────────

app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`[TRACE] Server running on port ${env.PORT} (${env.NODE_ENV})`);
  console.log(`[TRACE] Squad base URL: ${env.SQUAD_BASE_URL}`);
});

export default app;