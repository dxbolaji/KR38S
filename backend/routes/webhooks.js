/**
 * backend/routes/webhooks.js
 *
 * Squad webhook receiver.
 *
 * CRITICAL: This route uses express.raw() middleware (set in server.js)
 * to capture the raw body BEFORE any JSON parsing.
 * The raw body is required for HMAC-SHA512 signature validation.
 *
 * DO NOT add express.json() to this route — it will break signature validation.
 *
 * Flow:
 *   1. Receive POST from Squad
 *   2. Validate x-squad-encrypted-body signature (HMAC-SHA512)
 *   3. Parse body
 *   4. Check for duplicate transaction_ref (idempotency)
 *   5. Call confirmTransaction (verifies with Squad, writes ledger)
 *   6. Always respond 200 — Squad retries on non-200
 *
 * Consumers: server.js
 */

import { Router } from 'express';
import { validateWebhookSignature } from '../services/squadService.js';
import { confirmTransaction } from '../services/transactionService.js';
import { webhookLimiter } from '../middleware/rateLimit.js';

const router = Router();

// ─── POST /webhooks/squad ─────────────────────────────────────────────────────

router.post(
  '/squad',
  webhookLimiter,
  async (req, res) => {
    // Always respond 200 first-thing after validation.
    // Squad retries if it doesn't get 200 quickly.
    // All processing happens asynchronously after response.

    const squadHeader = req.headers['x-squad-encrypted-body'];
    const rawBody = req.body; // Buffer (because express.raw() is used)

    // ── Step 1: Validate signature ──────────────────────────────────────────
    const rawBodyString = rawBody?.toString('utf-8') || '';
    const isValid = validateWebhookSignature(rawBodyString, squadHeader);

    if (!isValid) {
      console.warn('[TRACE Webhook] Invalid signature — rejected');
      // Still return 200 to prevent Squad from logging delivery failures
      // but do NOT process the payload
      return res.status(200).json({ received: true, processed: false });
    }

    // ── Step 2: Parse body ──────────────────────────────────────────────────
    let payload;
    try {
      payload = JSON.parse(rawBodyString);
    } catch {
      console.error('[TRACE Webhook] Failed to parse body');
      return res.status(200).json({ received: true, processed: false });
    }

    const { transaction_ref, Event: eventType } = payload;

    // ── Step 3: Only process charge_successful events ───────────────────────
    if (eventType !== 'charge_successful' && payload.status !== 'Success') {
      // Not a successful charge — acknowledge and ignore
      return res.status(200).json({ received: true, processed: false });
    }

    if (!transaction_ref) {
      console.error('[TRACE Webhook] Missing transaction_ref in payload');
      return res.status(200).json({ received: true, processed: false });
    }

    // Respond immediately — process async to avoid Squad timeout
    res.status(200).json({ received: true, processed: true });

    // ── Step 4: Confirm and write to ledger (async) ─────────────────────────
    try {
      const result = await confirmTransaction(transaction_ref);

      if (result?.alreadyConfirmed) {
        console.log(`[TRACE Webhook] Duplicate ignored: ${transaction_ref}`);
      } else {
        console.log(`[TRACE Webhook] Ledger entry written: ${transaction_ref}`);
      }
    } catch (err) {
      // Log but don't crash — response already sent
      console.error(
        `[TRACE Webhook] Failed to process ${transaction_ref}:`,
        err.message
      );
    }
  }
);

export default router;
