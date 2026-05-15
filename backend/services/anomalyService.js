/**
 * backend/services/anomalyService.js
 *
 * Calls the TRACE Python AI service to score a transaction.
 * Returns trust_score (0-100), trust_level, and is_anomaly flag.
 *
 * Consumer: transactionService.js (called after confirming a transaction)
 */

import axios from 'axios';
import env from '../config/env.js';

/**
 * Scores a transaction using the IsolationForest anomaly detection model.
 *
 * @param {Object} transaction
 * @param {number} transaction.amount           - Amount in Kobo
 * @param {string} transaction.type             - 'donation' or 'withdrawal'
 * @param {string} [transaction.created_at]     - ISO timestamp
 * @param {number} [transaction.time_since_last_tx] - Seconds since last tx
 * @param {number} [transaction.recipient_tx_count] - Number of txs to recipient
 * @param {number} [transaction.fund_depletion_rate] - 0-1 ratio
 * @returns {Promise<{ trust_score: number, trust_level: string, is_anomaly: boolean }>}
 */
export const scoreTransaction = async (transaction) => {
  try {
    const response = await axios.post(
      `${env.AI_SERVICE_URL}/score`,
      {
        amount: transaction.amount / 100, // convert kobo to NGN for the model
        type: transaction.type,
        created_at: transaction.created_at || new Date().toISOString(),
        time_since_last_tx: transaction.time_since_last_tx || 3600,
        recipient_tx_count: transaction.recipient_tx_count || 5,
        fund_depletion_rate: transaction.fund_depletion_rate || 0.1,
      },
      { timeout: 5000 } // 5 second timeout — don't block payment flow
    );

    return response.data;
  } catch (err) {
    // If AI service is down, default to watch — never block the transaction
    console.error('[TRACE] Anomaly service error:', err.message);
    return {
      trust_score: 50,
      trust_level: 'watch',
      is_anomaly: false,
    };
  }
};