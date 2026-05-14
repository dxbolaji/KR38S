/**
 * backend/middleware/errorHandler.js
 *
 * Central Express error handler. Must be registered LAST in server.js
 * (after all routes) via app.use(errorHandler).
 *
 * All route handlers should call next(err) to reach this handler.
 * Unhandled promise rejections in async routes are caught by asyncWrap.
 *
 * Consumers: server.js
 */

import env from '../config/env.js';

/**
 * Wraps an async route handler so thrown errors are forwarded to next().
 * Use this on every async route to avoid unhandled promise rejections.
 *
 * @param {Function} fn - async (req, res, next) => {}
 * @returns {Function}
 *
 * @example
 * router.post('/', asyncWrap(async (req, res) => {
 *   const data = await someService();
 *   res.json({ success: true, data });
 * }));
 */
export const asyncWrap = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Central error handler.
 * Returns a consistent JSON error shape across all routes.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export const errorHandler = (err, req, res, _next) => {
  // Log full error in development; minimal in production
  if (env.NODE_ENV === 'development') {
    console.error(`[TRACE ERROR] ${req.method} ${req.path}`, err);
  } else {
    console.error(`[TRACE ERROR] ${req.method} ${req.path} — ${err.message}`);
  }

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 && env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Creates a typed application error with an HTTP status code.
 *
 * @param {string} message
 * @param {number} statusCode
 * @returns {Error}
 *
 * @example
 * throw createError('Campaign not found', 404);
 */
export const createError = (message, statusCode = 500) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};
