/**
 * backend/middleware/auth.js
 *
 * Validates the Supabase JWT passed in the Authorization header.
 * On success, attaches req.user = { id, email, ...claims } for downstream use.
 * On failure, returns 401 immediately.
 *
 * Usage:
 *   import { requireAuth } from './middleware/auth.js';
 *   router.post('/campaigns', requireAuth, createCampaign);
 *
 * Consumers: campaigns route, transactions route, verify route
 */

import { anonClient } from '../config/supabase.js';

/**
 * Extracts Bearer token from Authorization header.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
const extractToken = (req) => {
  const header = req.headers['authorization'] || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
};

/**
 * Express middleware that enforces authentication.
 * Attaches req.user on success.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const requireAuth = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Missing Authorization header. Expected: Bearer <token>',
    });
  }

  const { data, error } = await anonClient.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token.',
    });
  }

  // Attach user to request for downstream route handlers
  req.user = data.user;
  next();
};

/**
 * Optional auth — attaches req.user if token is present and valid,
 * but does NOT block the request if missing.
 * Use for: public routes where knowing the user is a bonus (e.g. ledger view).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  const { data } = await anonClient.auth.getUser(token);
  if (data?.user) req.user = data.user;
  next();
};
