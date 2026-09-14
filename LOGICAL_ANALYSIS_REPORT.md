# CivicPriorities — Logical Analysis Report

**Goal:** Identify flow flaws, missing guard checks, incorrect precedence, and navigation logic errors across the React frontend and backend API.  
**Compiled by:** Step 15 (final step)  
**Method:** Findings were produced by steps 1‑14 and consolidated here. Each finding keeps the owning step, exact file/line, verification status, and severity assigned by the originating analysis. Where a previous step did not assign a severity, the rating below follows the task severity scale (impact on real users in production).

---

## Severity legend

| Severity | Meaning |
|----------|---------|
| **CRITICAL** | Untrusted caller can cause loss of data, money, or access; or the service is unusable for everyone. |
| **HIGH** | Breaks in production for everyone, or exposes something real to people who should not have it. |
| **MEDIUM** | Wrong in a real case, for one class of user or one situation. |
| **LOW** | Cosmetic, hygiene, or only inconveniences the operator/developer. |

---

## Step 1 — package.json / project configuration

No logical-flow or guard-check findings surfaced from the project configuration review. Build scripts and dependency boundaries were confirmed to be wired correctly.

---

## Step 2 — `src/types.ts` domain logic flaws

| ID | File:Line | Finding | Status | Severity | Concrete consequence |
|----|-----------|---------|--------|----------|----------------------|
| T1 | `src/types.ts:10-16` | `RegionFixture` numeric fields (`population`, `coverage`, `targetCoverage`, `seededRequests`, `costMinor`, `budgetMinor`) are plain `number` with no range constraints. | REASONED | MEDIUM | Invalid fixture data (zero population, negative cost, coverage > 1) can be created and propagated into `scoreCandidates`, producing `Infinity`, `NaN`, or nonsensical rankings. |
| T2 | `src/types.ts:37` | `Draft.regionId` is typed as `string` instead of `ConfigId` or a region-id enum, and no foreign-key validation exists. | REASONED | MEDIUM | A draft can reference a non-existent region; the engine filters by `regionId` and silently drops it, making the loss look like zero impact rather than a data error. |
| T3 | `src/types.ts:70` | `CandidateResult.score` is `number \| null`, but the type does not encode what `null` means (blocked vs. missing data). | REASONED | MEDIUM | The engine sorts `null` scores as `-1`, conflating "paused for audit" with "lowest legitimate score" and hiding the real reason a project was blocked. |
| T4 | `src/types.ts:56-61` | `ReviewerMetadata` makes `id`, `name`, `role`, and `organization` all optional. | REASONED | HIGH | The review endpoint can accept an anonymous or forged reviewer identity, so an audit trail entry may not identify the person who signed it. |

---

## Step 3 — `src/data.ts` data flow and validation gaps

| ID | File:Line | Finding | Status | Severity | Concrete consequence |
|----|-----------|---------|--------|----------|----------------------|
| D1 | `src/data.ts:9-37` | `configs` is a static array with no runtime validation of numeric ranges, category membership, or currency consistency. | REASONED | MEDIUM | A corrupt or hand-edited fixture is loaded as truth; the engine and UI have no way to reject impossible values before scoring. |
| D2 | `src/App.tsx:116`, `src/App.tsx:274`, `src/App.tsx:391-394` | The workbench defaults to `apiMode: 'offline'` and falls back to local scoring (`serverCandidates ?? localCandidates`) and local confirmation when the API fails. | VERIFIED | MEDIUM | If the server is unreachable, a user can still "confirm" requests locally and see them affect scores; the server never sees or validates those confirmations, so client and server state diverge silently. |

---

## Step 4 — `src/engine.ts` scoring logic flaws

Probe output verified the exact behavior of the engine with edge-case inputs.

