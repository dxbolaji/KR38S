import { v4 as uuidv4 } from 'uuid';
import { adminClient } from '../config/supabase.js';
import {
  initiatePayment,
  verifyTransaction,
  initiateTransfer,
  requeryTransfer,
} from './squadService.js';
import { signLedgerEntry } from './signingService.js';
import { incrementCampaignRaised } from './campaignService.js';
import { scoreTransaction } from './anomalyService.js';
import { createError } from '../middleware/errorHandler.js';
import env from '../config/env.js';

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

  const { error: txErr } = await adminClient.from('transactions').insert({
    campaign_id: campaignId,
    donor_id: donorId || null,
    squad_ref: transactionRef,
    amount: amountKobo,
    currency: 'NGN',
    type: 'donation',
    status: 'pending',
    signature: 'pending',
    label: `Donation to ${campaign.name}`,
    metadata: { email, donor_name: donorName || '' },
  });

  if (txErr) throw createError(`Failed to record transaction: ${txErr.message}`, 500);

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

export const confirmTransaction = async (squadRef) => {
  const { data: existing } = await adminClient
    .from('transactions')
    .select('id, status, campaign_id')
    .eq('squad_ref', squadRef)
    .single();

  if (existing?.status === 'confirmed') {
    return { alreadyConfirmed: true, transactionId: existing.id };
  }

  const squadTx = await verifyTransaction(squadRef);

  if (squadTx.transaction_status !== 'Success') {
    await adminClient
      .from('transactions')
      .update({ status: 'failed' })
      .eq('squad_ref', squadRef);

    throw createError(
      `Payment not successful. Status: ${squadTx.transaction_status}`,
      400
    );
  }

  const campaignId = squadTx.meta?.campaign_id || existing?.campaign_id;
  if (!campaignId) {
    throw createError('Cannot determine campaign for transaction', 500);
  }

  const amountKobo = Number(squadTx.principal_amount || squadTx.transaction_amount);
  const createdAt = new Date().toISOString();

  const signature = signLedgerEntry({
    squadRef,
    campaignId,
    amountKobo,
    type: 'donation',
    status: 'confirmed',
    createdAt,
  });

  // Score with AI anomaly detection
  const { trust_score, trust_level } = await scoreTransaction({
    amount: amountKobo,
    type: 'donation',
    created_at: createdAt,
  });

  const { data: confirmedTx, error: txUpdateErr } = await adminClient
    .from('transactions')
    .update({
      status: 'confirmed',
      squad_verified: true,
      amount: amountKobo,
      signature,
      trust_score,
      trust_level,
    })
    .eq('squad_ref', squadRef)
    .select()
    .single();

  if (txUpdateErr) {
    throw createError(`Failed to confirm transaction: ${txUpdateErr.message}`, 500);
  }

  const { data: ledgerEntry, error: ledgerErr } = await adminClient
    .from('ledger_entries')
    .insert({
      transaction_id: confirmedTx.id,
      campaign_id: campaignId,
      amount: amountKobo,
      type: 'donation',
      trust_level,
      trust_score,
      label: confirmedTx.label || `Donation of ₦${amountKobo / 100}`,
      signature,
      created_at: createdAt,
    })
    .select()
    .single();

  if (ledgerErr) {
    throw createError(`Ledger write failed: ${ledgerErr.message}`, 500);
  }

  await incrementCampaignRaised(campaignId, amountKobo);

  return ledgerEntry;
};

export const initiatePayout = async ({
  campaignId,
  requesterId,
  amountNgn,
  narration,
}) => {
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

  if (amountKobo > campaign.raised) {
    throw createError(
      `Requested payout (₦${amountNgn}) exceeds campaign raised amount`,
      400
    );
  }

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
    amountKobo: -amountKobo,
    type: 'withdrawal',
    status: transferStatus,
    createdAt,
  });

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
      nip_ref: nipRef,
      created_at: createdAt,
    })
    .select()
    .single();

  if (ledgerErr) throw createError(`Ledger write failed: ${ledgerErr.message}`, 500);

  return ledgerEntry;
};

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