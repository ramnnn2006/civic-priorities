# CivicPriorities

> **Evidence-Gated Civic Planning Engine & Participatory Decision-Support Workbench**
> Built for the Code for Communities Challenge. Transforms multilingual citizen requests into transparent, audit-ready municipal priorities without algorithmic bias or silent zero-score defaults.

---

## Highlights

- **Multilingual Intake & Grounded Extraction:** Native support for Tamil Nadu (`ta-IN`), Uttar Pradesh (`hi-IN`), and Pernambuco (`pt-BR`). Accepts text, Web Speech voice capture, and batch JSON message imports with Unicode-safe quote slicing.
- **Human-in-the-Loop Confirmation:** Incoming requests enter a staged review queue; no citizen request affects a municipal score until explicitly inspected and confirmed.
- **Deterministic Category-Scoped Scoring:** Transparent formula:
  $$S = 100 \times [w \cdot D + (1 - w) \cdot G]$$
  where $D$ is the normalized community demand rate per 1,000 residents and $G$ is the verified infrastructure deficit.
- **DPG Evidence Blocking Rule:** A missing investment plan or demographic denominator strictly **blocks** ranking instead of quietly defaulting to zero—preventing neglected regions from being penalized for absent paperwork.
- **Agentic Civic Auditor Co-Pilot:** Interactive policy sensitivity simulation detecting rank inversions between demand-first ($w=0.8$) and gap-first ($w=0.2$) policies, representation asymmetry detection, and one-click Audit Memorandum export.
- **AI Rationale & Explainability:** Dual-engine architecture featuring a server-side Google Gemini 2.5 Flash adapter for generative rationale generation with seamless fallback to deterministic rule-based explainability when running offline or without credentials.
- **Role-Based Access Control & Better-Auth:** Multi-persona authentication system with instant role switching between Municipal Planners (e.g. Maya Sundaram), Civic Auditors (e.g. Rajesh Sharma), and Citizen Contributors (e.g. Priya Anandan). Endorsements require certified credentials while public citizen commentary is preserved in immutable audit logs.
- **Formal Sign-Off & Audit Trail:** Revision-controlled municipal review flow with SHA-256 evidence hashing preventing concurrency race conditions (`HTTP 409 Conflict`) and cryptographic reviewer attribution.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Local Development
```bash
# Start Vite frontend (port 5173)
npm run dev

# Start full-stack Express server (port 4173)
npm run server
```

### 3. Build & Test
```bash
npm run build
npm test
```

---

## Dual-Runtime Deployment

### Vercel Serverless (Recommended)
This repository is configured out-of-the-box for Vercel with `@vercel/node` Serverless Functions in `api/index.ts` and `vercel.json` rewrites:
```bash
vercel --prod
```
- Frontend SPA served via Vercel Edge Network.
- API endpoints (`/api/v1/*` and `/health`) executed as serverless functions.
- To enable live Google Gemini rationale generation, add `GEMINI_API_KEY` in your Vercel Project Environment Variables.

### Google Cloud Run (Containerized)
A multi-stage production `Dockerfile` runs as a secure non-root `node` user:
```bash
gcloud run deploy civic-priorities \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

---

## API Surface

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | Health check & AI provider status (`gemini-live` or `local-fallback`) |
| `/api/v1/config` | `GET` | Available regional configurations, boundaries, and currencies |
| `/api/v1/intake/analyze` | `POST` | Analyze text/voice input, extract category and Unicode spans |
| `/api/v1/requests/confirm` | `POST` | Confirm a staged draft request into the session ledger |
| `/api/v1/intake/import` | `POST` | Batch message import (max 100 rows, 1 MB) with per-row compatibility check |
| `/api/v1/clusters` | `GET` | Cluster footprint, 90-day intake metrics, and declared coverage |
| `/api/v1/plans/compute` | `POST` | Compute deterministic candidate rankings, greedy shortlist, and evidence hash |
| `/api/v1/plans/:id` | `GET` | Retrieve an immutable planning run by ID |
| `/api/v1/plans/:id/explain` | `GET/POST` | Generate evidence-grounded AI rationale memo with Gemini / deterministic engine |
| `/api/v1/plans/:id/review` | `POST` | Submit human reviewer endorsement or rejection with reviewer identity |
| `/api/auth/demo-users` | `GET` | List seeded demo personas (Planner, Auditor, Citizen) |
| `/api/auth/get-session` | `GET` | Retrieve authenticated user profile and token status |
| `/api/auth/sign-in/email` | `POST` | Authenticate user via email and password |
| `/api/auth/sign-up/email` | `POST` | Register a new civic user with custom role and organization |
| `/api/auth/sign-out` | `POST` | Terminate session and invalidate auth token |

---

## Architectural Principles

1. **Explicit Provider Boundaries:** The demo makes it crystal clear whether extraction was performed by Google Gemini or the deterministic fallback engine.
2. **Strict Concurrency Protection:** Plan revisions prevent concurrent reviewers from overwriting decisions.
3. **Zero Leaked Secrets:** AI keys are kept strictly server-side; never exposed via `VITE_*` browser bundles.
4. **Digital Public Goods (DPG) Alignment:** Transparent open formulas, non-discriminatory fallbacks, keyboard/screen-reader accessibility, and reduced-motion support.

---

## License

MIT License. Open-source prototype for research, demonstration, and participatory civic planning.
