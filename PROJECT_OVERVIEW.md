# CivicPriorities: Complete Project Guide and Architecture Overview

## 1. What CivicPriorities Does and Why It Exists

CivicPriorities is an open, evidence-gated decision support system for municipal capital allocation. Most public works allocations suffer from one of two failure modes:
1. Subjective negotiations where well-connected neighborhoods win funds while neglected wards wait indefinitely.
2. Black-box algorithmic ranking tools that treat missing survey paperwork as a zero score, silently penalizing the poorest communities.

CivicPriorities replaces guesswork with transparent rules:
- Verified community submissions are combined with physical infrastructure gap measurements.
- Scoring formulas are open, deterministic, and published.
- If baseline survey evidence is missing for a candidate project, the system pauses the ranking for that project instead of giving it a zero score.
- Every planning run is locked with an SHA-256 evidence hash, and endorsements require certified reviewer credentials.

---

## 2. Page Navigation and Sitemap

The application provides a clean separation between public exploration and operational planning:

| URL Path | Name | Target Audience | Purpose |
|---|---|---|---|
| `/` | Landing Page | Public citizens and stakeholders | Explains core methodology, presents key statistics from 3 pilot cities, and offers an interactive calculation showcase with live sliders. |
| `/workbench` | Planning Workbench | Municipal planners, auditors, and residents | Operational workbench for submitting requests, testing sensitivity sliders, inspecting clusters, computing candidate shortlists, and signing official reviews. |
| `/privacy` | Privacy Policy | All users | Discloses data collection rules, voice processing boundaries, and lack of third-party ad trackers. |
| `/terms` | Methodology & Rules | Planners and auditors | Details the evidence-gating rules, budget constraints, and mathematical definitions. |
| `/thank-you` | Submission Confirmed | Citizens submitting requests | Confirms request intake into the 90-day municipal planning ledger with regional details. |
| `*` | 404 Not Found | All users | Clean recovery page with one-click return to the home page or workbench. |

### Workbench Workflow Steps
When working on `/workbench`, a sticky navigation bar guides the user across the 5 stages of planning:
1. **Intake Requests (`#workspace`)**: Enter requests via text, voice, or batch JSON import.
2. **Evidence & Clusters (`#clusters`)**: Inspect neighborhood coverage metrics and active cycle status.
3. **Policy Lens (`#policy-section`)**: Balance resident demand against physical infrastructure deficit.
4. **Ranked Candidates (`#ranking-section`)**: Inspect priority scores, eligibility status, and budget envelope fit.
5. **Formal Sign-off (`#review-section`)**: Record signed review decisions with SHA-256 evidence verification.

---

## 3. The Evidence-Gated Prioritization Math

### The Scoring Equation
Candidate projects within a given infrastructure category are scored using a normalized composite formula:

```text
Priority Score S = 100 * (w * D + (1 - w) * G)
```

Where:
- `w` is the policy demand weight (default 0.50 to 0.55), chosen through open policy discussion.
- `D` is the normalized demand signal, computed from confirmed citizen requests per 1,000 residents:
  `D = Rate / MaxRateInCategory`
- `G` is the verified infrastructure deficit, measured as the gap between current coverage and target coverage:
  `G = TargetCoverage - CurrentCoverage`

### Strict Category Scoping
Candidates are only compared against projects within the same service category (drinking water, primary roads, or public lighting). A drinking water pipe repair is never scored against a streetlight installation, preventing skewed comparisons across differing cost baselines.

### The Missing Data Evidence Gate
When baseline investment paperwork or survey records cannot be verified:
- The candidate project is marked as `BLOCKED` (or `PAUSED`).
- The system refuses to produce a speculative score.
- The project is displayed with a visible warning so field officers know exactly which surveys must be completed.

---

## 4. Multi-City Pilot Fixtures

CivicPriorities ships with 3 complete municipal pilot datasets:

1. **Tamil Nadu, India (`IN-TN`)**
   - Language: Tamil (`ta-IN`)
   - Currency: Indian Rupee (INR)
   - Candidates: Kovilpatti North (drinking water), Sankarankovil East (drinking water), Tirunelveli West (public lighting)
   - Baseline Envelope: 10,000,000 INR

2. **Uttar Pradesh, India (`IN-UP`)**
   - Language: Hindi (`hi-IN`)
   - Currency: Indian Rupee (INR)
   - Candidates: Mahoba North (drinking water), Chitrakoot East (flood-resilient roads), Hamirpur South (safe-route lighting)
   - Baseline Envelope: 10,500,000 INR