| ID | File:Line | Finding | Status | Severity | Concrete consequence |
|----|-----------|---------|--------|----------|----------------------|
| E1 | `src/engine.ts:8` | `findCategory` silently defaults to `'water'` when no keyword matches: `?? 'water'`. | VERIFIED | MEDIUM | Unrelated text (e.g., "The weather is nice today.") is categorized as water and accepted in a water region, allowing spam or irrelevant requests to enter the draft queue. |
| E2 | `src/engine.ts:6-8` | Category precedence follows `Object.keys(categoryMeta)` order, not semantic priority. | VERIFIED | MEDIUM | A message containing both road and water keywords ("The road has no water supply") is categorized as `water`, while a message with light and road keywords ("Dark street with no lamp on the road") is categorized as `roads`; multi-need requests are miscategorized unpredictably. |
| E3 | `src/engine.ts:13-17` | `makeDraft` fabricates a span from the first character when no keyword matches. | VERIFIED | MEDIUM | For unrelated text the produced span is `{ start: 0, end: 1, quote: "c" }`; downstream confirmation validation can pass on evidence that does not actually match the stated need. |
| E4 | `src/engine.ts:25-27` | `scoreCandidates` only checks that regions share a category; it does not prevent mixing configs, currencies, or jurisdictions. | VERIFIED | MEDIUM | Verified output mixed `UP-MAH-N` (INR, Uttar Pradesh) and `TN-KOV-N` (INR, Tamil Nadu) in one ranking; budget and cost comparisons across jurisdictions are meaningless. |
| E5 | `src/engine.ts:35` | The missing-plan block is hardcoded to the second input region: `region.id === available[1]?.id`. | VERIFIED | MEDIUM | Reversing the input array changed which region was marked `BLOCKED`; the "missing evidence" simulation depends on array order, not on any real data condition. |
| E6 | `src/engine.ts:41` | Blocked candidates are sorted using `(b.score ?? -1) - (a.score ?? -1)`. | VERIFIED | MEDIUM | A `null` score is treated as `-1`, so a blocked project is indistinguishable from a project with a very low legitimate score, and any negative score would sort below it. |
| E7 | `src/engine.ts:32` | `rate = (1000 * requestUnits) / region.population` divides by population without guarding against zero. | VERIFIED | MEDIUM | With `population: 0`, `rate` becomes `Infinity` (serialized as `null` in JSON), yet `demand` is clamped to `1` and the candidate scores `90`, so corrupt data can top the ranking. |
| E8 | `src/engine.ts:34` | `gap = Math.max(0, (targetCoverage - coverage) / targetCoverage)` divides by `targetCoverage` without guarding against zero. | VERIFIED | MEDIUM | With `targetCoverage: 0`, `gap` becomes `Infinity`/`null` and the score becomes invalid, hiding the underlying fixture error. |
| E9 | `src/engine.ts:43-45` | Budget selection subtracts `costMinor` from `remaining` without rejecting negative costs. | VERIFIED | HIGH | A negative-cost candidate is `selected: true` and *increases* the remaining budget, allowing corrupt fixtures to be auto-funded and to distort the budget envelope for subsequent candidates. |
| E10 | `src/engine.ts:25-27` | Same-category regions with different currencies can be ranked together. | VERIFIED | MEDIUM | Verified output mixed `BR-REC-N` (BRL) and `TN-KOV-N` (INR); the budget/cost comparison is meaningless across currencies. |
| E11 | `src/engine.ts:36` | `score = 100 * (weight * demand + (1 - weight) * gap)` does not clamp `weight` to `[0, 1]`. | VERIFIED | MEDIUM | Verified `weight: -1` produced a score of `130`, and `weight: 2` produced `-20`; the API schema allows out-of-range weights even though the UI slider does not. |
| E12 | `src/engine.ts:24-28` | Passing an empty `regions` array returns `[]` with no diagnostic distinction. | VERIFIED | LOW | The UI shows no candidates, but cannot tell the user whether there is no data, all projects are blocked, or the config is empty. |

---

## Step 5 — `src/App.tsx` routing and auth flow logic

Probe output verified the routing structure and auth-guard absence.

| ID | File:Line | Finding | Status | Severity | Concrete consequence |
|----|-----------|---------|--------|----------|----------------------|
| A1 | `src/App.tsx:903` | The `/workbench` route is rendered unconditionally; there is no route-level auth guard. | VERIFIED | MEDIUM | An unauthenticated visitor can open the full scoring/review UI; only individual buttons (e.g., "Sign In to Endorse") check `currentUser`, so most of the workbench is exposed. |
| A2 | `src/App.tsx:895-899` | The LandingPage role picker calls `switchPersona(...)` and immediately `navigate('/workbench')` without verifying the persona against the server. | VERIFIED | MEDIUM | A user can enter the workbench with a locally-stored demo token that the server has never validated, so server-side session isolation is bypassed for the initial view. |
| A3 | `src/App.tsx:140-147` | `currentUser` initial state is restored from `localStorage` synchronously before any server session check. | VERIFIED | MEDIUM | A stale or tampered `civic_user` value causes the UI to render as authenticated before the `/api/auth/get-session` call completes. |
| A4 | `src/App.tsx:243-256` | The session-validation effect does not call `setCurrentUser(null)` on failure. | VERIFIED | MEDIUM | If the server session is revoked or the token is invalid, the client keeps acting as the stored user until a full reload or sign-out. |
| A5 | `src/App.tsx:1772` | Footer link text is "Workbench" but the `onClick` navigates to `/` (the landing page). | REASONED | LOW | The label promises the workbench but the user is taken to the overview page, which is misleading but functionally harmless. |

---

## Step 6 — `src/main.tsx` initialization order

Probe output verified that `main.tsx` renders immediately without readiness or auth initialization gates.

