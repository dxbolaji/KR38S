# TRACE — Transparent Real-time AI Chain Engine

> **AI-powered financial transparency and fraud detection for NGOs, crowdfunding campaigns, and group funds.**

Built for [Squad Hackathon 3.0](https://squadco.com) — Challenge 01: *"Proof of Life"*

---

## The Problem

Millions of naira move through group funds, crowdfunding campaigns, NGOs, and community projects every day — with no way to verify where the money actually goes.

From the VDM NGO scandal to jersey fraud on X, contributors are forced to trust blindly. TRACE fixes that.

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
| Frontend | HTML, Tailwind CSS |
| Backend | Node.js / FastAPI |
| Database | Supabase |
| Payments | Squad API |
| Anomaly Detection | IsolationForest (Python, scikit-learn) |
| AI Explanations | OpenAI API |
| Trust Layer | HMAC-SHA256 cryptographic signing (Node.js `crypto`) |

---

## Project Structure

```
TRACE/
│
├── frontend/
│   ├── landing.html
│   │
│   ├── auth/
│   │   ├── signup.html
│   │   ├── verify.html
│   │   └── login.html
│   │
│   ├── app/
│   │   ├── home.html
│   │   ├── profile.html
│   │   ├── search.html
│   │   └── campaign.html
│   │
│   └── assets/
│       ├── css/
│       │   ├── main.css            # CSS variables, global resets, fonts
│       │   └── animations.css      # keyframes, transitions, loaders
│       ├── js/
│       │   ├── auth.js             # signup, login, email verify, @username
│       │   ├── home.js             # feed, saved campaigns, activity
│       │   ├── profile.js          # contributor history, created campaigns
│       │   ├── search.js           # search/filter campaigns
│       │   ├── campaign.js         # campaign view, donate, trust feed
│       │   └── verify.js           # cryptographic signature check
│       └── img/
│           ├── logo.svg            # owl eye mark
│           ├── logo-full.svg       # owl eye + TRACE wordmark
│           └── favicon.ico
│
├── backend/
│   ├── server.js
│   │
│   ├── routes/
│   │   ├── auth.js                 # signup, login, email verify, username
│   │   ├── campaigns.js            # create, fetch, update campaigns
│   │   ├── transactions.js         # log, fetch, score transactions
│   │   ├── webhooks.js             # Squad payment webhook receiver
│   │   ├── verify.js               # signature verification endpoint
│   │   └── users.js                # profile, @username, contribution history
│   │
│   ├── services/
│   │   ├── squadService.js         # Squad API — payments, webhooks
│   │   ├── signingService.js       # HMAC-SHA256 sign + verify
│   │   ├── anomalyService.js       # calls Python AI model API
│   │   ├── explanationService.js   # OpenAI plain-language output
│   │   └── mailService.js          # email verification sender
│   │
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification
│   │   └── rateLimit.js            # prevent abuse on donation endpoints
│   │
│   └── config/
│       ├── supabase.js             # Supabase client init
│       └── env.js                  # environment variable validation
│
├── ai/
│   ├── api.py                      # FastAPI — exposes /score endpoint
│   │
│   ├── model/
│   │   ├── train.py                # IsolationForest training script
│   │   ├── predict.py              # scoring logic
│   │   ├── features.py             # feature engineering (velocity, deviation etc)
│   │   └── trace_model.pkl         # saved trained model
│   │
│   └── data/
│       └── synthetic_transactions.csv
│
├── docs/
│   ├── architecture.md
│   ├── api.md                      # endpoint reference
│   └── trust-layer.md              # how signing works, explained
│
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- Python 3.10+
- Supabase account
- Squad API credentials

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/TRACE.git
cd TRACE

# Install backend dependencies
cd backend
npm install

# Install AI dependencies
cd ../ai
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Add your Squad API key, Supabase URL, OpenAI key, and SIGNING_SECRET
```

### Environment Variables

```env
SQUAD_SECRET_KEY=your_squad_secret
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
SIGNING_SECRET=your_long_random_signing_secret
```

### Run

```bash
# Start backend
cd backend && node server.js

# Start AI model API
cd ai && uvicorn api:app --reload

# Open frontend
open frontend/index.html
```

---

## The Cryptographic Trust Layer

Every transaction on TRACE is signed at the moment it occurs using HMAC-SHA256. The signing key lives only on the TRACE server — organizations cannot access or forge it.

If anyone alters a transaction record after the fact, the signature breaks. TRACE detects it immediately and flags the record.

No blockchain required. Tamper-evident by design.

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

> Adeniran Abdurrahman,
Adesola Jibola,
Emenike Prosper-Beales,
Adetumbi Favour.

---

## License

MIT