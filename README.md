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
| **Voice Intelligence Interface** | *(Optional)* Query suspicious activity conversationally |

---

## How It Works

---

## How It Works

```
Contributor donates via Squad API
        ↓
Transaction logged + cryptographically signed by TRACE server
        ↓
IsolationForest model scores transaction (0–100)
        ↓
AI Explanation Engine generates plain-language insight
        ↓
Trust badge (Clean / Watch / Suspicious) appears on public dashboard
        ↓
Contributor verifies independently via shareable link
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TanStack Start (TypeScript), Tailwind CSS |
| Backend | Node.js / Express |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Squad API |
| Anomaly Detection | IsolationForest (Python, scikit-learn) |
| AI Explanations | OpenAI API |
| Trust Layer | HMAC-SHA256 cryptographic signing (Node.js `crypto`) |

---

## Project Structure

```
TRACE/
│
├── frontend/                  # React + TanStack Start
│   ├── src/
│   │   ├── components/        # Shared UI components
│   │   ├── routes/            # Page routes
│   │   ├── lib/               # Campaign data, utilities
│   │   ├── hooks/             # Custom React hooks
│   │   └── integrations/      # Supabase client
│   ├── public/
│   │   └── assets/img/        # Logo and favicon
│   └── supabase/              # Supabase config
│
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── campaigns.js
│   │   ├── transactions.js
│   │   ├── webhooks.js
│   │   ├── verify.js
│   │   └── users.js
│   ├── services/
│   │   ├── squadService.js
│   │   ├── signingService.js
│   │   ├── anomalyService.js
│   │   ├── explanationService.js
│   │   └── mailService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── rateLimit.js
│   └── config/
│       ├── supabase.js
│       └── env.js
│
├── ai/
│   ├── api.py
│   ├── model/
│   │   ├── train.py
│   │   ├── predict.py
│   │   ├── features.py
│   │   └── trace_model.pkl
│   └── data/
│       └── synthetic_transactions.csv
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── trust-layer.md
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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:8080`

### Frontend Environment Variables

Create a `.env` file inside `frontend/`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Backend *(in progress)*

```bash
cd backend
npm install
node server.js
```

### AI Layer *(in progress)*

```bash
cd ai
pip install -r requirements.txt
uvicorn api:app --reload
```

### Backend Environment Variables

```env
SQUAD_SECRET_KEY=your_squad_secret
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
SIGNING_SECRET=your_long_random_signing_secret
```

---

## The Cryptographic Trust Layer

Every transaction on TRACE is signed at the moment it occurs using HMAC-SHA256. The signing key lives only on the TRACE server — organizations cannot access or forge it.

If anyone alters a transaction record after the fact, the signature breaks. TRACE detects it immediately and flags the record.

No blockchain required. Tamper-evident by design.

---

## Build Status

- [x] Frontend — complete
- [ ] Backend — in progress
- [ ] AI layer — in progress
- [ ] Payment integration (Squad) — pending
- [ ] Cryptographic signing — pending
- [ ] Deployment — pending

---

## Hackathon Context

- **Event:** Squad Hackathon 3.0
- **Theme:** Smart Systems: The Intelligent Economy
- **Challenge:** 01 — Proof of Life
- **Domain:** Financial Services — transaction trust scoring

### Four Pillars Addressed

- ✅ **AI Automation** — Automated anomaly detection and fraud explanation pipeline
- ✅ **Use of Data** — Behavioral transaction signals scored in real time
- ✅ **Squad APIs** — Core payment and contribution infrastructure
- ✅ **Financial Innovation** — Public financial transparency layer for Nigerian fundraising

---

## Team

- Adeniran Abdurrahman, DX
- Adeshola Jibola
- Emenike Prosper-Beales
- Adetunmbi Favour, Dray

---

## License
Private — All rights reserved