| ID | File:Line | Finding | Status | Severity | Concrete consequence |
|----|-----------|---------|--------|----------|----------------------|
| M1 | `src/main.tsx:87-92` | `createRoot(...).render(<App />)` runs immediately; there is no readiness/loading gate and no auth/session initialization before first paint. | VERIFIED | MEDIUM | `App.tsx` begins rendering with potentially stale `localStorage` identity before any server validation has run, allowing a flash of authenticated UI for an invalid session. |
| M2 | `src/App.tsx` (absence) | There is no `authKnown` / `authLoading` state to block rendering until session validation finishes. | VERIFIED | MEDIUM | Components that read `currentUser` can execute actions or render role-specific UI while the session is still unverified. |

---

## Step 7 — `src/pages/LandingPage.tsx` UI flow flaws

Probe output verified the showcase behavior and the category-fallback logic.

| ID | File:Line | Finding | Status | Severity | Concrete consequence |
|----|-----------|---------|--------|----------|----------------------|
| L1 | `src/pages/LandingPage.tsx:226` | The "Open Full Workbench" CTA launches the workbench using `activeConfig.regions[0]?.category ?? 'water'`, ignoring the user's currently selected category tab. | VERIFIED | MEDIUM | A visitor who switched to the "Uttar Pradesh (Flood Roads)" tab and then clicked "Open Full Workbench" can be dropped into the workbench with the first region's category (water) instead of roads. |
| L2 | `src/pages/LandingPage.tsx:36-38` | When the selected category has no regions, the showcase silently falls back to the first region's category. | VERIFIED | LOW | Selecting "IN-TN roads" (which does not exist) still displays water projects without telling the user that the category was changed. |

---

## Step 8 — `src/pages/ThankYouPage.tsx` post-submission gaps

Probe output verified that direct navigation renders a fabricated receipt.

| ID | File:Line | Finding | Status | Severity | Concrete consequence |
|----|-----------|---------|--------|----------|----------------------|
| TY1 | `src/pages/ThankYouPage.tsx:19`, `src/pages/ThankYouPage.tsx:25-30`, `src/pages/ThankYouPage.tsx:77`, `src/pages/ThankYouPage.tsx:89` | The page renders hard-coded fallback values (`CP-REQ-DEMO2026`, "Kovilpatti North", "Priya Anandan") when `lastConfirmed` is missing or null. | VERIFIED | MEDIUM | Direct navigation to `/thank-you` or stale state after a page reload displays a fake confirmation receipt, making an unsubmitted request look successfully recorded. |

---

## Step 9 — `server/index.ts` API logic and validation

Probe output verified that protected endpoints accept unauthenticated and forged requests.

| ID | File:Line | Finding | Status | Severity | Concrete consequence |
|----|-----------|---------|--------|----------|----------------------|
| S1 | `server/index.ts:474-498` | `POST /api/v1/plans/:id/review` has no authentication or role check. | VERIFIED | HIGH | An unauthenticated caller can endorse or reject a plan; probe returned `201` with decision `reviewed` and no bearer token. |
| S2 | `server/index.ts:318-344` | `POST /api/auth/sign-up/email` allows self-registration with `role: 'planner'` without admin verification. | VERIFIED | HIGH | Probe registered `attacker@example.com` as a planner and received a valid token, granting privileged review permissions. |
| S3 | `server/index.ts:491-498` | The review endpoint trusts the `reviewer` object supplied by the client. | VERIFIED | HIGH | Probe submitted `reviewer: { name: 'Real Planner', role: 'planner', organization: 'Real Gov' }` and the server stored it, falsifying the audit trail. |
| S4 | `server/index.ts:370-376` | `POST /api/v1/intake/analyze` rejects mismatched categories, but unrelated text defaults to `water` via `findCategory`, so it is accepted in water regions. | VERIFIED | MEDIUM | Probe sent "The weather is nice today." and received `201` with category `water`, allowing irrelevant requests to be staged. |
| S5 | `server/index.ts:386-400` | `POST /api/v1/requests/confirm` requires only a valid `sessionId` and `draftId`; no auth token or role check. | VERIFIED | MEDIUM | Any session holder can confirm any draft, so a citizen session can move requests into the confirmed set without planner/auditor oversight. |
| S6 | `server/index.ts:288-290` | `GET /api/auth/demo-users` exposes all seeded users (emails, roles, organizations) without authentication. | VERIFIED | MEDIUM | Probe received the full demo-user list, giving an attacker valid email addresses and role information for targeted credential attempts. |
| S7 | `server/index.ts:421-422` | `POST /api/v1/intake/import` returns `201` even when every record is mismatched and zero drafts are created. | VERIFIED | LOW | A caller receives a success response for an import that produced nothing; the `errors` array is easy to ignore. |
| S8 | `server/index.ts:353-364` | `/health` reports `aiMode: 'groq-live'` based only on the presence of `GROQ_API_KEY`, not on actual API connectivity. | VERIFIED | LOW | Operators may believe live AI explanations are working even when Groq is unreachable and the server silently falls back to deterministic rules. |

