import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const USDT_TO_NGN = parseInt(process.env.USDT_TO_NGN) || 1400;
const TRONGRID_BASE = 'https://api.trongrid.io';

async function getIncomingUSDT(walletAddress, sinceTimestamp) {
  try {
    const response = await axios.get(
      `${TRONGRID_BASE}/v1/accounts/${walletAddress}/transactions/trc20`,
      {
        headers: {
          'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY,
        },
        params: {
          contract_address: USDT_CONTRACT,
          limit: 50,
          min_timestamp: sinceTimestamp,
        },
      }
    );
    const txs = response.data?.data || [];
    return txs.filter(
      (tx) => tx.to.toLowerCase() === walletAddress.toLowerCase()
    );
  } catch (err) {
    console.error(`[web3] Failed to fetch transactions for ${walletAddress}:`, err.message);
    return [];
  }
}

async function isAlreadyLogged(txHash) {
  const { data } = await supabase
    .from('transactions')
    .select('id')
    .eq('squad_ref', txHash)
    .single();
  return !!data;
}

async function logCryptoTransaction(campaignId, tx) {
  try {
    const usdtAmount = parseInt(tx.value) / 1_000_000;
    const amountNGN = Math.round(usdtAmount * USDT_TO_NGN);
    const senderShort = tx.from.slice(0, 6) + '...' + tx.from.slice(-4);

    const { error } = await supabase
      .from('transactions')
      .insert({
        campaign_id: campaignId,
        label: `Crypto contribution from ${senderShort}`,
        amount: amountNGN,
        type: 'donation',
        squad_ref: tx.transaction_id,
        squad_verified: true,
        trust_score: 85,
        trust_level: 'clean',
        signature: 'pending',
        status: 'confirmed',
        currency: 'USDT',
      });

    if (error) {
      console.error('[web3] Failed to log transaction:', error.message);
    } else {
      console.log(`[web3] Logged crypto tx ${tx.transaction_id} — ₦${amountNGN.toLocaleString()}`);
    }
  } catch (err) {
    console.error('[web3] Error logging transaction:', err.message);
  }
}

async function watchWallets() {
  console.log('[web3] Checking campaign wallets...');

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, name, wallet_address')
    .not('wallet_address', 'is', null);

  if (error) {
    console.error('[web3] Failed to fetch campaigns:', error.message);
    return;
  }

  if (!campaigns || campaigns.length === 0) {
    console.log('[web3] No campaigns with wallet addresses found.');
    return;
  }

  const sinceTimestamp = Date.now() - 5 * 60 * 1000;

  for (const campaign of campaigns) {
    const txs = await getIncomingUSDT(campaign.wallet_address, sinceTimestamp);
    for (const tx of txs) {
      const alreadyLogged = await isAlreadyLogged(tx.transaction_id);
      if (!alreadyLogged) {
        await logCryptoTransaction(campaign.id, tx);
      }
    }
  }
}

function startWeb3Watcher() {
  console.log('[web3] Starting USDT TRC20 watcher...');
  watchWallets();
  setInterval(watchWallets, 60_000);
}

export { startWeb3Watcher, watchWallets, logCryptoTransaction };