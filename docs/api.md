# TRACE — API Reference

Base URL: `http://localhost:3001`

All protected endpoints require `Authorization: Bearer <jwt>` header.

---

## Health

### GET /health
Public. Returns server status.

**Response:**
```json
{
  "status": "ok",
  "service": "TRACE API",
  "env": "development",
  "timestamp": "2026-05-15T00:00:00.000Z"
}
```

---

## Campaigns

### GET /api/campaigns
Public. Returns all active campaigns.

### GET /api/campaigns/:id
Public. Returns a single campaign with transactions.

### POST /api/campaigns
Protected. Creates a new campaign.

**Body:**
```json
{
  "name": "Campaign Name",
  "org": "Organization Name",
  "description": "Campaign description",
  "category": "medical",
  "goal": 1000000,
  "endDate": "2026-12-31",
  "bankName": "GTBank",
  "accountNumber": "0123456789",
  "accountName": "Account Name",
  "walletAddress": "TRC20 wallet address (optional)"
}
```

---

## Transactions

### POST /api/transactions/initiate
Public (optional auth). Initiates a Squad payment session.

**Body:**
```json
{
  "campaignId": "uuid",
  "amountNgn": 5000,
  "email": "donor@email.com",
  "donorName": "Donor Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://sandbox-pay.squadco.com/...",
    "transactionRef": "trace_abc123_def456"
  }
}
```

### GET /api/transactions/verify/:ref
Public. Verifies and confirms a transaction by Squad reference.

### POST /api/transactions/payout
Protected (campaign owner only). Initiates payout to beneficiary.

**Body:**
```json
{
  "campaignId": "uuid",
  "amountNgn": 50000,
  "narration": "Campaign payout"
}
```

---

## Webhooks

### POST /api/webhooks
Squad webhook receiver. Validates HMAC-SHA512 signature, confirms transaction, scores with AI, signs with HMAC-SHA256, writes to ledger.

---

## Verify

### GET /api/verify/:ref
Public. Verifies cryptographic signature of a transaction.

**Response (valid):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "transaction": { ... },
    "signature": "abc123..."
  }
}
```

**Response (tampered):**
```json
{
  "success": false,
  "error": "Signature invalid — record has been tampered with"
}
```

---

## AI Service

Base URL: `http://localhost:8001`

### GET /health
Returns AI service status.

### POST /score
Scores a transaction for anomalous behavior.

**Body:**
```json
{
  "amount": 5000,
  "type": "donation",
  "time_since_last_tx": 3600,
  "recipient_tx_count": 5,
  "fund_depletion_rate": 0.1
}
```

**Response:**
```json
{
  "trust_score": 78,
  "trust_level": "clean",
  "is_anomaly": false
}
```