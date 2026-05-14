/**
 * backend/services/signingService.js
 *
 * Cryptographic integrity layer for the TRACE transparency ledger.
 * Every transaction written to ledger_entries is signed with HMAC-SHA256.
 * Any tamper with amount, campaign_id, type, or status breaks the signature.
 *
 * This is what makes TRACE genuinely transparent — anyone with the
 * transaction data can verify the signature independently.
 *
 * Consumers: transactionService.js, webhookRoute.js, verifyRoute.js
 */

import crypto from 'crypto';
import env from '../config/env.js';

/**
 * Builds the canonical string that is signed.
 * Order is fixed — any reordering produces a different hash.
 * Never change this format after going live (breaks existing sigs).
 *
 * @param {{ squadRef: string, campaignId: string, amountKobo: number, type: string, status: string, createdAt: string }} fields
 * @returns {string}
 */
const buildCanonicalString = ({
  squadRef,
  campaignId,
  amountKobo,
  type,
  status,
  createdAt,
}) =>
  [squadRef, campaignId, amountKobo, type, status, createdAt].join('|');

/**
 * Signs a transaction payload.
 * Call this before inserting into ledger_entries.
 *
 * @param {{ squadRef: string, campaignId: string, amountKobo: number, type: string, status: string, createdAt: string }} fields
 * @returns {string} HMAC-SHA256 hex digest
 */
export const signLedgerEntry = (fields) => {
  const canonical = buildCanonicalString(fields);
  return crypto
    .createHmac('sha256', env.SIGNING_SECRET)
    .update(canonical)
    .digest('hex');
};

/**
 * Verifies a ledger entry's signature.
 * Returns true if the entry is untampered, false if it has been modified.
 *
 * @param {{ squadRef: string, campaignId: string, amountKobo: number, type: string, status: string, createdAt: string }} fields
 * @param {string} storedSignature - The signature stored in the DB
 * @returns {boolean}
 */
export const verifyLedgerSignature = (fields, storedSignature) => {
  const expected = signLedgerEntry(fields);
  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(storedSignature, 'hex')
    );
  } catch {
    // Buffer lengths differ = definitely invalid
    return false;
  }
};
