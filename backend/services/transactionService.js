/**
 * backend/services/transactionService.js
 *
 * Handles the full lifecycle of a TRACE transaction:
 *   1. Initiate payment  → Squad checkout session
 *   2. Confirm payment   → Squad verify + ledger write
 *   3. Payout            → Squad transfer + ledger write
 *
 * This is the most security-sensitive service in TRACE.
 * Every confirmed transaction writes to both `transactions` and
 * `ledger_entries` tables. The ledger is append-only and signed.
 *
 * Consumers: transactions route, webhooks route
 */

import { v4 as uuidv4 } from 'uuid';
import { adminClient } from '../config/supabase.js';
import {
  initiatePayment,
  verifyTransaction,
  initiateTransfer,
  lookupAccount,
  requeryTransfer,
} from './squadService.js';
import { signLedgerEntry } from './signingService.js';
import { incrementCampaignRaised } from './campaignService.js';
import { createError } from '../middleware/errorHandler.js';
import env from '../config/env.js';

// ─── 1. Initiate Donation Payment ─────────────────────────────────────────────

/**
 * Creates a Squad payment session for a donation.
 * Returns checkoutUrl for frontend redirect.
 *
 * @param {Object} params
 * @param {string} params.campaignId
 * @param {number} params.amountNgn    - Donor's intended amount in NGN
 * @param {string} params.email
 * @param {string} [params.donorName]
 * @param {string} [params.donorId]    - Supabase user ID if logged in
 * @returns {Promise<{ checkoutUrl: string, transactionRef: string }>}
 */
export const initiateDonation = async ({
  campaignId,
  amountNgn,
  email,
  donorName,
  donorId,
}) => {
  if (!campaignId || !amountNgn || !email) {
    throw createError('campaignId, amountNgn, and email are required', 400);
  }

  // Fetch campaign to confirm it exists and is active
  const { data: campaign, error: campErr } = await adminClient
    .from('campaigns')
    .select('id, name, status')
    .eq('id', campaignId)
    .single();

  if (campErr || !campaign) throw createError('Campaign not found', 404);
  if (campaign.status !== 'active') {
    throw createError('This campaign is no longer accepting donations', 400);
  }

  const transactionRef = `trace_${campaignId.slice(0, 8)}_${uuidv4().slice(0, 8)}`;
  const amountKobo = Math.round(amountNgn * 100);
  const callbackUrl = `${env.FRONTEND_URL}/verify?ref=${transactionRef}`;

  // Persist a pending transaction record before Squad call
  // so we can reconcile if the callback fails
  const { error: txErr } = await adminClient.from('transactions').insert({
    campaign_id: campaignId,
    donor_id: donorId || null,
    squad_ref: transactionRef,
    amount: amountKobo,
    currency: 'NGN',
    type: 'donation',
    status: 'pending',
    // Pending entries get a placeholder signature — replaced on confirmation
    signature: 'pending',
    label: `Donation to ${campaign.name}`,
    metadata: { email, donor_name: donorName || '' },
  });

  if (txErr) throw createError(`Failed to record transaction: ${txErr.message}`, 500);

  // Call Squad
  const result = await initiatePayment({
    email,
    amountKobo,
    transactionRef,
    campaignId,
    campaignName: campaign.name,
    callbackUrl,
    donorName,
    passCharge: false,
  });

  return result;
};

// ─── 2. Confirm Transaction (post-payment) ────────────────────────────────────

/**
 * Verifies and confirms a transaction after Squad payment.
 * Called by:
 *  (a) The webhook handler (primary path)
 *  (b) The /verify route (fallback when donor returns from checkout)
 *
 * Idempotent — safe to call multiple times for the same ref.
 *
 * @param {string} squadRef   - The transaction_ref from Squad
 * @returns {Promise<Object>} Ledger entry
 */
export const confirmTransaction = async (squadRef) => {
  // Check for existing confirmed transaction (idempotency guard)
  const { data: existing } = await adminClient
    .from('transactions')
    .select('id, status, campaign_id')
    .eq('squad_ref', squadRef)
    .single();

  if (existing?.status === 'confirmed') {
    // Already processed — return early. Never double-count.
    return { alreadyConfirmed: true, transactionId: existing.id };
  }

  // Verify with Squad (source of truth)
  const squadTx = await verifyTransaction(squadRef);

  if (squadTx.transaction_status !== 'Success') {
    // Update to failed and return
    await adminClient
      .from('transactions')
      .update({ status: 'failed' })
      .eq('squad_ref', squadRef);

    throw createError(
      `Payment not successful. Status: ${squadTx.transaction_status}`,
      400
    );
  }

  // Extract campaign_id from Squad metadata
  const campaignId =
    squadTx.meta?.campaign_id ||
    existing?.campaign_id;

  if (!campaignId) {
    throw createError('Cannot determine campaign for transaction', 500);
  }

  const amountKobo = Number(squadTx.principal_amount || squadTx.transaction_amount);
  const createdAt = new Date().toISOString();

  // Build and sign the ledger entry
  const signature = signLedgerEntry({
    squadRef,
    campaignId,
    amountKobo,
    type: 'donation',
    status: 'confirmed',
    createdAt,
  });

  // Update transaction to confirmed
  const { data: confirmedTx, error: txUpdateErr } = await adminClient
    .from('transactions')
    .update({
      status: 'confirmed',
      squad_verified: true,
      amount: amountKobo,
      signature,
    })
    .eq('squad_ref', squadRef)
    .select()
    .single();

  if (txUpdateErr) {
    throw createError(`Failed to confirm transaction: ${txUpdateErr.message}`, 500);
  }

  // Write to immutable ledger
  const { data: ledgerEntry, error: ledgerErr } = await adminClient
    .from('ledger_entries')
    .insert({
      transaction_id: confirmedTx.id,
      campaign_id: campaignId,
      amount: amountKobo,
      type: 'donation',
      trust_level: 'clean',
      trust_score: 100,
      label: confirmedTx.label || `Donation of ₦${amountKobo / 100}`,
      signature,
      created_at: createdAt,
    })
    .select()
    .single();

  if (ledgerErr) {
    throw createError(`Ledger write failed: ${ledgerErr.message}`, 500);
  }

  // Update campaign raised total (non-fatal if this fails)
  await incrementCampaignRaised(campaignId, amountKobo);

  return ledgerEntry;
};

