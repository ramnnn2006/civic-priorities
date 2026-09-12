# API audit — CivicPriorities

Scope reviewed: `server/index.ts`, `src/engine.ts`, `package.json`, and `Dockerfile`. `npm test -- --reporter=verbose` passed (4 engine tests). Those tests do not exercise any HTTP route or deployment behavior.

## High priority

### 1. Confirm accepts forged and cross-configuration drafts

`POST /api/v1/requests/confirm` accepts the entire client-supplied draft (`server/index.ts:35-45`). It does not verify that its ID was produced by `/intake/analyze`, that its region belongs to a configuration, or that its locale/category agrees with that region. A caller can therefore add arbitrary confirmed requests to any known region and influence a later plan computation. `sessionId` is only a caller-chosen UUID; it is not authentication or proof of ownership.

**Fix:** Store server-generated drafts as `{ sessionId, configId, draft, expiresAt }` when intake succeeds. Confirm by draft ID only, look it up server-side, validate its configured region and locale/category, then delete or mark it confirmed. Never accept scoring fields, region, locale, category, spans, or status from the confirmation request.

### 2. Evidence validation can be bypassed with an empty or zero-length span

The confirmation schema permits `spans: []`, and permits `start === end` (`server/index.ts:36`). `[].every(...)` is true, and an empty quoted slice also passes the comparison at line 41. This creates a confirmed request without evidence.

**Fix:** Require `spans: z.array(spanSchema).min(1)`, enforce `end > start`, a non-empty `quote`, bounded offsets, and a finite allow-list for `field`. Apply those checks to server-stored extraction output as well.

### 3. Plan explanation and review operate on arbitrary IDs

`POST /api/v1/plans/compute` returns a random ID but does not store a plan (`server/index.ts:57-67`). `/plans/:id/explain` returns the same rationale for any string, and `/plans/:id/review` saves a review for any string without checking that a plan exists or belongs to the session (`server/index.ts:69-77`). `expectedRevision` is never compared to a stored revision, so it provides no concurrency protection and a later request overwrites the review.

**Fix:** Persist a plan record keyed by a UUID, including `sessionId`, config, candidates, evidence hash, revision, and creation time. Require UUID parameters. For explain/review, load the plan, enforce session ownership, return `404` for an unknown plan, and reject a revision mismatch with `409 Conflict`. Increment the stored revision atomically on review.

### 4. Runtime state is unbounded, unauthenticated, and lost on deployment events

All drafts and reviews live in the process-local `sessions` map (`server/index.ts:16-18`). It has no size cap or expiry, is lost on restart, and is inconsistent across Cloud Run instances. A public endpoint can create unlimited UUID sessions, consuming memory. The project specification calls for persisted isolated demo runs, but the container has no persistence layer.

**Fix:** For a demo, cap sessions/requests and expire them after a short TTL, then return `429`/`503` when limits are reached. For a deployed service, store session, draft, plan, and review records in Firestore (or another managed datastore) with TTL cleanup. Add an authenticated or signed session mechanism before handling non-synthetic user data.

## Medium priority

### 5. An issue can be silently excluded from its selected planning region

Intake verifies that a region exists, but `makeDraft` derives the category only from text (`server/index.ts:29-31`, `src/engine.ts:11-20`). During scoring, a draft counts only when both its region and its inferred category match the fixture's category (`src/engine.ts:30`). A "road" request for a configured water region can be confirmed successfully and then disappear from its cluster/plan result without a reason.

**Fix:** Model a region's supported categories explicitly. If extraction produces an unsupported category, return a clarification/routing result and require the user to choose a valid target before confirmation. Return counts for unmatched or pending requests so none are silently discarded.

### 6. SPA fallback turns unknown API routes into successful HTML responses

When `dist` is present, the final catch-all handler serves `index.html` for every unmatched path (`server/index.ts:80-84`). An unknown `/api/v1/...` route therefore returns HTTP 200 with HTML instead of a JSON 404, confusing clients and masking endpoint mistakes.

**Fix:** Add an `/api` JSON 404 handler before the SPA fallback, for example `app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))`. Restrict the SPA handler to browser navigation requests and return a normal 404 otherwise.

### 7. Production image runs the service as root

The final Docker stage never switches users (`Dockerfile:8-18`). A compromise in Express, `tsx`, or an application dependency executes as root inside the container.

**Fix:** Use the image's non-root `node` user, copy files with `--chown=node:node`, set `USER node`, and keep the filesystem read-only at runtime where the platform permits it. The service should not need writable application files.

### 8. The server is omitted from the TypeScript build gate

`npm run build` runs `tsc -b && vite build` (`package.json:8`). The root TypeScript project includes only `src`, while the referenced node project includes only `vite.config.ts`; `server/index.ts` is not type-checked by that command (`tsconfig.json:19`, `tsconfig.node.json:9`). The container can therefore build successfully and then fail when it executes the unchecked server code.

**Fix:** Add a backend `tsconfig` that includes `server/**/*.ts` and make it part of `tsc -b`, or add a dedicated `typecheck:server` script to CI and Docker's build stage. Add route-level tests that start the app and cover valid/invalid intake, confirmation, session isolation, unknown plans, stale review revisions, and API 404s.

## Deployment notes

- `Dockerfile` does correctly run `npm ci --omit=dev`, and `tsx` is currently a production dependency, so the runtime entrypoint is available.
- `.dockerignore` excludes `.env`, `node_modules`, `dist`, `.git`, and planning material, so the current Docker context does not copy the local environment file.
- `/health` only reports that the process is reachable. It does not verify datastore readiness, and it labels a present Gemini key as `not-configured-in-demo`; do not use it as an AI-readiness signal.

