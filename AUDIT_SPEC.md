# CivicPriorities implementation audit

Audit basis: source inspection of `src/`, `server/`, `README.md`, `Dockerfile`, and `planning/final-spec.md` on 2026-09-12. This audit did not run the application, tests, Gemini, or deployment commands; statements below are limited to what the checked-in source proves.

## Satisfied, or substantially satisfied

- **Prototype stack and synthetic scope:** React/Vite/TypeScript client, Node/Express server, Zod request validation, and a Dockerfile are present. The UI and README consistently label the regional values as synthetic fixtures and state that the outcome is not a government allocation.
- **Three demonstrable configurations:** Tamil Nadu/Tamil (`IN-TN`), Uttar Pradesh/Hindi (`IN-UP`), and Pernambuco/Portuguese (`BR-PE`) are defined in `src/data.ts`, with locale, currency, local taxonomy labels, categories, regional fixture values, and project labels.
- **Core deterministic formula:** `src/engine.ts` computes request units, requests per 1,000 residents, capped demand (`min(1, rate/10)`), infrastructure gap, and `S = 100 * (wD + (1-w)G)`. It rejects ranking a mixed-category group.
- **Required fixture reversal and budget behavior:** the TN water fixtures encode the specified 30/10,000/.2 and 60/10,000/.7 example. `src/engine.test.ts` asserts the 55/45 result at `w=.5`, the 54/40 reversal at `w=.8`, missing-plan blocking, Unicode-safe local spans, and mixed-category rejection. The greedy sequential shortlist marks an otherwise eligible project `BUDGET_EXCLUDED` when it does not fit the remaining envelope.
- **Text intake and confirmation path:** client and server cap text at 5,000 characters/code points respectively; the server validates a Zod-shaped draft and checks spans using `Array.from(...)`, which is Unicode-code-point safe. The UI requires a user confirmation before text/voice drafts are added to its local request list.
- **Local API surface exists:** `/api/v1/config`, intake analysis, confirmation, clusters, plans computation, explanation, and review routes exist. The client uses the analysis/confirmation routes and, once it has a server response, requests server-side plan computation.
- **Visible evidence failure demo:** the UI can simulate a missing investment inventory and the scoring function returns a null score plus `BLOCKED` status for one candidate. The UI also displays formula components, a draft-shortlist disclaimer, and a client-side snapshot export.
- **Basic delivery scaffolding:** README documents local run/build/test commands and warns that secrets must stay server-side. Docker builds the Vite client and starts the Express server.

## Missing or materially incomplete requirements

### Required end-to-end flow

- There is no explicit synthetic-demo session creation, 90-day window selector, seeded-request provenance, or durable session record. The server trusts a client-supplied UUID and stores drafts only in an in-memory `Map`.
- Voice is browser Web Speech recognition, not a 15–30-second recording uploaded to the server. There is no audio size/duration/encoding validation, STT V2 integration, transcript revision, provider error surface, or audio deletion/24-hour cleanup.
- Message JSON import is entirely client-side and immediately marks records confirmed. It bypasses `/intake/import`, consent, per-row validation/errors, provenance, duplicate handling, reviewed confirmation, and server persistence. No `/api/v1/intake/import` endpoint exists.
- Extraction is deterministic keyword matching. The source explicitly returns `local-fallback` and says no Gemini call was made. No Gemini SDK, model selection, structured schema, retry/deadline, grounding validation, or AI evaluation exists.
- The selected region is preselected by the UI and is not a separately confirmed jurisdiction in the record. Ambiguous locations cannot trigger clarification. Editing a draft transcript does not invalidate spans or require reanalysis.
- The UI does not render cluster/hotspot data from `/clusters`: counts, per-1,000 denominators, collection coverage, and unrepresented-area caveats are absent from the planning workbench.
- Save review is only `setRunSaved(true)` in the client; it does not call the review route, include a reviewer decision/note/idempotency key, or create an audit snapshot. Explanations are also not called or displayed by the client.

### Canonical records, adapters, and evidence

- The TypeScript models are much smaller than the specified canonical contracts. They lack record `version`, `country`, `codeSystem`, `boundaryVersion`, reference/observation periods, source metadata/mode/license/missing reason, units/denominators, collection coverage, investment footprints, policy/prompt/model versions, evidence hashes on a persisted run, and audit-review metadata.
- There is no `CivicPlanningAdapter`, country configuration interface with adapter methods, fixture manifest, versioned templates, or validation-error return path. Countries are hard-coded frontend fixture objects rather than data-driven adapters.
- No demographic, infrastructure, or investment-plan canonical records exist, so the required joins, temporal compatibility limits, boundary crosswalk gate, aggregation-before-join, unique-key assertions, and future-observation rejection cannot occur.
- “Missing investment” is a boolean simulation for the second candidate, not a per-footprint inventory completeness/known-empty check. Funded/completed equivalence, partial overlap (`BLOCKED_OVERLAP`), `ALREADY_FUNDED`, and conflict exclusion are absent.
- The rank does not enforce declared collection coverage, duplicate adjudication, valid evidence IDs, currency/budget validation, shared definitions/units/window/thresholds, or a stable project-ID tie-break. It sorts null scores with a simple comparator and does not expose full-precision calculation provenance.
- Reimports are not idempotent. Client message imports append new generated UUIDs and raise `U`; there is no import ID/content duplicate comparison or pending-duplicate gate.