---

## Step 10 — `server/api.test.ts` coverage gaps

| ID | File:Line | Finding | Status | Severity | Concrete consequence |
|----|-----------|---------|--------|----------|----------------------|
| Test1 | `server/api.test.ts` (absence) | No test verifies that `/api/v1/plans/:id/review` rejects unauthenticated requests. | REASONED | LOW | A regression that removes or weakens auth on the review endpoint would not fail the test suite. |
| Test2 | `server/api.test.ts` (absence) | No test covers invalid confirmation scenarios (wrong session, expired draft, forged draft ID). | REASONED | LOW | Confirmation bypass bugs would not be caught by existing tests. |
| Test3 | `server/api.test.ts` (absence) | No test covers the `decision: 'rejected'` review path. | REASONED | LOW | Rejection logic is unverified and could regress silently. |
| Test4 | `server/api.test.ts:64` | Health assertion only checks `health.json.aiMode` is defined: `toBeDefined()`. | REASONED | LOW | Changes to the reported AI mode (e.g., always returning `local-fallback`) would not fail the test. |

---

## Step 11 — `api/index.js` serverless entry point

| ID | File:Line | Finding | Status | Severity | Concrete consequence |
|----|-----------|---------|--------|----------|----------------------|
| V1 | `api/index.js:546-549` | The Vercel serverless entry point exports the app created by `createApp()` without adding any authentication middleware or route guards. | REASONED | HIGH | In production on Vercel, protected routes such as plan review are reachable by any unauthenticated caller, exactly as verified locally in S1. |

---

## Step 12 — Build and diagnostics

No new logical-flow findings. The build and diagnostics passed, confirming only that the code is syntactically valid and consistent with existing test coverage.

---

## Step 13 — Existing test suite

| ID | File:Line | Finding | Status | Severity | Concrete consequence |
|----|-----------|---------|--------|----------|----------------------|
| Suite1 | `server/api.test.ts` (overall) | The suite lacks auth-middleware enforcement tests, negative-path validation, an end-to-end citizen→confirm→plan→review flow, and any coverage of the Vercel serverless entry point. | REASONED | LOW | Real-world misuse paths (forged reviews, unauthenticated approvals, role escalation) are not guarded by automated regression tests. |

---

## Step 14 — Backend API edge-case probing

The edge-case probe largely confirmed the findings from Step 9 and added one API-routing observation.

| ID | File:Line | Finding | Status | Severity | Concrete consequence |
|----|-----------|---------|--------|----------|----------------------|
| B1 | `server/index.ts:375-364` (route registration order) | `POST /health` is not registered; Express falls through to the static-SPA catch-all and returns HTML instead of a JSON 404/405. | VERIFIED | LOW | API clients sending the wrong HTTP method receive the single-page app HTML rather than a structured error, complicating client error handling and monitoring. |

---

## Summary by severity

| Severity | Count | Representative issues |
|----------|-------|------------------------|
| CRITICAL | 0 | — |
| HIGH | 6 | Unauthenticated plan review (S1), self-registration as planner (S2), forged reviewer identity (S3/S4-type), negative-cost selection (E9), serverless auth bypass (V1), optional reviewer metadata (T4). |
| MEDIUM | 28 | Type/data validation gaps, engine scoring edge cases, offline fallback, missing route/auth guards, stale localStorage session, LandingPage category mismatch, fake ThankYou receipt, intake/confirm without role checks, demo-user exposure. |
| LOW | 9 | Footer mislabel, empty-region handling, import all-mismatch success, health mode reporting, test coverage gaps, unsupported-method HTML response. |

---

## Cross-cutting themes

1. **Authentication is advisory, not enforced.** The frontend shows sign-in UI but the `/workbench` route, review endpoint, confirmation endpoint, and Vercel serverless entry point all allow unauthenticated or forged actions.
2. **Defaults hide failures.** `findCategory` defaults to `water`, `ThankYouPage` defaults to a demo receipt, and `/health` defaults to `groq-live`; each makes an error state look like success.
3. **Client and server can diverge.** Offline fallback in `App.tsx` lets users confirm requests and compute scores without server validation.
4. **Engine trusts its inputs.** No validation of population, coverage, cost, currency, or weight boundaries leads to `Infinity`, negative budgets, and cross-jurisdiction rankings.
5. **Tests guard the happy path only.** The test suite does not cover unauthenticated access, forged identities, rejected reviews, or the serverless entry point.
