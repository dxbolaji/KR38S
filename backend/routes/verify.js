/**
 * backend/routes/verify.js
 *
 * Public transparency verification endpoint.
 * Anyone — donor, journalist, regulator — can verify a TRACE ledger entry.
 *
 * GET /verify/:transactionId  — verify a ledger entry by its UUID
 * GET /verify/ref/:squadRef   — verify by Squad transaction reference
 *
 * Returns the ledger entry + whether its HMAC signature is valid.
 * A valid signature proves the entry has not been tampered with.
 *
 * Consumers: server.js, frontend verify.tsx
 */

import { Router } from 'express';
import { adminClient } from '../config/supabase.js';
import { verifyLedgerSignature } from '../services/signingService.js';
import { asyncWrap, createError } from '../middleware/errorHandler.js';

const router = Router();

// ─── Shared verification logic ────────────────────────────────────────────────

/**
 * Fetches a ledger entry and verifies its HMAC signature.
 * @param {Object} ledgerEntry
 * @returns {{ entry: Object, verified: boolean, tampered: boolean }}
 */
const verifyEntry = (ledgerEntry) => {
  const {
    signature,
    transaction_id,
    campaign_id,
    amount,
    type,
    created_at,
  } = ledgerEntry;

  // We need the squad_ref from the linked transaction for signature verification
  // (signature was built with squad_ref, not transaction_id)
  const verified = verifyLedgerSignature(
    {
      squadRef: ledgerEntry.transactions?.squad_ref || '',
      campaignId: campaign_id,
      amountKobo: amount,
      type,
      status: ledgerEntry.transactions?.status || 'confirmed',
      createdAt: created_at,
    },
    signature
  );

  return {
    entry: {
      id: ledgerEntry.id,
      campaignId: campaign_id,
      amount: Math.abs(amount),            // always positive for display
      amountNgn: Math.abs(amount) / 100,
      type,
      trustLevel: ledgerEntry.trust_level,
      trustScore: ledgerEntry.trust_score,
      aiExplanation: ledgerEntry.ai_explanation,
      label: ledgerEntry.label,
      nipRef: ledgerEntry.nip_ref,         // for payout entries — CBN traceable
      squadRef: ledgerEntry.transactions?.squad_ref,
      signature,
      createdAt: created_at,
    },
    verified,
    tampered: !verified,
  };
};

// ─── GET /verify/:ledgerEntryId ───────────────────────────────────────────────

router.get(
  '/:ledgerEntryId',
  asyncWrap(async (req, res) => {
    const { data, error } = await adminClient
      .from('ledger_entries')
      .select('*, transactions(squad_ref, status)')
      .eq('id', req.params.ledgerEntryId)
      .single();

    if (error || !data) throw createError('Ledger entry not found', 404);

    res.json({ success: true, data: verifyEntry(data) });
  })
);

// ─── GET /verify/ref/:squadRef ────────────────────────────────────────────────

router.get(
  '/ref/:squadRef',
  asyncWrap(async (req, res) => {
    const { data: tx, error: txErr } = await adminClient
      .from('transactions')
      .select('id')
      .eq('squad_ref', req.params.squadRef)
      .single();

    if (txErr || !tx) throw createError('Transaction not found', 404);

    const { data, error } = await adminClient
      .from('ledger_entries')
      .select('*, transactions(squad_ref, status)')
      .eq('transaction_id', tx.id)
      .single();

    if (error || !data) throw createError('Ledger entry not found', 404);

    res.json({ success: true, data: verifyEntry(data) });
  })
);

export default router;
