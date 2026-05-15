# TRACE — Cryptographic Trust Layer

## Overview

Every transaction on TRACE is cryptographically signed at the moment it is confirmed. This makes the financial record tamper-evident — any alteration after the fact breaks the signature and is detected immediately.

No blockchain required. The trust is enforced by cryptographic math.

---

## How It Works

### Signing

When a transaction is confirmed, the backend builds a canonical string from six fields:
squadRef|campaignId|amountKobo|type|status|createdAt

This string is signed using **HMAC-SHA256** with a private signing secret stored only on the TRACE server:

```javascript
const signature = crypto
  .createHmac('sha256', SIGNING_SECRET)
  .update(canonicalString)
  .digest('hex');
```

The signature is stored alongside the transaction in the `transactions` and `ledger_entries` tables.

---

### Verification

Anyone can verify a transaction by providing the transaction reference. TRACE:

1. Fetches the transaction from the database
2. Rebuilds the canonical string from the stored fields
3. Recomputes the HMAC-SHA256 signature
4. Compares it to the stored signature using `crypto.timingSafeEqual()`

If they match → **VERIFIED** — the record is untampered.
If they don't match → **TAMPERED** — the record was altered after signing.

---

### What It Protects Against

| Attack | Protection |
|--------|-----------|
| Someone changes the amount in the database | Signature breaks — detected |
| Someone changes the campaign ID | Signature breaks — detected |
| Someone deletes a transaction | Ledger entry remains — append-only |
| Someone creates a fake transaction | No signing key — cannot forge |
| Man-in-the-middle on webhook | Squad HMAC-SHA512 validation |

---

### Why Not Blockchain?

Blockchain provides tamper-evidence through decentralized consensus. TRACE achieves the same result cryptographically, server-side, with zero gas fees, zero latency, and no dependency on external networks.

For Nigerian crowdfunding at scale, this is the right tradeoff — fast, cheap, verifiable.

---

### Security Notes

- The `SIGNING_SECRET` must be at least 32 random bytes
- It must never be committed to version control
- It must never be exposed to the frontend
- If it is compromised, all existing signatures remain valid but new ones can be forged — rotate immediately
- `timingSafeEqual` is used for comparison to prevent timing attacks