// ─── 3. Initiate Payout (withdrawal) ─────────────────────────────────────────

/**
 * Transfers campaign funds to the registered beneficiary.
 * Only the campaign owner can trigger this.
 * Beneficiary account is the one verified at campaign creation — immutable.
 *
 * @param {Object} params
 * @param {string} params.campaignId
 * @param {string} params.requesterId  - Must match campaign.owner_id
 * @param {number} params.amountNgn
 * @param {string} params.narration
 * @returns {Promise<Object>} Payout ledger entry
 */
export const initiatePayout = async ({
  campaignId,
  requesterId,
  amountNgn,
  narration,
}) => {
  // Fetch campaign + verify ownership
  const { data: campaign, error: campErr } = await adminClient
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (campErr || !campaign) throw createError('Campaign not found', 404);
  if (campaign.owner_id !== requesterId) {
    throw createError('Only the campaign owner can request a payout', 403);
  }

  const amountKobo = Math.round(amountNgn * 100);

  // Guard: cannot withdraw more than raised
  if (amountKobo > campaign.raised) {
    throw createError(
      `Requested payout (₦${amountNgn}) exceeds campaign raised amount`,
      400
    );
  }

  // Unique transfer reference
  const transferRef = `trace_payout_${campaignId.slice(0, 8)}_${uuidv4().slice(0, 8)}`;
  const createdAt = new Date().toISOString();

  let nipRef = '';
  let transferStatus = 'pending';

  try {
    const result = await initiateTransfer({
      accountNumber: campaign.beneficiary_account_no,
      bankCode: campaign.beneficiary_bank_code,
      amountKobo,
      transactionRef: transferRef,
      narration: narration || `TRACE payout: ${campaign.name}`,
    });
    nipRef = result.nipRef;
    transferStatus = 'confirmed';
  } catch (err) {
    // If 424 timeout, record as pending and instruct re-query
    if (err.statusCode === 424) {
      transferStatus = 'pending';
      console.warn(`[TRACE] Squad 424 on payout ${transferRef} — queued for re-query`);
    } else {
      throw err;
    }
  }

  const signature = signLedgerEntry({
    squadRef: transferRef,
    campaignId,
    amountKobo: -amountKobo, // negative = outbound
    type: 'withdrawal',
    status: transferStatus,
    createdAt,
  });

  // Record in transactions
  const { data: tx, error: txErr } = await adminClient
    .from('transactions')
    .insert({
      campaign_id: campaignId,
      donor_id: requesterId,
      squad_ref: transferRef,
      amount: -amountKobo,
      currency: 'NGN',
      type: 'withdrawal',
      status: transferStatus,
      squad_verified: transferStatus === 'confirmed',
      signature,
      label: narration || `Payout: ${campaign.name}`,
    })
    .select()
    .single();

  if (txErr) throw createError(`Payout record failed: ${txErr.message}`, 500);

  // Write to ledger
  const { data: ledgerEntry, error: ledgerErr } = await adminClient
    .from('ledger_entries')
    .insert({
      transaction_id: tx.id,
      campaign_id: campaignId,
      amount: -amountKobo,
      type: 'withdrawal',
      trust_level: 'clean',
      label: tx.label,
      signature,
      nip_ref: nipRef, // CBN-traceable NIP session ID
      created_at: createdAt,
    })
    .select()
    .single();

  if (ledgerErr) throw createError(`Ledger write failed: ${ledgerErr.message}`, 500);

  return ledgerEntry;
};

// ─── 4. Re-query Payout Status ────────────────────────────────────────────────

/**
 * Re-queries a pending payout and updates its status.
 * Call this for any transaction with status = 'pending' and type = 'withdrawal'.
 *
 * @param {string} squadRef
 * @returns {Promise<{ status: string, nipRef: string }>}
 */
export const recheckPayout = async (squadRef) => {
  const result = await requeryTransfer(squadRef);

  await adminClient
    .from('transactions')
    .update({
      status: result.status === 'Success' ? 'confirmed' : 'pending',
      squad_verified: result.status === 'Success',
    })
    .eq('squad_ref', squadRef);

  return result;
};
