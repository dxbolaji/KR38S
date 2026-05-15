# TRACE — System Architecture

## Overview

TRACE is a three-layer system: a React frontend, a Node.js backend API, and a Python AI service. All three communicate via HTTP. The database is Supabase (PostgreSQL).

## Layer Diagram
┌─────────────────────────────────────────┐
│           BROWSER (React)               │
│  Landing → Auth → Home → Campaign →     │
│  Donate → Search → Profile → Verify     │
└────────────────┬────────────────────────┘
│ HTTP
┌────────────────▼────────────────────────┐
│         NODE.JS BACKEND (Express)       │
│                                         │
│  /api/campaigns    /api/transactions    │
│  /api/webhooks     /api/verify          │
│                                         │
│  squadService      signingService       │
│  anomalyService    web3Service          │
│  transactionService campaignService     │
└──────┬──────────────────────┬───────────┘
│ HTTP                 │ Supabase SDK
┌──────▼──────┐    ┌──────────▼───────────┐
│  PYTHON AI  │    │      SUPABASE        │
│  FastAPI    │    │                      │
│  /score     │    │  auth.users          │
│  /health    │    │  profiles            │
│             │    │  campaigns           │
│ IsolationF. │    │  transactions        │
│ 0-100 score │    │  ledger_entries      │
└─────────────┘    │  campaign_documents  │
└──────────────────────┘

## Data Flow — Donation
1) User clicks Donate on campaign page
2) Frontend POST /api/transactions/initiate
3) Backend creates pending transaction in Supabase
4) Backend calls Squad API → gets checkout URL
5) Frontend redirects user to Squad checkout
6) User pays on Squad
7) Squad fires webhook to /api/webhooks
8) Backend verifies payment with Squad
9) Backend calls AI /score endpoint
10) Backend signs transaction with HMAC-SHA256
11) Transaction written to transactions + ledger_entries
12) Campaign raised amount incremented
13) Public ledger updates 

## Data Flow — Crypto Donation (Web3)
1) Campaign organizer adds USDT TRC20 wallet at creation
2) web3Service polls TronGrid API every 60 seconds
3) New USDT transfer detected to campaign wallet
4) Amount converted from USDT to NGN (fixed rate)
5) Transaction logged to Supabase
6) Trust score assigned, signature generated
7) Appears on public ledger automatically

## Data Flow — Verification
1) Anyone pastes transaction ID on /verify page
2) Frontend calls /api/verify/:ref
3) Backend fetches transaction from Supabase
4) Backend recomputes HMAC-SHA256 signature
5) Compares with stored signature
6) Returns VERIFIED or TAMPERED

## Database Schema

### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | FK to auth.users |
| username | text | Unique @handle |
| full_name | text | Display name |
| email | text | User email |
| created_at | timestamptz | Join date |

### campaigns
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| owner_id | UUID | FK to profiles |
| name | text | Campaign name |
| org | text | Organization name |
| category | enum | medical/education/relief/creative/community/other |
| goal | int8 | Target amount in Kobo |
| raised | int8 | Amount raised in Kobo |
| status | enum | active/completed/flagged/paused |
| trust_score | int4 | 0-100 |
| trust_level | enum | clean/watch/suspicious |
| wallet_address | text | USDT TRC20 wallet |
| squad_virtual_account_no | text | Squad virtual account |

### transactions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| campaign_id | UUID | FK to campaigns |
| donor_id | UUID | FK to profiles (nullable) |
| squad_ref | text | Unique Squad reference |
| amount | int8 | Amount in Kobo |
| type | enum | donation/withdrawal/refund |
| status | enum | pending/confirmed/failed/flagged |
| trust_score | int4 | AI anomaly score 0-100 |
| trust_level | enum | clean/watch/suspicious |
| signature | text | HMAC-SHA256 signature |
| squad_verified | bool | Verified with Squad |

### ledger_entries
Append-only immutable record of every confirmed transaction. Signed independently from transactions table.