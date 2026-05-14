/**
 * backend/services/campaignService.js
 *
 * All campaign database operations.
 * This is the only layer that touches the campaigns table.
 *
 * On campaign creation, this service also calls squadService to
 * provision a Squad Dynamic Virtual Account for the campaign.
 *
 * Consumers: campaigns route
 */

import { v4 as uuidv4 } from 'uuid';
import { adminClient } from '../config/supabase.js';
import { createDynamicVirtualAccount, lookupAccount } from './squadService.js';
import { createError } from '../middleware/errorHandler.js';

/**
 * Creates a new campaign and provisions its Squad virtual account.
 * The beneficiary account is verified via Squad lookup before saving.
 *
 * @param {Object} params
 * @param {string} params.ownerId
 * @param {string} params.name
 * @param {string} params.org
 * @param {string} params.category
 * @param {string} params.description
 * @param {number} params.goalNgn         - Goal in NGN (converted to kobo internally)
 * @param {string} [params.endDate]
 * @param {string} [params.socialLink]
 * @param {string} params.beneficiaryBankCode
 * @param {string} params.beneficiaryAccountNo
 * @param {string} [params.walletAddress]
 * @returns {Promise<Object>} Created campaign row
 */
export const createCampaign = async (params) => {
  const {
    ownerId,
    name,
    org,
    category,
    description,
    goalNgn,
    endDate,
    socialLink,
    beneficiaryBankCode,
    beneficiaryAccountNo,
    walletAddress,
  } = params;

  // 1. Verify beneficiary account via Squad before saving anything
  const beneficiary = await lookupAccount({
    accountNumber: beneficiaryAccountNo,
    bankCode: beneficiaryBankCode,
  });

  // 2. Provision Squad dynamic virtual account for this campaign
  const campaignId = uuidv4();
  const squadVa = await createDynamicVirtualAccount({
    campaignId,
    campaignName: name,
  });

  // 3. Insert campaign row
  const { data, error } = await adminClient
    .from('campaigns')
    .insert({
      id: campaignId,
      owner_id: ownerId,
      name,
      org,
      category,
      description,
      goal: goalNgn * 100, // convert NGN → Kobo
      end_date: endDate || null,
      social_link: socialLink || null,
      squad_virtual_account_no: squadVa.accountNumber,
      squad_bank: squadVa.bankName,
      squad_customer_id: squadVa.customerId,
      beneficiary_bank_code: beneficiaryBankCode,
      beneficiary_account_no: beneficiaryAccountNo,
      beneficiary_account_name: beneficiary.accountName,
      wallet_address: walletAddress || null,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw createError(`Failed to create campaign: ${error.message}`, 500);
  return data;
};

/**
 * Fetches all active campaigns (public).
 *
 * @param {{ limit?: number, offset?: number, category?: string }} options
 * @returns {Promise<Object[]>}
 */
export const listCampaigns = async ({ limit = 20, offset = 0, category } = {}) => {
  let query = adminClient
    .from('campaigns')
    .select(`
      id, name, org, category, description, goal, raised,
      trust_score, trust_level, status, end_date,
      squad_virtual_account_no, squad_bank,
      beneficiary_account_name, created_at
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) throw createError(`Failed to list campaigns: ${error.message}`, 500);
  return data;
};

/**
 * Fetches a single campaign by ID (public).
 * Includes ledger entries for the transparency view.
 *
 * @param {string} campaignId
 * @returns {Promise<Object>}
 */
export const getCampaignById = async (campaignId) => {
  const { data, error } = await adminClient
    .from('campaigns')
    .select(`
      *,
      ledger_entries (
        id, amount, type, trust_level, trust_score,
        ai_explanation, label, signature, nip_ref, created_at
      )
    `)
    .eq('id', campaignId)
    .order('created_at', { ascending: false, foreignTable: 'ledger_entries' })
    .single();

  if (error) throw createError('Campaign not found', 404);
  return data;
};

/**
 * Updates campaign raised amount after a confirmed donation.
 * Called by transactionService after ledger write.
 *
 * @param {string} campaignId
 * @param {number} amountKobo
 * @returns {Promise<void>}
 */
export const incrementCampaignRaised = async (campaignId, amountKobo) => {
  const { error } = await adminClient.rpc('increment_campaign_raised', {
    p_campaign_id: campaignId,
    p_amount: amountKobo,
  });

  if (error) {
    // Non-fatal — log but don't throw. Ledger is the source of truth.
    console.error(`[TRACE] Failed to increment raised for ${campaignId}:`, error.message);
  }
};
