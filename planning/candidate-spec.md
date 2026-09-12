# Candidate for council: PS1 — CivicPriorities

Orchestrator reconciliation, 2026-09-11. This supersedes the narrow PS1 ticket-routing proposal in architecture.md. Read research/official-rules.md, research/ps1-citizen-feedback.md, research/google-ai-validation.md and design.md alongside it.

## Choice and evidence

Select PS1: multilingual development requests become auditable infrastructure project priorities. Research and architecture agree it has the fewest unavoidable operational-data dependencies. Official rules permit realistic sample data; that makes missing planning inputs a disclosed prototype limitation, not permission to claim real-world validation. PS2 lacks verified granular observations/forecast inputs; PS3 lacks operational stock/footfall data; PS4 lacks verified integrated satellite/soil/weather/diagnostic inputs. The documented easier versions miss those tracks' full scope.

Prior art JanMitra already covers intake/routing/hotspots. Differentiate through population-normalized demand, explicit infrastructure/investment evidence, missing-data handling and policy sensitivity. This is a proposed distinction, not proven novelty or fairness.

## Complete core flow

1. Two Indian state configurations and one Brazilian configuration share a canonical contract. Load clearly fictional regional population, infrastructure-gap and investment-plan fixtures, versioned and labeled independently of verified historical context data.
2. Accept text and a short recorded voice request; editable transcript; language selection; messaging-export import adapter with explicit provenance. No claim of live WhatsApp integration. Runtime provider failures must be visible.
3. Server calls Gemini for bounded category/location/need extraction with exact source spans and clarification on missing location. Confirm jurisdiction before accepting. Group confirmed requests into category/region demand clusters, with conservative duplicate review; do not treat repeat submissions as independent votes.
4. Join cluster records against demographic population, infrastructure coverage and planned project/budget records by versioned regional IDs. Missing or incomparable data blocks ranking. Display demand counts alongside denominators and collection-coverage caveats. Low reporting is not proof of low need.
5. Deterministic code generates candidate projects and calculates a documented weighted priority from normalized demand and infrastructure gap, with explicit budget/overlap constraints; public policy weights are editable demo assumptions. Show competing projects, evidence, source mode and why a candidate is blocked or already funded. Gemini drafts a rationale referencing only supplied evidence; code validates IDs and numerical claims.
6. Reviewer changes a policy weight or marks a source missing, observes priority changes/abstention, then saves a reviewable recommendation with calculation/config/model provenance. This is decision support, never automatic allocation.
7. Switch to a Brazilian region, Portuguese labels and local taxonomy/data/policy fixture. Same endpoints and UI execute the same flow. Claim demonstrated adapter-contract portability, not validated nationwide Brazilian deployment.

## Architecture handoff

React/Vite/TypeScript frontend; Node/Express/TypeScript backend, Zod contracts; one Cloud Run container serves static UI and API; Firestore persists isolated demo runs. Gemini server-side; use the Gemini Developer API against the fetched ai.google.dev documentation initially, with a server secret. Do not assume these docs prove Vertex AI parity; Vertex migration needs separate verification. Speech-to-Text V2 chirp_2 and Translation NMT follow the fetched locale/region matrix; project entitlement remains a build-time gate. Pin and smoke-test exact Gemini model before frontend polish.

Extend architecture.md country contract with CivicPlanningAdapter providing Request, RegionDemographics, InfrastructureMetric, InvestmentPlan and ProjectCandidate records. Each record includes country/region/code-system, unit, observedAt, sourceUrl, source mode, version and missingness. Separate country policy, taxonomy and language support. Messaging adapter normalizes imported channel records into Request; state adapters share the country contract. Input alone cannot override source metadata or country policy. Demographic joins must validate boundary version and time basis.

Endpoints: POST /intake/analyze; POST /intake/import; POST /requests/confirm; GET /clusters; POST /plans/compute; POST /plans/:id/explain; POST /plans/:id/review; GET /plans/:id; GET /config. Country/session isolation and human review apply throughout. Final council must turn scoring, request/record schemas and acceptance gates into buildable detail rather than leaving abstract interfaces.

## Demo and design

Four minutes: 0:00–0:45 multilingual input/transcript; 0:45–1:25 aggregation and region evidence; 1:25–2:15 ranked projects and Gemini rationale; 2:15–3:05 sensitivity and missing-data handling; 3:05–3:40 Brazilian fixture through identical code; 3:40–4:00 saved review/provenance. Existing fixture requests make cluster behavior visible while one live input changes it.

Use design.md's split hero and Magic UI Bento Grid. CTA: Try a development request. Preview a real planning result, evidence, and reviewer action. Optional Blur Fade only after functionality; globe and Skiper are reserve candidates. DOM-first, reduced-motion bypass, no mandatory 3D. No frontend packages installed at planning stage.

## Council obligations

Attack complete official PS fit, 25/20/20/20/15 judging criteria, viability for 1–4 people, live 3–5 minute flow, prior-art overlap, policy/representation bias and portability. Keep all material PS concepts represented in the prototype; reject scope cuts that silently revert to a ticket router. Produce final build spec with explicit changes/retained decisions, practical build gates, submission artifacts (live link, repo, video, 10–12 slides, 2–3 line description), and honest fundamental limitations. Do not claim measured quality, authenticated AI execution, licenses, production-scale national joins or live deployment were tested during planning.
