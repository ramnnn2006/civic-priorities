# CivicPriorities — final build specification

Decision, 2026-09-11: **proceed with PS1, conditionally on the build gates below.** The distinguishing demonstration is a development project changing priority, or becoming unrankable, when its evidence or policy changes. This is a council design stress test, **not implemented or tested model quality, deployment, fairness, impact, or production readiness**. Nothing was built or installed during validation.

This specification supersedes candidate-spec.md for PS1 implementation and the earlier ticket-routing draft. [Council evidence and arithmetic](council/README.md) records six independent advisor calls and six corrected blind reviews. Domain Specialist ranked first (2.00), followed by Assumption Ripper (2.67). Rankings judge arguments, not truth or predicted hackathon scores.

## Scope and evidence

Preserve the recovered official PS: multilingual voice/text/messaging development requests; aggregation; demographic, infrastructure-index and investment-plan joins; demand hotspots; development-project recommendations to policymakers; a scalable Digital Public Good design. Realistic sample inputs are permitted, so the demo can use explicit fictional planning data. [Official rules](https://hack2skill.com/event/codeforcommunities2), fetched evidence: [rules-dynamic.md](research/sources/rules-dynamic.md).

Use two Indian state fixtures (IN-TN/Tamil and IN-UP/Hindi) and one Brazilian fixture (BR-PE/Portuguese). Their planning subregions and values are fictional, carry a demo code system, and never masquerade as government identifiers or measured conditions. Three categories: drinking-water access, primary-road access and public-lighting coverage. Each uses its own defined denominator and project template.

Published CPGRAMS totals are context only: they are not request narratives or infrastructure inputs. Recife complaint rows were not downloaded. No real demographic/infrastructure/investment join has been verified. [Research evidence](research/ps1-citizen-feedback.md). JanMitra already describes voice, categorization, routing and hotspots; prioritization with evidence gates and sensitivity is a proposed distinction, not proven novelty. [Fetched prior art](https://github.com/theabhishek4u/JanMitra-AI), [snapshot](research/sources/prior-civic.md).

## Required end-to-end flow

1. Start an isolated synthetic demo session; select state/country, language and a 90-day reporting window. Seed confirmed requests so aggregation is visible.
2. Submit text, a 15–30-second voice recording, or a consented/synthetic messaging-export JSON file. Messaging is a working import path, not live WhatsApp integration. Preserve provenance; show editable original transcript and explicit provider errors.
3. Gemini extracts an allowed category, need and source spans. A selected region must be confirmed by the user; ambiguous location requires clarification. Confirm the reviewed draft before counting it.
4. Cluster by confirmed region, category and reporting window. Show counts, requests per 1,000 residents, infrastructure gap, collection coverage and unrepresented areas. This hotspot table must not equate sparse reporting with low need.
5. Join demographic, infrastructure and investment snapshots. Generate projects from versioned templates; show scores, evidence, funding conflicts, budget exclusions and blocked candidates.
6. Gemini drafts a bounded qualitative rationale. The server renders all quantities from computed values. Reviewer changes demand weight or removes an evidence source, observes reranking/abstention, then saves a recommendation and audit snapshot.
7. Switch to Brazil and execute the same contracts, endpoints and UI with Portuguese taxonomy, local identifiers, BRL and a Brazilian policy fixture. Demonstrate adapter-contract portability; no all-BRICS deployment claim.

## Canonical contracts

Use TypeScript/Zod at API and adapter boundaries. Every record includes `id`, `version`, `country`, `regionId`, `codeSystem`, `boundaryVersion`, `referencePeriod`, `observedAt`, `sourceId`, `sourceUrl|null`, `sourceMode: live|snapshot|synthetic|user`, `license|null`, and `missingReason|null`. Numeric fields require explicit units. Synthetic records use null source URLs and link to their authored fixture manifest; reference periods are never invented for real evidence.

| Record | Required domain fields and constraints |
|---|---|
| Request | `sessionId`, `channel:text|voice|message_import`, `externalRecordId?`, `originalText`, `transcriptRevision`, `inputLocale`, `consent`, `categoryCode`, `taxonomyVersion`, `jurisdictionConfirmed`, `status:draft|confirmed|excluded`, `duplicateGroupId?`, `duplicateStatus:clear|pending|merged`, `spans[]` |
| Span | `start`, `end`, `quote`, `field`; zero-based Unicode code-point offsets into the exact submitted transcript revision; validate with `Array.from(transcript).slice(start,end).join('')===quote`, not JavaScript UTF-16 string slicing |
| RegionDemographics | `population` positive integer, `populationDefinition`, demographic reference date; no identity-based priority multipliers |
| InfrastructureMetric | `categoryCode`, `definitionId`, `served`, `eligible`, `unit`, `targetCoverage`; `eligible>0`, `0<=served<=eligible`, `0<targetCoverage<=1` |
| InvestmentPlan | `planId`, `categoryCode`, `projectFootprintId`, `fiscalPeriod`, `currency`, `committedMinor`, `status:proposed|funded|completed|unknown`; explicit dataset completeness/known-empty declaration |
| ProjectCandidate | `templateId`, `categoryCode`, `projectFootprintId`, `scopeLabel`, `costMinor`, `currency`, `evidenceIds[]`, `eligibility`, `blockReasons[]`, `score|null`, `scoreComponents`, `policyVersion` |
| PlanningRun | `sessionId`, `revision`, input record IDs/versions, adapter/taxonomy/policy/model/prompt versions, window, weights, sorted candidates, evidence hashes, `reviewStatus:draft|reviewed|rejected`, reviewer note and timestamp |

`CivicPlanningAdapter` exposes `loadRegions()`, `loadDemographics(regionIds, period)`, `loadInfrastructure(regionIds, categories, period)`, `loadInvestmentPlans(regionIds, fiscalPeriod)`, and `normalizeMessages(records)`. Return canonical records plus validation errors, never quietly coerce unknown units or IDs. `CountryConfig` selects adapter, locales, speech model/region, translation model, taxonomy, currency, policy and templates. State configs override administrative vocabulary, metrics and taxonomy mappings through data, not frontend branches.

Join on `(country, codeSystem, regionId, boundaryVersion, categoryCode where applicable)` with policy-approved temporal compatibility. For this demo: population within 24 months and infrastructure within 12 months of window end; investment plans cover the selected fiscal period. These age limits are disclosed policy assumptions. Never join future-dated observations. Aggregate investment rows by footprint before joining clusters; assert unique demographic/metric keys to prevent count multiplication. Boundary conversion requires an explicit validated crosswalk; absent crosswalk means blocked.

## Deterministic scoring and funding

For one comparable category and reporting window:

```text
U = confirmed request units after duplicate adjudication
P = matched resident population, P > 0
R = 1000 * U / P                         # requests per 1,000 residents
D = min(1, R / T_category)               # T_category > 0; demo default 10
coverage = served / eligible
G = max(0, (targetCoverage - coverage) / targetCoverage)
S = 100 * (w * D + (1 - w) * G)          # default w = 0.5; 0 <= w <= 1
```

All thresholds and weights are versioned demo policy assumptions, never judging weights or empirically calibrated welfare measures. Show U, P, R, threshold, saturation, G and both weighted contributions. Demand saturation prevents huge submission volumes from increasing D without bound. Coverage of intake channels is a gate/caveat; it adds no score bonus. Infrastructure coverage has a category-specific definition; unlike measurement definitions are not comparable.

U counts requests, **not verified unique citizens**. Idempotent reimports never increment U. Exact duplicate records merge by import ID/content and confirmed metadata; probable duplicates require adjudication. Do not merge different residents simply because their wording is similar. A pending duplicate blocks the affected cluster's final rank. Anonymous identity limitations remain visible: this is not a vote or representative survey. A missing collection-coverage declaration blocks ranking; known uneven coverage allows only an explicitly qualified exploratory rank and requires reviewer acknowledgement.

Rank only eligible candidates within a common country/state/policy/category comparison group, containing comparable local subregions. All members must share the infrastructure definition, units, reporting window and category threshold; each project's demand and gap come from its own matched subregion. Cross-category or cross-state overall ordering is disabled unless metric definitions and policy thresholds are explicitly harmonized; national overview can show separate groups. Tie-break by stable project ID, displaying the tie. Store full precision; round display scores to two decimals.

Eligibility requires valid population/metric/joins, declared collection coverage, resolved duplicate status, known investment inventory, a positive integer `costMinor`, currency and budget envelope. Missing evidence means `BLOCKED`, not zero. A funded/completed equivalent footprint is `ALREADY_FUNDED`. Partial or ambiguous overlap is `BLOCKED_OVERLAP` pending review; unknown plans are not empty plans. Only confirmed no-overlap candidates proceed. Costs and budget use integer minor currency units; never sum INR and BRL.

Offer an explicitly **greedy draft shortlist**, not optimal allocation: sort eligible candidates by S, then take each candidate if its cost fits the remaining local envelope and it does not conflict with a selected footprint. Otherwise mark `BUDGET_EXCLUDED` or `CONFLICT_EXCLUDED`; preserve its underlying priority score. Saving creates a reviewed recommendation, never a government allocation or reservation.

Reproducible fixture example, same category/policy, target coverage 1: A has U=30, P=10,000, coverage=.2 → D=.3, G=.8, S=55. B has U=60, P=10,000, coverage=.7 → D=.6, G=.3, S=45. At w=.8, A=40 and B=54: order reverses. Each costs 6,000,000 minor INR units against a 10,000,000 envelope, so only the first fits. Removing B's investment inventory blocks B regardless of weight. Fixtures must contain enough actual seeded records to reproduce these U values; never attach arbitrary counts to unrelated rows.

## AI, API and operational boundaries

Retain React/Vite/TypeScript, Node/Express, Zod, one proposed Cloud Run container and Firestore session persistence. Gemini uses the Developer API documented in fetched sources; Vertex parity is not assumed. Pin and smoke-test an available model during implementation. STT V2 `chirp_2` and Translation NMT use the fetched Hindi/Tamil/Portuguese matrix and verified project entitlements. Documentation availability is not tested access. [Google validation and source links](research/google-ai-validation.md).

Gemini receives untrusted request text as data, allowed taxonomy/region choices and a bounded output schema; no write tools. Validate spans, IDs, enums and transcript revision. Editing transcript text invalidates prior spans and requires reanalysis before confirmation. Reject invalid output with at most one retry within a 20-second overall application deadline; then show failure/clarification. Preserve text when voice fails. Do not claim the required voice path passed if only typed input worked.

Rationale output: `{summary, reasons:[{claimCode, evidenceIds, explanation}], caveats}`. Allow only supplied claim codes and evidence IDs; prohibit generated quantities and unsupported outcome claims. Render numbers and labels through deterministic templates, and fall back to those templates when validation fails. ID validity alone does not prove semantic entailment: evaluate qualitative explanations against evidence separately.

All endpoints under `/api/v1`; server derives session from an opaque session token and loads country config itself. Client cannot override source modes, policy versions or record ownership.

| Endpoint | Contract |
|---|---|
| `GET /config` | Supported state/country capabilities, taxonomy, policy versions and limitations |
| `POST /intake/analyze` | Text/audio reference + locale/config → draft, spans, clarification, execution status |
| `POST /intake/import` | Max 1 MB JSON, max 100 messages, explicit schema/provenance → drafts and per-row errors |
| `POST /requests/confirm` | Draft ID/revision, corrections, region confirmation, idempotency key → confirmed request |
| `GET /clusters` | Session/config/window → aggregate counts, denominator and coverage status |
| `POST /plans/compute` | Window, config version, w, budget envelope → immutable versioned run and eligibility reasons |
| `POST /plans/:id/explain` | Existing run ID + locale → validated explanation or explicit fallback |
| `POST /plans/:id/review` | Expected revision, decision, note and idempotency key → saved review; stale revision returns 409 |
| `GET /plans/:id` | Owned run, evidence and exportable calculation snapshot |

Reject unsupported config (422), unauthorized session access (403), invalid inputs (400/422) and provider throttling (429/503). Cap text at 5,000 code points and audio at 30 seconds/5 MB application limits, subject to supported encoding verification. Server secrets only; no credentials in Vite. Anonymous judges can review only their isolated synthetic runs. Real operator authentication remains a future deployment requirement; no public production admin writes. Default delete uploaded audio after transcription and expire demo sessions after 24 hours; verify cleanup during implementation.

## DPG and national-scale design

Publish versioned JSON schemas, OpenAPI, country-adapter examples, calculation specification, fixture provenance and export format. Proposed license: Apache-2.0 for original code and CC0 for wholly authored fixtures, subject to ownership/third-party checks; do not assert DPG certification. Support portable exports and a provider interface around Google integrations. Publish a contribution guide, accessibility checklist and retention policy. Do not redistribute uncertain-license source datasets as fixtures.

Prototype aggregates are small and synchronous. Expansion path: idempotent ingestion jobs partitioned by country/state/region; immutable evidence snapshots; incremental regional aggregates; paginated national summaries over aggregates; recomputation by snapshot/policy version. Keep citizen text out of national summary exports. Declare source outages/lag independently per region. No load tests, national integration or throughput capacity has been demonstrated; Firestore and queue/index/cost decisions require measurement before scale claims.

## Design, build gates and demo

Use the split hero and Magic UI Bento Grid from [design.md](design.md), with CTA “Try a development request” and an actual planning-result preview. Keep evidence and blocked states visible in semantic DOM. Blur Fade is optional; globe/Skiper/3D stay off the critical path. Registry URLs were verified, but compatibility, licenses, contrast and performance remain build checks. Keyboard access, 360px layout, readable selected scripts and reduced-motion immediate rendering are mandatory.

Build in this order: (1) provider credentials plus minimal deployed shell; (2) contracts, realistic fixtures, score/abstention/shortlist; (3) text, voice, messaging import and Gemini; (4) evidence UI/review and second-state/Brazil adapters; (5) checks and submission rehearsal. Allocate approximately 15/30/25/20/10 percent of available effort. The actual build duration is unknown: the advisor's eight-day estimate is not a commitment. Two to four people can divide backend/AI, UI, adapters/evaluation and delivery; solo must freeze the three configurations/categories and omit decorative work. Do not remove core PS features to make a misleadingly complete demo.

Acceptance targets, all **unexecuted**:

- Exact fixture arithmetic above; duplicate imports do not change counts; input row order does not change results; missing/incompatible joins abstain; investment joins do not multiply U; shortlist never exceeds budget.
- Prepare 20 manually labelled utterances across Hindi, Tamil and Portuguese, including ambiguous places, code switching and instruction-like text. Target at least 16/20 correct categories, 100% valid retained spans, and no unsupported auto-confirmed jurisdictions. Record every result; this tiny set cannot establish nationwide quality.
- At least one successful authenticated live Gemini extraction and grounded rationale; one real short voice transcription per enabled demo language, plus typed fallback; actual messaging-file import succeeds. Inject schema errors, timeout/429 and missing evidence with visible honest results.
- Two Indian configs and Brazil run unchanged endpoints; tests reject cross-session/country record access, stale review revisions and unsupported metric definitions. Save/reload preserves calculation/config/model provenance.
- Clean-browser deployed URL, keyboard/reduced-motion/mobile check, and a timed 3–5-minute recording. LCP ≤2.5s and CLS <.1 are design targets until measured.

Four-minute sequence: 0:00–0:45 voice/text and confirmation; 0:45–1:25 imported-message provenance, clusters and joins; 1:25–2:15 project ranking/rationale; 2:15–3:05 weight reversal and missing-source block; 3:05–3:40 Brazil contract switch; 3:40–4:00 saved review and provenance. Keep existing results clearly labelled as saved if a provider fails; the failed run does not count as live AI validation.

## Judging fit and council reconciliation

| Official weight | Evidence to demonstrate | Principal remaining weakness |
|---|---|---|
| AI/Technical Execution 25% | Live multilingual extraction, exact spans, grounded rationale, failure handling | No API execution or language quality measured yet |
| Deployability & Scalability 20% | One live link, isolated persistence, adapters, reproducible calculations | National throughput and operational data integration untested |
| Depth & Reach Across India 20% | Two substantively different state/language/metric configurations | Tiny fixtures do not establish India-wide representativeness |
| Problem-Solution Fit 20% | Every intake channel, joins, hotspots, constrained project recommendation | Messaging import is a limited adapter, no live channel connection |
| Impact Potential 15% | Auditable tradeoffs, missing-data handling and reviewer decisions | No measured spending efficiency or citizen outcomes |

These are planning interpretations of the official weights, not official subweights or predicted points. Reject the advisor's 82/100 target and invented “full credit” rules.

Changes from candidate: specified normalized demand/category thresholds and exact gap arithmetic; added join-cardinality checks and temporal gates; separated rank from greedy budget shortlist; defined request counting without claiming citizen identity; made DPG licensing/export/privacy and national aggregation concrete; added precise schemas/endpoints and acceptance fixtures.

Retained: full development-planning PS1 scope, realistic labelled fixtures, human review, Google extraction/explanation boundary, Developer API choice, two Indian states plus Brazil, messaging import, single-container stack and DOM-first hero. These preserve the core demonstrable flow while limiting operational dependencies.

The council split on request units versus unique citizens, coverage-confidence weighting, portfolio expansion and a third BRICS country. Adopt the top-ranked domain argument: bounded normalized demand plus comparable infrastructure gap. Reject coverage bonuses, unsupported requester-identity assumptions, multi-factor uncalibrated scores and unsolicited third-country scope. Retain the lower-ranked Contrarian's exact failure gates and Executor's shipping order. Reviewers also wrongly treated future authenticated-call gates as incompatible with planning-only work: such tests are requirements for the build, not claims already satisfied.

No evidence currently forces a PS pivot because official rules permit realistic data. Fundamental limits remain: the ranking cannot justify real spending without validated local inputs/coverage/policy; missing live Google execution or a complete 3–5-minute core flow would fail the submission gate. Resolve these before visual polish. No claims of optimized allocation, measured fairness or government adoption.

Required submission: live deployed link; public/access-granted GitHub repo with licenses and setup; 3–5-minute video; 10–12-slide deck; 2–3-line description. Suggested deck: problem, full PS mapping, user flow, data/provenance, Google AI, calculation, abstention/sensitivity, architecture/DPG, India/Brazil, evaluation, limits/impact, demo links/next steps.
