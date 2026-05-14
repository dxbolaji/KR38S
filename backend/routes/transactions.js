/**
 * backend/routes/transactions.js
 *
 * Transaction endpoints.
 *
 * Protected:
 *   POST /transactions/initiate          — start a Squad payment session
 *   POST /transactions/payout            — initiate payout to beneficiary
 *   POST /transactions/payout/requery    — re-query a pending payout (post-424)
 *
 * Public:
 *   GET  /transactions/verify/:ref       — verify a transaction by Squad ref
 *
 * Consumers: server.js
 */

import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { paymentLimiter } from '../middleware/rateLimit.js';
import { asyncWrap, createError } from '../middleware/errorHandler.js';
import {
  initiateDonation,
  confirmTransaction,
  initiatePayout,
  recheckPayout,
} from '../services/transactionService.js';

const router = Router();

// ─── POST /transactions/initiate ──────────────────────────────────────────────
// Starts a Squad hosted checkout session.
// Returns checkoutUrl — frontend redirects donor to this URL.

router.post(
  '/initiate',
  paymentLimiter,   // strict rate limit on payment initiation
  optionalAuth,     // donor may or may not be logged in
  asyncWrap(async (req, res) => {
    const { campaignId, amountNgn, email, donorName } = req.body;

    if (!campaignId || !amountNgn || !email) {
      throw createError('campaignId, amountNgn, and email are required', 400);
    }

    if (typeof amountNgn !== 'number' || amountNgn < 1) {
      throw createError('amountNgn must be a positive number (minimum ₦1)', 400);
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createError('Invalid email address', 400);
    }

    const result = await initiateDonation({
      campaignId,
      amountNgn,
      email,
      donorName: donorName || '',
      donorId: req.user?.id || null,
    });

    res.status(201).json({ success: true, data: result });
  })
);

// ─── GET /transactions/verify/:ref ───────────────────────────────────────────
// Verifies a transaction when the donor returns from Squad checkout.
// Also called as a fallback if webhook delivery fails.

router.get(
  '/verify/:ref',
  asyncWrap(async (req, res) => {
    const { ref } = req.params;

    if (!ref) throw createError('Transaction reference is required', 400);

    const result = await confirmTransaction(ref);
    res.json({ success: true, data: result });
  })
);

// ─── POST /transactions/payout ────────────────────────────────────────────────
// Initiates a payout from Squad wallet to the campaign's beneficiary.
// Only the campaign owner can call this.

router.post(
  '/payout',
  requireAuth,
  asyncWrap(async (req, res) => {
    const { campaignId, amountNgn, narration } = req.body;

    if (!campaignId || !amountNgn) {
      throw createError('campaignId and amountNgn are required', 400);
    }

    if (typeof amountNgn !== 'number' || amountNgn < 1) {
      throw createError('amountNgn must be a positive number', 400);
    }

    const ledgerEntry = await initiatePayout({
      campaignId,
      requesterId: req.user.id,
      amountNgn,
      narration: narration || '',
    });

    res.json({ success: true, data: ledgerEntry });
  })
);

// ─── POST /transactions/payout/requery ───────────────────────────────────────
// Re-queries a payout that returned 424 from Squad.
// MUST be called instead of retrying — never retry a 424.

router.post(
  '/payout/requery',
  requireAuth,
  asyncWrap(async (req, res) => {
    const { squadRef } = req.body;

    if (!squadRef) throw createError('squadRef is required', 400);

    const result = await recheckPayout(squadRef);
    res.json({ success: true, data: result });
  })
);

export default router;
