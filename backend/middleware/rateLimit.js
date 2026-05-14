/**
 * backend/middleware/rateLimit.js
 *
 * Two rate limiters:
 *  - globalLimiter   : 100 requests / 15 min per IP — applied to all routes
 *  - paymentLimiter  : 10 requests / 15 min per IP — applied to payment initiation
 *
 * Consumers: server.js (global), transactions route (payment)
 */

import rateLimit from 'express-rate-limit';

/**
 * Global limiter — applied to every route in server.js.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again in 15 minutes.',
  },
});

/**
 * Payment limiter — applied specifically to POST /transactions/initiate.
 * Prevents donation flooding / abuse.
 */
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many payment attempts. Please wait before trying again.',
  },
});

/**
 * Webhook limiter — Squad webhooks come from Squad servers only.
 * High limit since legitimate traffic can be bursty.
 */
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Webhook rate limit exceeded.',
  },
});