### API, security, and persistence

- Current routes do not meet the specified contracts: no opaque server-derived session token, ownership enforcement, `403` cross-session protection, 400/422 distinction for all invalid data, `429/503` provider mapping, request idempotency keys, max-100 import endpoint, immutable planning runs, or `GET /plans/:id` exportable snapshot.
- `/plans/:id/review` accepts every `expectedRevision` without comparing it to an existing run, so it cannot return the required `409` stale-revision response. `/plans/:id/explain` returns a fixed local rationale for any ID and does not look up a run or validate supplied evidence.
- Session state and reviews disappear on restart. Firestore persistence, authenticated isolated sessions, real operator authentication, retention policy enforcement, and uploaded-audio cleanup are not implemented.
- There is no OpenAPI document, versioned JSON schemas, portable export format, provider interface, license files, contribution guide, accessibility checklist, or retention-policy artifact required for the DPG handoff.

### Validation and release gates

- No source proves a live Gemini extraction/rationale, live authenticated Google service call, STT transcription, translation, or entitlement. Do not present any AI integration as live.
- No source proves a Cloud Run deployment or public URL. The Dockerfile is deployment scaffolding only; no deployed service configuration, deployment record, or health-check evidence is present.
- Tests cover four engine behaviors only. Missing coverage includes duplicate idempotency/order invariance, join cardinality, missing/incompatible data abstention, shortlist conflict/budget invariants, API authorization and stale review rejection, cross-country data isolation, persistence/reload provenance, imports, provider failures, messaging import, voice, and client workflows.
- No labelled 20-utterance multilingual evaluation, browser/mobile/keyboard/reduced-motion measurement, performance measurement, deployment rehearsal, demo recording, deck, public repository/license setup, or submission description is present.

## Smallest next implementation steps

1. **Make the local flow correct before adding providers.** Replace the lightweight `Draft`/fixture types with the canonical request, provenance, metric, plan, candidate, and planning-run records; add versioned synthetic fixture manifests for TN, UP, and PE. Implement Zod schemas at every API boundary.
2. **Finish server-owned sessions and the required API contracts.** Issue an opaque session token, move drafts/runs/reviews into a persistence interface (an in-memory implementation first, Firestore adapter next), add idempotency and ownership checks, persist immutable runs, validate revisions, and implement `/intake/import` plus `GET /plans/:id`.
3. **Implement correct ingestion and evidence gates.** Send text/voice/message imports through the server; require consent/provenance and human jurisdiction confirmation; validate Unicode spans and transcript revisions; add exact duplicate detection plus pending adjudication; implement 90-day windows, coverage declarations, temporal/boundary checks, and per-footprint investment inventory states.
4. **Build real adapter-backed joins and ranking.** Introduce `CivicPlanningAdapter` for the three configurations, canonical join keys, category definitions/units, investment aggregation, eligibility/block reason taxonomy, stable tie-breaks, and a greedy shortlist with conflict checks. Render clusters, evidence, blocks, and sensitivity from the persisted server run.
5. **Connect the UI to all required server actions.** Use server import, clusters, compute, explain, review, and snapshot endpoints. Stop auto-confirming imported records. Add review decisions/notes, explainable evidence cards, and explicit provider/clarification/error states.
6. **Add Google services only after the boundary is testable.** Implement server-side Gemini structured extraction and rationale with strict validation, one retry/20-second deadline, and deterministic fallback. Add the required recording/STT path and preserve typed fallback. Keep all credentials server-side.
7. **Verify before release.** Expand unit/API/browser tests to the acceptance gates, run multilingual/manual evaluations, measure the deployed URL, and then prepare the demo video, deck, licensing, schemas/OpenAPI, contribution, and retention artifacts.

## Claim boundary for the current state

The checked-in code supports a synthetic, browser-first prototype with deterministic local scoring and a small local Express API. It does **not** prove live Gemini, live speech-to-text, Firestore, Cloud Run deployment, a complete messaging-import server path, production security, data adapters/joins, or the final-spec acceptance gates.