3. **Pernambuco, Brazil (`BR-PE`)**
   - Language: Portuguese (`pt-BR`)
   - Currency: Brazilian Real (BRL)
   - Candidates: Recife Norte (drinking water), Olinda Leste (primary road paving), Jaboatao Sul (solar public lighting)
   - Baseline Envelope: 1,000,000 BRL

---

## 5. Live AI Rationale and Audit Engine

CivicPriorities integrates live AI planning audits using the Groq API:
- Primary Model: `qwen/qwen3.8-27b` (sub-second JSON generation)
- Automatic Fallback: `openai/gpt-oss-120b`
- Offline / Deterministic Engine: Built-in deterministic auditor that runs whenever an API key is absent or offline.

### What the AI Auditor Checks
When you click "Explain Rationale" or "Audit with AI", the engine reviews:
1. Why the top candidate ranked first, referencing specific request counts and rates per 1,000 residents.
2. The infrastructure gap percentage and whether the project fits within the local fiscal envelope.
3. Civic caveats, such as digital submission disparities and the requirement for human field verification before capital allocation.

### In-Memory Server Caching
To avoid redundant network trips and API latency:
- Rationales are cached in memory using a composite key: `configId:category:evidenceHash:mode`.
- Repeated requests for the same candidate set return in under 10 milliseconds with an `X-Cache: HIT` response header.

---

## 6. Roles and Access Control

The application implements a lightweight role model:

1. **Municipal Planner (`planner`)**
   - Seed Persona: Maya Sundaram (Tamil Nadu Urban Development Board)
   - Permissions: Run planning calculations, adjust policy weights, confirm intake drafts, and sign formal reviews.

2. **Civic Auditor (`auditor`)**
   - Seed Persona: Rajesh Sharma (Independent Civic Planning Observatory)
   - Permissions: Verify evidence hashes, export audit memorandums, review policy sensitivity, and record formal audit findings.

3. **Public Citizen (`citizen`)**
   - Seed Persona: Priya Anandan (Kovilpatti Ward 4 Residents Forum)
   - Permissions: Submit local neighborhood requests, inspect open rankings, review scoring formulas, and test hypothetical policy balances.

Visitors start without a pre-selected role and can switch personas or sign in via email and password anytime from the top bar.

---

## 7. Performance and Architecture Benchmarks

The codebase is optimized for real-world speed, low memory overhead, and resilience:

### Frontend Optimization
- **Route Code Splitting**: Page components (`LandingPage`, `PrivacyPage`, `TermsPage`, `ThankYouPage`, `NotFoundPage`) are lazy-loaded via `React.lazy` and `Suspense`.
- **Vendor Chunk Splitting**: Rollup separates `react`/`react-dom`, `lucide-react`, and `thinking-orbs` into independent cacheable vendor bundles.
- **Bundle Reductions**:
  - Landing page chunk: 13.5 kB (3.8 kB gzip).
  - Main app shell: 66.0 kB (19.1 kB gzip), down from 340 kB uncompressed.
  - Unused libraries (like framer-motion) removed.

### Backend and Network Optimization
- **HTTP Compression**: Express uses gzip compression with a 1 kB threshold, reducing API JSON payloads by up to 75%.
- **Cache-Control Headers**:
  - Static hashed assets: `public, max-age=31536000, immutable`.
  - Config endpoints (`/api/v1/config`): `public, max-age=3600, stale-while-revalidate=86400`.
  - HTML documents: `public, max-age=0, must-revalidate`.
- **Server Rationale Cache**:
  - Uncached Groq API rationale call: ~1,300 ms (`X-Cache: MISS`).
  - Cached Groq rationale call: ~8 ms (`X-Cache: HIT`, 99% speedup).

---

## 8. Running and Testing Locally

### Start Development Server
```bash
npm run dev
```
Opens Vite on `http://localhost:5173` with automatic API proxy to port 4173.

### Start Backend Server
```bash
npm start
```
Starts Express API server on `http://localhost:4173`.

### Run Test Suite
```bash
npm test
```
Executes all 11 unit and integration test suites via Vitest.

### Run Production Build
```bash
npm run build
```
Typechecks TypeScript, compiles the Vite client bundle, and bundles the serverless API target with esbuild.
