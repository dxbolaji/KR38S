# TRACE — Transparent Real-time AI Chain Engine

> **AI-powered financial transparency and fraud detection for NGOs, crowdfunding campaigns, and group funds.**

Built for [Squad Hackathon 3.0](https://squadco.com) — Challenge 01: *"Proof of Life"*

---

## The Problem

Millions of naira move through group funds, crowdfunding campaigns, NGOs, and community projects every day — with no way to verify where the money actually goes.

From the VDM NGO scandal, to Abazz's jersey fraud on X, contributors are forced to trust blindly. TRACE fixes that.

---

## What TRACE Does

TRACE is an AI-powered fundraising and financial intelligence platform that gives contributors real-time visibility into how their money is used — and flags suspicious activity before it becomes a scandal.

| Module | What it does |
|---|---|
| **Transparent Fundraising Layer** | Organizations receive contributions via Squad API |
| **Public Ledger Dashboard** | Real-time feed of every transaction with trust badges |
| **Anomaly Detection Engine** | IsolationForest model scores every transaction 0–100 |
| **AI Explanation Engine** | Converts model scores into plain-language fraud narratives |
| **Cryptographic Trust Layer** | HMAC-SHA256 signs every transaction — tampering breaks the signature |
| **Public Transparency Pages** | Shareable verification links for contributors |
| **Web3 Layer** | USDT TRC20 crypto donations detected and logged automatically |

---

## How It Works
---
Contributor donates via Squad API or USDT TRC20
↓
Transaction logged + cryptographically signed by TRACE server (HMAC-SHA256)
↓
IsolationForest model scores transaction (0–100)
↓
Trust badge (Clean / Watch / Suspicious) appears on public dashboard
↓
Contributor verifies independently via shareable link
↓
Any tampering with records breaks the signature — detected immediately

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TanStack Start (TypeScript), Tailwind CSS |
| Backend | Node.js / Express |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Squad API (card, transfer, USSD) |
| Crypto Payments | USDT TRC20 via TronGrid API |
| Anomaly Detection | IsolationForest (Python, scikit-learn) |
| Trust Layer | HMAC-SHA256 cryptographic signing (Node.js `crypto`) |
| AI Service | FastAPI (Python) |

---

## Project Structure

```
TRACE/
│
├── frontend/                  # React + TanStack Start
│   ├── src/
│   │   ├── components/        # Shared UI components
│   │   ├── routes/            # Page routes (home, campaign, donate, verify, search, profile)
│   │   ├── lib/               # Campaign data, utilities
│   │   ├── hooks/             # Custom React hooks
│   │   └── integrations/      # Supabase client
│   ├── public/
│   │   └── assets/img/        # Logo and favicon
│   └── supabase/              # Supabase config
│
├── backend/
│   ├── server.js              # Express entry point
│   ├── routes/
│   │   ├── campaigns.js       # Campaign CRUD
│   │   ├── transactions.js    # Payment initiation, payout, verify
│   │   ├── webhooks.js        # Squad webhook receiver
│   │   └── verify.js          # Public ledger verification
│   ├── services/
│   │   ├── squadService.js    # Squad API — payments, transfers, webhooks
│   │   ├── signingService.js  # HMAC-SHA256 sign + verify
│   │   ├── anomalyService.js  # Calls Python AI model
│   │   ├── transactionService.js  # Full transaction lifecycle
│   │   ├── campaignService.js # Campaign management
│   │   └── web3Service.js     # USDT TRC20 watcher
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── rateLimit.js       # Rate limiting
│   │   └── errorHandler.js    # Central error handling
│   └── config/
│       ├── supabase.js        # Supabase admin client
│       └── env.js             # Environment variable validation
│
├── ai/
│   ├── api.py                 # FastAPI — exposes /score and /health endpoints
│   ├── model/
│   │   ├── train.py           # IsolationForest training script
│   │   ├── predict.py         # Scoring logic
│   │   ├── features.py        # Feature engineering
│   │   └── trace_model.pkl    # Trained model
│   └── data/
│       └── synthetic_transactions.csv  # Training data
│
├── docs/
│   ├── architecture.md        # System architecture
│   ├── api.md                 # API endpoint reference
│   └── trust-layer.md        # Cryptographic trust layer explained
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- Python 3.10+
- Supabase account
- Squad API credentials
- TronGrid API key

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:8080`

### Backend

```bash
# Run from project root
node backend/server.js
```

Runs at `http://localhost:3001`

### AI Layer

```bash
cd ai
pip install fastapi uvicorn scikit-learn pandas numpy python-dotenv
uvicorn api:app --reload --port 8001
```

Runs at `http://localhost:8001`

---

## Environment Variables

### Frontend (`frontend/.env`)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
SQUAD_SECRET_KEY=your_squad_secret
SQUAD_BASE_URL=https://sandbox-api-d.squadco.com
SIGNING_SECRET=your_signing_secret
OPENAI_API_KEY=your_openai_key
AI_SERVICE_URL=http://localhost:8001
TRONGRID_API_KEY=your_trongrid_key
USDT_TO_NGN=1400
```

### AI (`ai/.env`)

```env
PORT=8001
```

---

## The Cryptographic Trust Layer

Every transaction on TRACE is signed at the moment it occurs using HMAC-SHA256. The signing key lives only on the TRACE server — organizations cannot access or forge it.

If anyone alters a transaction record after the fact, the signature breaks. TRACE detects it immediately and flags the record.

No blockchain required. Tamper-evident by design.

---

## Build Status

- [x] Frontend — complete
- [x] Backend — complete
- [x] AI layer — complete
- [x] Payment integration (Squad) — complete
- [x] Cryptographic signing — complete
- [x] Web3 USDT TRC20 layer — complete
- [ ] Deployment — in progress

---

## Hackathon Context

- **Event:** Squad Hackathon 3.0
- **Theme:** Smart Systems: The Intelligent Economy
- **Challenge:** 01 — Proof of Life
- **Domain:** Financial Services — transaction trust scoring

### Four Pillars Addressed

- ✅ **AI Automation** — IsolationForest anomaly detection scores every transaction automatically
- ✅ **Use of Data** — Behavioral signals (velocity, depletion rate, timing) scored in real time
- ✅ **Squad APIs** — Core payment infrastructure, webhooks, virtual accounts, transfers
- ✅ **Financial Innovation** — Public cryptographic transparency layer for Nigerian fundraising

---

## Team

- Adeniran Abdurrahman, DX
- Adeshola Jibola
- Emenike Prosper-Beales
- Adetunmbi Favour, Dray

---

## License
Private — All rights reserved