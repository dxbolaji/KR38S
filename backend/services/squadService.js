/**
 * backend/services/squadService.js
 *
 * Single source of truth for all Squad API interactions.
 * No route or controller should call Squad directly — always go through here.
 *
 * Squad API docs: https://docs.squadco.com
 * Sandbox base:   https://sandbox-api-d.squadco.com
 *
 * Key rules enforced here:
 *  - Amount is ALWAYS in Kobo (₦1 = 100 Kobo)
 *  - Webhook signatures use HMAC-SHA512
 *  - Transfer 424 = re-query, never retry with new reference
 *  - Dynamic VAs are used per-campaign (not static)
 *
 * Consumers: campaignService.js, transactionService.js, webhookRoute.js
 */

import axios from 'axios';
import crypto from 'crypto';
import env from '../config/env.js';
import { createError } from '../middleware/errorHandler.js';

// ─── Axios instance with auth header pre-configured ───────────────────────────

const squadHttp = axios.create({
  baseURL: env.SQUAD_BASE_URL,
  headers: {
    Authorization: `Bearer ${env.SQUAD_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30_000, // 30 seconds
});

// Log all Squad requests in development
squadHttp.interceptors.request.use((config) => {
  if (env.NODE_ENV === 'development') {
    console.log(`[Squad →] ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

// ─── Types (JSDoc) ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} InitiatePaymentParams
 * @property {string} email           - Donor's email address
 * @property {number} amountKobo      - Amount in Kobo (multiply NGN by 100)
 * @property {string} transactionRef  - Your unique reference (store this)
 * @property {string} campaignId      - TRACE campaign UUID (stored in metadata)
 * @property {string} campaignName    - Human-readable campaign name
 * @property {string} callbackUrl     - URL Squad redirects donor to after payment
 * @property {string} [donorName]     - Optional donor name
 * @property {boolean} [passCharge]   - If true, fee is added to donor's amount
 */

/**
 * @typedef {Object} TransferParams
 * @property {string} accountNumber   - Recipient account number
 * @property {string} bankCode        - Nigerian bank code (e.g. "058" for GTBank)
 * @property {number} amountKobo      - Amount in Kobo
 * @property {string} transactionRef  - Unique reference (append merchant ID)
 * @property {string} campaignId      - For audit trail
 * @property {string} narration       - Human-readable transfer description
 */

/**
 * @typedef {Object} WebhookPayload
 * @property {string} transaction_ref
 * @property {string} virtual_account_number
 * @property {string} principal_amount
 * @property {string} settled_amount
 * @property {string} fee_charged
 * @property {string} transaction_date
 * @property {Object} customer
 * @property {Object} [meta]
 */

// ─── 1. Payment Gateway ───────────────────────────────────────────────────────

/**
 * Initiates a Squad hosted payment session.
 * Returns a checkout_url to redirect the donor to.
 *
 * @param {InitiatePaymentParams} params
 * @returns {Promise<{ checkoutUrl: string, transactionRef: string }>}
 */
export const initiatePayment = async (params) => {
  const {
    email,
    amountKobo,
    transactionRef,
    campaignId,
    campaignName,
    callbackUrl,
    donorName = '',
    passCharge = false,
  } = params;

  if (!email || !amountKobo || !transactionRef || !campaignId || !callbackUrl) {
    throw createError('initiatePayment: missing required parameters', 400);
  }

  if (amountKobo < 100) {
    throw createError('Minimum donation is ₦1 (100 Kobo)', 400);
  }

  const payload = {
    email,
    amount: amountKobo,
    currency: 'NGN',
    initiate_type: 'inline',
    transaction_ref: transactionRef,
    callback_url: callbackUrl,
    customer_name: donorName,
    pass_charge: passCharge,
    // metadata is returned in both webhook and verify response
    // — this is how we know which campaign to credit
    metadata: {
      campaign_id: campaignId,
      campaign_name: campaignName,
      source: 'TRACE',
    },
  };

  const { data } = await squadHttp.post('/transaction/initiate', payload);

  if (data?.status !== 200 && data?.success !== true) {
    throw createError(
      `Squad payment initiation failed: ${data?.message || 'Unknown error'}`,
      502
    );
  }

  return {
    checkoutUrl: data.data?.checkout_url,
    transactionRef,
  };
};

// ─── 2. Verify Transaction ────────────────────────────────────────────────────

/**
 * Verifies a transaction by its reference.
 * Always call this after receiving a webhook — never trust the webhook alone.
 *
 * @param {string} transactionRef
 * @returns {Promise<Object>} Squad transaction object
 */
export const verifyTransaction = async (transactionRef) => {
  if (!transactionRef) {
    throw createError('verifyTransaction: transactionRef is required', 400);
  }

  const { data } = await squadHttp.get(
    `/transaction/verify/${transactionRef}`
  );

  if (!data?.data) {
    throw createError(
      `Squad verify failed for ref ${transactionRef}: ${data?.message || 'No data returned'}`,
      502
    );
  }

  return data.data;
};

// ─── 3. Dynamic Virtual Accounts ─────────────────────────────────────────────

/**
 * Creates a dynamic virtual account pool for a campaign.
 * Squad assigns a real GTBank account number to the campaign.
 * Any Nigerian bank can transfer to this number.
 *
 * NOTE: You must have Dynamic VA activated on your Squad account.
 * Email help@squadco.com to activate, or use initiate payment for sandbox.
 *
 * @param {{ campaignId: string, campaignName: string, duration?: number }} params
 * @returns {Promise<{ accountNumber: string, bankName: string, customerId: string }>}
 */
export const createDynamicVirtualAccount = async ({
  campaignId,
  campaignName,
  duration = 0, // 0 = no expiry for crowdfunding campaigns
}) => {
  const payload = {
    duration,
    // Squad uses customer_id to track whose account this is
    customer_identifier: `trace_campaign_${campaignId}`,
    // Amount 0 = accept any amount (crowdfunding mode)
    amount: 0,
    beneficiary_account: campaignId,
    meta_data: {
      campaign_name: campaignName,
      source: 'TRACE',
    },
  };

  const { data } = await squadHttp.post(
    '/virtual-account/initiate-dynamic-virtual-account',
    payload
  );

  if (!data?.data) {
    throw createError(
      `Squad virtual account creation failed: ${data?.message || 'Unknown error'}`,
      502
    );
  }

  return {
    accountNumber: data.data.virtual_account_number,
    bankName: data.data.bank_name || 'GTBank',
    customerId: data.data.customer_id,
  };
};

// ─── 4. Webhook Signature Validation ─────────────────────────────────────────

/**
 * Validates the Squad webhook signature.
 * Squad signs with HMAC-SHA512 using your secret key.
 *
 * Two strategies supported:
 *  - V1: Hash the entire raw body string
 *  - V2/V3: Hash 6 pipe-separated fields
 *
 * CRITICAL: rawBody must be the raw Buffer/string before any JSON.parse.
 * Use express.raw() on the webhook route, NOT express.json().
 *
 * @param {string} rawBody       - Raw request body string
 * @param {string} squadHeader   - Value of x-squad-encrypted-body header
 * @returns {boolean}
 */
export const validateWebhookSignature = (rawBody, squadHeader) => {
  if (!squadHeader) return false;

  const secret = env.SQUAD_SECRET_KEY;

  // V1: hash entire raw body
  const hashV1 = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');

  if (hashV1 === squadHeader) return true;

  // V2/V3: try to parse and hash the 6 pipe-separated fields
  try {
    const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const {
      transaction_ref,
      virtual_account_number,
      principal_amount,
      settled_amount,
      fee_charged,
      transaction_date,
    } = body;

    const pipeString = [
      transaction_ref,
      virtual_account_number,
      principal_amount,
      settled_amount,
      fee_charged,
      transaction_date,
    ].join('|');

    const hashV2 = crypto
      .createHmac('sha512', secret)
      .update(pipeString)
      .digest('hex');

    return hashV2 === squadHeader;
  } catch {
    return false;
  }
};

// ─── 5. Account Lookup (pre-transfer verification) ───────────────────────────

/**
 * Looks up a bank account to verify the account name before transferring.
 * ALWAYS call this before initiateTransfer — Squad requires it.
 *
 * @param {{ accountNumber: string, bankCode: string }} params
 * @returns {Promise<{ accountName: string, accountNumber: string, bankCode: string }>}
 */
export const lookupAccount = async ({ accountNumber, bankCode }) => {
  if (!accountNumber || !bankCode) {
    throw createError('lookupAccount: accountNumber and bankCode are required', 400);
  }

  const { data } = await squadHttp.post('/payout/account/lookup', {
    account_number: accountNumber,
    bank_code: bankCode,
  });

  if (!data?.data?.account_name) {
    throw createError(
      `Account lookup failed: ${data?.message || 'Could not verify account'}`,
      502
    );
  }

  return {
    accountName: data.data.account_name,
    accountNumber,
    bankCode,
  };
};

// ─── 6. Initiate Transfer (payout) ───────────────────────────────────────────

/**
 * Transfers funds from your Squad wallet to a beneficiary bank account.
 *
 * CRITICAL RULES:
 *  1. Always call lookupAccount first
 *  2. transactionRef must be globally unique — never reuse
 *  3. On 424 response: call requeryTransfer, NEVER retry with same/new ref
 *  4. Amount in Kobo
 *
 * @param {TransferParams} params
 * @returns {Promise<{ reference: string, nipRef: string, status: string }>}
 */
export const initiateTransfer = async (params) => {
  const {
    accountNumber,
    bankCode,
    amountKobo,
    transactionRef,
    narration,
  } = params;

  if (!accountNumber || !bankCode || !amountKobo || !transactionRef) {
    throw createError('initiateTransfer: missing required parameters', 400);
  }

  const payload = {
    account_number: accountNumber,
    bank_code: bankCode,
    amount: amountKobo,
    currency: 'NGN',
    transaction_reference: transactionRef,
    narration: narration || 'TRACE Campaign Payout',
  };

  const response = await squadHttp.post('/payout/transfer', payload);
  const { data, status } = response;

  // 424 = timeout. Do NOT retry. Call requeryTransfer.
  if (status === 424) {
    throw createError(
      `SQUAD_424: Transfer timed out for ref ${transactionRef}. Call requeryTransfer.`,
      424
    );
  }

  if (data?.status !== 200 && data?.success !== true) {
    throw createError(
      `Transfer failed: ${data?.message || 'Unknown Squad error'}`,
      502
    );
  }

  return {
    reference: transactionRef,
    nipRef: data.data?.transaction_ref || '',
    status: data.data?.status || 'pending',
  };
};

// ─── 7. Re-query Transfer ─────────────────────────────────────────────────────

/**
 * Re-queries the status of a transfer.
 * Call this after a 424 response — do NOT initiate a new transfer.
 *
 * @param {string} transactionRef
 * @returns {Promise<{ status: string, nipRef: string }>}
 */
export const requeryTransfer = async (transactionRef) => {
  if (!transactionRef) {
    throw createError('requeryTransfer: transactionRef is required', 400);
  }

  const { data } = await squadHttp.post('/payout/requery', {
    transaction_ref: transactionRef,
  });

  return {
    status: data?.data?.status || 'unknown',
    nipRef: data?.data?.nip_transaction_reference || '',
  };
};
