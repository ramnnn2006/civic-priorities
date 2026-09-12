Executor verdict: PS1 CivicPriorities is feasible for 1–4 people only if the build is treated as a tight decision-support demo, not a civic data platform.

**Shipping Order**
1. Canonical Zod contracts and fixtures first: Request, Cluster, RegionDemographics, InfrastructureMetric, InvestmentPlan, ProjectCandidate.
2. Deterministic scoring engine with missing-data abstention.
3. Intake: text, editable voice transcript, messaging import fixture.
4. Gemini extraction/rationale with strict schema validation and span references.
5. UI flow for clusters, evidence joins, rankings, sensitivity, saved review.
6. Brazil adapter last, using same endpoints and fixture shape.

**Time Budget**
For a small team: 2 days contracts/data/scoring, 2 days API/Gemini/STT fallback, 2 days UI/demo path, 1 day Brazil adapter/provenance, 1 day video/deck/hardening. Solo: cut polish, keep the core flow.

**Failure Modes**
Biggest risks: becoming JanMitra-plus, overclaiming data validity, Gemini hallucinating categories/numbers, missing region joins, weak Brazil portability, and spending too long on voice/messaging polish.

**Cut Lines**
Cut live WhatsApp, real government datasets, full auth, full maps, 3D/globe, multi-state breadth beyond two India fixtures plus one Brazil fixture. Do not cut infrastructure/investment joins, missing-data blocking, sensitivity controls, provenance, or Brazil adapter.

**Acceptance Gates**
Score target: AI 20/25, deployability 16/20, India depth 16/20, problem fit 18/20, impact 12/15. Total target: 82/100.

Must pass: one live request changes a cluster; ranking uses demand plus infrastructure gap plus budget/overlap; missing data blocks ranking; Gemini rationale cites only supplied evidence; Brazil runs same flow; all synthetic data visibly labeled.

Required change: make “not enough evidence to rank” a first-class demo moment.

Clear recommendation: ship PS1 CivicPriorities, but anchor the demo on auditable planning recommendations, not grievance routing.