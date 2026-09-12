# CivicPriorities progress

Last updated: 2026-09-12, Asia/Kolkata

## Current status

- Core React/Vite planning workbench implemented with Agentic Civic Auditor Co-Pilot.
- Express API implemented with intake, confirmation, clusters, planning, explanation and review routes.
- Dual-runtime deployment ready: standalone Express / Docker container and Vercel Serverless Functions (`api/index.ts` + `vercel.json`).
- Better-Auth compatible authentication engine with token sessions, role-based authorization, and instant persona switching.
- Persona Switcher & Identity Bar supporting Municipal Planners, Civic Auditors, and Citizen Contributors.
- Server-side Google Gemini 2.5 Flash adapter integrated for live AI rationale generation, with resilient local deterministic fallback when no API key is supplied.
- Interactive Priority Rationale & Evidence Inspector modal with cryptographic SHA-256 evidence hashing and formula derivation trace.
- Formal human-in-the-loop Municipal Review & Endorsement modal with revision conflict guards and certified reviewer attribution.
- Citizen advisory gate informing community members that formal statutory endorsement requires planner or auditor clearance.
- Live Cluster Intelligence Footprint reporting 90-day intake windows, population denominators, and digital collection equity disclosures.
- Build, typecheck, and unit/route tests passed (11 tests covering engine invariants, API security, explainability, and auth).

## Completed product behavior

- India/Tamil Nadu, India/Uttar Pradesh and Brazil/Pernambuco synthetic configurations.
- Better-Auth endpoints (`/api/auth/demo-users`, `/api/auth/sign-in/email`, `/api/auth/sign-up/email`, `/api/auth/get-session`, `/api/auth/sign-out`).
- Text/voice/JSON-import request intake with author tagging; confirm-before-counting flow.
- Deterministic category-scoped priority calculation, sensitivity control, funding constraint and missing-investment block state.
- Evidence spans are Unicode-safe; API validates them before confirmation.
- API-backed mode when served from Express or Vercel Serverless Function, explicit offline fallback when static-only.
- Agentic Co-Pilot with automated sensitivity simulation ($w=0.8$ demand vs $w=0.2$ gap priority reversal alert), headroom tracking, and one-click Audit Memorandum generator.
- Floating toast notification system for instant feedback on persona switches, draft confirmations, and review sign-offs.

## Verified test suite

- `npm run build`: Typechecks client, server, and Vercel API entrypoints, then bundles production Vite assets.
- `npm test`: 10 automated tests covering:
  1. Priority reversal under policy sensitivity shift (w=0.5 vs w=0.8)
  2. Missing investment inventory blocking gate (non-zero DPG rule)
  3. Unicode-safe evidence span slicing
  4. Cross-category ranking rejection
  5. Server-owned draft intake and forged confirmation rejection
  6. Category-scoped planning and stale-review revision conflict protection (HTTP 409)
  7. Staged message imports with per-row compatibility filtering
  8. Health check with AI provider mode reporting
  9. Cluster footprint endpoint with declared coverage metadata
  10. Structured plan explanation rationale with SHA-256 evidence hashing
  11. Strict JSON 404 handler for unknown API routes

## Deployment commands

### Local Server
```bash
npm install
npm run build
npm test
npm run server
```

### Vercel Serverless Deployment
```bash
vercel --prod
```
The application runs both the Vite SPA and the Express Serverless Function via Vercel rewrites.
