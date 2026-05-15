/**
 * backend/config/env.js
 *
 * Loads and validates all required environment variables at startup.
 * The server will throw immediately if any required variable is missing —
 * fail-fast is intentional so misconfigured deployments are caught early.
 *
 * Usage: import env from './config/env.js'
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

/**
 * @typedef {Object} Env
 * @property {string} PORT
 * @property {string} NODE_ENV
 * @property {string} SUPABASE_URL
 * @property {string} SUPABASE_SERVICE_KEY     - Service role key (server-only, never expose to client)
 * @property {string} SUPABASE_ANON_KEY        - Anon key (used to verify user JWTs)
 * @property {string} SQUAD_SECRET_KEY         - Squad API secret key
 * @property {string} SQUAD_BASE_URL           - Squad API base URL (sandbox vs live)
 * @property {string} SIGNING_SECRET           - HMAC-SHA256 signing secret for ledger integrity
 * @property {string} OPENAI_API_KEY           - OpenAI key for AI explanation engine
 * @property {string} AI_SERVICE_URL           - URL of the Python FastAPI anomaly service
 * @property {string} FRONTEND_URL             - Used for CORS whitelist
 */

const REQUIRED = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'SUPABASE_ANON_KEY',
  'SQUAD_SECRET_KEY',
  'SQUAD_BASE_URL',
  'SIGNING_SECRET',
  'OPENAI_API_KEY',
  'AI_SERVICE_URL',
  'FRONTEND_URL',
];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `[TRACE] Missing required environment variables: ${missing.join(', ')}\n` +
    `Copy .env.example to .env and fill in all values.`
  );
}

/** @type {Env} */
const env = {
  PORT:                process.env.PORT || '3001',
  NODE_ENV:            process.env.NODE_ENV || 'development',
  SUPABASE_URL:        process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  SUPABASE_ANON_KEY:   process.env.SUPABASE_ANON_KEY,
  SQUAD_SECRET_KEY:    process.env.SQUAD_SECRET_KEY,
  SQUAD_BASE_URL:      process.env.SQUAD_BASE_URL,
  SIGNING_SECRET:      process.env.SIGNING_SECRET,
  OPENAI_API_KEY:      process.env.OPENAI_API_KEY,
  AI_SERVICE_URL:      process.env.AI_SERVICE_URL,
  FRONTEND_URL:        process.env.FRONTEND_URL,
};

export default env;
