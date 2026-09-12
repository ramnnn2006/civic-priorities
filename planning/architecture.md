# Technical architecture — reconciled full-scope supplements and initial feasibility sketches

## Full-scope reconciliation supplement (authoritative over narrow sketches below)

The full official text is now available in [fetched rules](research/sources/rules-dynamic.md), summarized in [official-rules.md](research/official-rules.md). It confirms 1–4 people, meaningful Google AI, a working core flow, realistic sample data when live inputs are unavailable, India-wide design and BRICS applicability. Submission includes a deployed link, repository, 3–5 minute video, 10–12 slides and a short description. **Realistic fixtures permit demonstrating computation; they do not validate models or operational capability.** The architectures below represent each full track through executable prototype modules; no implementation, training or deployment has occurred.

Use the shared React/Vite + Node/Express stack below. For these reconciled designs, `AiGateway` initially targets the **Gemini Developer API**, following [validated Google documentation](research/google-ai-validation.md); Vertex AI is a separately verified migration/training option. Do not infer Vertex support from Developer API documentation. All domain records retain the shared `Evidence<T>` envelope. Add `boundaryVersion`, `codeSystem`, `qualityFlags` and `missingFields`; input adapters validate geographic/time alignment before fusion. Dataset availability limitations remain as recorded in the individual research reports.

### PS1 selected — development investment planning

[candidate-spec.md](candidate-spec.md) supersedes the ticket-routing design; [final-spec.md](final-spec.md), when issued by council, owns scoring, schemas and acceptance gates. The architecture is: text/voice/messaging-export intake → Gemini extraction with source spans → confirmed regional requests → demand clusters → demographic/infrastructure/investment joins → deterministic project candidates and constraints → Gemini evidence-linked rationale → human review and saved provenance. `CivicPlanningAdapter` supplies `Request`, `RegionDemographics`, `InfrastructureMetric`, `InvestmentPlan` and `ProjectCandidate`; state/country configs select taxonomy, regional boundaries and policy. Endpoints are `/intake/analyze`, `/intake/import`, `/requests/confirm`, `/clusters`, `/plans/compute`, `/plans/:id/explain` and `/plans/:id/review` under `/api/v1`.

Use explicitly fictional planning fixtures where actual compatible joins are unavailable. Four minutes shows intake, clustered demand and regional evidence, ranked projects, sensitivity/missing-data handling, Brazil adapter execution and saved review. No competing priority formula is specified here; implement council's final definition. This covers development requests and investment recommendations rather than only service tickets.

### PS2 full scope — multimodal pollution fusion, corridor forecast and federation

**Modules and flow:** `CitizenIngest` accepts a photo plus confirmed time/location and sensor CSV; Gemini multimodal extracts only visible smoke/haze cues and image-quality limitations, never pollutant concentration or source culpability. `SatelliteAdapter` loads a small georeferenced raster tile with acquisition time, product/band identifiers, CRS, nodata/cloud mask and provenance; `TileFeatures` actually computes valid-pixel summaries per grid cell. `WeatherAdapter` normalizes forecast issue/valid times, wind vector, precipitation and temperature. `FusionService` joins those features with calibrated/quality-flagged PM observations into `{cellId,hour,pm25,smokeCue,satelliteFeature,windU,windV,rain,missingMask}`. A transparent residual/threshold detector finds **candidate** hotspots, requiring usable sensor evidence for concentration claims. Missing modalities remain visible.

`CorridorForecast` runs a small regularized linear predictor with fixed shared feature ordering for next-hour PM2.5; derive a threshold-crossing flag only against the configured concentration/window policy. A jurisdiction-local worker trains on historical feature/target rows. `FederationCoordinator` distributes a model/schema version, receives `{jurisdiction,round,n,coefficientDelta,featureSchemaHash}`, and computes sample-weighted updates; two isolated worker datasets demonstrate one actual training/aggregation round. Hold raw rows in each worker's store, enforce identical scaling/target definitions and reject incompatible updates. This is simulated two-node federated learning, without a claimed privacy guarantee or secure aggregation. Store model/round/holdout metrics with every forecast. `AlertDraft` maps affected corridor cells to jurisdiction contacts and drafts a coordinated action record with Gemini's bounded evidence summary; only a human can approve, and demo delivery stays in an internal outbox.

**Adapter/API contract:** `SatelliteTile`, `CitizenObservation`, `SensorSeries`, `WeatherForecast`, `Corridor{regionIds,cellIds}` and `ModelUpdate` use canonical geometry/time/units. Country policy owns pollutant windows and alert routing. `POST /air/ingest` → `POST /air/fuse` → `POST /air/federation/rounds` → `POST /air/forecast` → `POST /air/alerts/draft`; `GET /air/runs/:id` exposes features, model and recipients. UI adds fusion evidence, corridor forecast, round status and coordination queue to the original observation detail view.

**Fixtures and limits:** realistically generated timestamp-aligned sensor/weather histories, a clearly synthetic raster tile, two jurisdictions and corridor/contact fixtures are necessary until compatible inputs are verified. Use a rights-cleared real photograph if available, otherwise an explicitly synthetic image; do not present a photo as proof of measured pollution. Forecast training must execute, but synthetic-data holdout scores demonstrate plumbing only. Real claims require historical synchronized ground truth, leakage-free temporal/geographic validation and comparison to persistence; unverified Earth Engine access is not a critical dependency. No claim of operational early warning, national coverage or reliable cross-region generalization.

**Four-minute demo:** 0:00–0:45 upload photo/sensor packet and inspect actual Gemini cues; 0:45–1:30 fuse satellite/weather and inspect candidate hotspot; 1:30–2:20 run two local updates and show aggregate/forecast versus persistence; 2:20–3:15 draft an alert spanning two jurisdictions and record reviewer action; 3:15–4:00 switch Brazil fixture/config and demonstrate missing-modality or stale-source behavior. Warm-start a small model, but visibly execute one round and one prediction; never substitute prerecorded training for live execution.

### PS3 full scope — PHC capacity, attendance, demand and federated redistribution

**Modules and flow:** extend inventory with `BedSnapshot{facilityId,total,occupied,unavailable,at}`, `AttendanceAggregate{facilityId,role,scheduled,present,shiftStart,shiftEnd}` and `Footfall{facilityId,date,visits,serviceCode}`. `FacilityIngest` consumes versioned CSV/JSON events, checks bed/attendance bounds, persists them and refreshes the capacity dashboard through polling. Use synthetic aggregate staff counts, not personal attendance records. `LocalDemandTrainer` builds daily features from lagged consumption/footfall, calendar and an explicitly entered emergency scenario; fit a small ridge model to next-day consumption by SKU. Separate bed-demand output requires its own target/history; never infer available beds from medicine demand.

`HealthFederation` uses the versioned update contract above, with independent state stores and identical SKU/unit/feature definitions. Run local updates and aggregate weights, then compute next-day demand and provisional projected stock-out dates. If data are insufficient, use a disclosed deterministic consumption baseline and mark learned forecast unavailable. `CapacityRules` detects bed/staff shortages from fresh snapshots. `RedistributionPlanner` automatically constructs **proposed** cross-district transfers using donor reserve, projected demand, pack/expiry, travel/cold-chain and receiving-capacity constraints. Gemini explains the computed warning/proposal with exact input IDs; it cannot change quantities. Human approval invokes the original transactional reservation workflow; capacity/staff shortages create escalation tasks, not invented transfers of staff or beds.

**Adapter/API contract:** `FacilityResourceAdapter` normalizes local medicine catalogs, bed classes, personnel roles, shifts and district boundaries. Add `POST /facilities/events`, `GET /facilities/capacity`, `POST /health/federation/rounds`, `POST /health/forecasts`, `GET /health/warnings` before the original `/transfers/propose` and approval endpoints. `Forecast{target,horizon,modelVersion,trainingMode,baseline,evidenceIds}` and transfer records bind to the same input snapshot/version. Country/state configs define reserve policies and redistribution authority; national coverage is an extension of the interface, not seeded data coverage.

**Fixtures and limits:** require realistic multiweek stock/consumption/footfall histories, bed/attendance events, emergency scenarios and two state/district logistics tables because operational records are unverified. Artificial emergency multipliers are scenario assumptions, not learned epidemic forecasts. Train/aggregate the small model on fixture histories and display evaluation mode; real forecasting needs sufficient consented operational history, missingness audits, temporal holdouts and baseline comparison. No clinical decision making, live PHC integration, secure federation or national deployment is established.

**Four-minute demo:** 0:00–0:45 ingest bed/attendance/stock events and show dashboard freshness; 0:45–1:35 run two state-local model updates and demand forecast; 1:35–2:25 trigger an emergency scenario and inspect stock/capacity warnings; 2:25–3:20 compute, explain and approve a cross-district transfer with reservation conflict handling; 3:20–4:00 show Brazil pack/role adapter and an unavailable-input warning. Keep the original stock ledger as the executable transaction core.

### PS4 full scope — satellite/soil/weather recommendations and disease triage

**Modules and flow:** `FarmContext` records a confirmed field polygon, crop history, growth stage and farmer constraints. `SatelliteAdapter` loads a small georeferenced red/NIR tile and quality mask; compute NDVI only for valid pixels with a nonzero denominator and retain acquisition/cloud metadata. `SoilAdapter` normalizes dated tests `{depthCm,pH,organicCarbonPct,nitrogen,phosphorus,potassium,units,method}`; nutrient values with incompatible methods remain incomparable. `WeatherAdapter` supplies issued/valid forecast windows. `ContextFusion` intersects field/tile geometry and aligns source dates; it produces an evidence object with missingness rather than manufacturing soil properties from vegetation indices.

`RegenerativePlanner` filters a curated, locally sourced crop/practice catalog by season, crop history, water availability, soil constraints and farmer inputs. Gemini generates a structured comparison of eligible options (for example rotation/cover crops where supported), citing the supplied satellite/soil/weather and extension evidence; deterministic checks forbid unsupported crop/action codes or quantitative yield promises. `DiseaseTriage` separately accepts a leaf photo; actual Gemini multimodal inference returns visible symptoms, possible categories, image-quality flags and requested follow-up. Present a suspected-condition result requiring expert confirmation, allow unknown, and do not label model self-confidence as calibrated probability. Disease output cannot automatically authorize chemicals or override regenerative eligibility.

**Adapter/API contract:** `FarmParcel`, `SatelliteTile`, `SoilTest`, `WeatherForecast`, `PracticeRule`, `CropImageObservation` and `AdvisoryResult` extend shared evidence. Country/state packs map crop/stage terms, laboratory methods, growing seasons and locally applicable guidance. `POST /agri/context` → `POST /agri/fuse` → `POST /agri/recommendations`; `POST /agri/diagnose` → `POST /agri/advisories/:id/review`. `GET /agri/model-manifest` exports versioned schemas, feature definitions, evaluation status and compatible crop/policy packs so another state can run the same model interface. Publish documented adapter contracts and a license-reviewed code/data manifest for the digital-public-good design; no formal certification is claimed.

**Fixtures and limits:** use an explicitly synthetic raster tile or licensed sample imagery, realistic soil/weather records and crop-history fixtures until compatible real sources are established. Crop guidance needs applicable cited documents; a synthetic policy pack demonstrates mechanics only. Use rights-cleared leaf images with provenance and reviewed labels where available. Do not train a disease classifier during the demo; Gemini inference is the bounded actual AI component. Agricultural validity requires agronomist review and region/crop-specific evaluation, including healthy leaves, lookalike diseases and low-quality images; no validated diagnosis, yield improvement or field-level soil inference is claimed.

**Four-minute demo:** 0:00–0:50 load field/satellite/soil/weather and show computed features; 0:50–1:45 generate two eligible regenerative options with source-linked reasons; 1:45–2:45 upload a leaf image and inspect actual multimodal triage/uncertainty; 2:45–3:25 remove soil evidence and demonstrate constrained advice; 3:25–4:00 run a separate Brazil country pack and export the shared manifest. No live satellite download or model training is required on the judge's critical path.

**Team/deployment boundary for unselected options:** all retain one deployed client/API and isolated demo sessions. One person would need prepared fixtures and the smallest executable modules; two people split client/demo and adapters/AI; three or four can assign forecasting/federation and integration/evaluation separately. PS2/PS3 require materially more integration than PS1. Two federation workers can be isolated application modules/stores in the prototype, explicitly labeled a simulation; production multi-organization deployment, authentication and privacy controls are future work. None of these supplements asserts the full operational platform already exists. The original sketches below remain useful module details; their omitted-feature cut lines no longer define full official scope.

**Orchestrator reconciliation:** Official wording and rules were subsequently recovered in [research/official-rules.md](research/official-rules.md). These initial narrow sketches are feasibility probes, not full-scope architectures for the recovered tracks. PS1 is selected and expanded in [candidate-spec.md](candidate-spec.md); the council's [final-spec.md](final-spec.md) is the authoritative build handoff once written. In particular, ticket routing alone misses PS1; historical observations miss PS2's data fusion and forecasting; the stock-only PS3 sketch omits beds/attendance/federated modelling; the advisory-only PS4 sketch omits satellite/soil fusion and disease diagnosis. The research reports record those gaps explicitly. Provisional rankings and unresolved-rule statements below describe the original draft stage, not the reconciled decision.

Owner: Subagent 2. Planning only; no application or dependencies installed. Date: 2026-09-11.

The supplied brief names PS1–PS4 but does **not** include their full problem statements. Treat scope, eligibility, 1–4 person team, live deployed link, 3–5 minute video/demo, judging weights and BRICS framing as **user-provided, pending official verification**. These are proposed designs, not verified claims of API availability, dataset access, language support or production readiness. Research agent owns fetched citations and prior-art assessment; final PS choice belongs to reconciliation.

## Shared implementation

- **Client:** React + Vite + TypeScript; accessible forms, table/detail views, explicit loading/error/source-age states. Prefer a list over a mandatory map. No 3D dependency on the critical path.
- **Server:** Node.js + TypeScript + Express, Zod boundary validation. Serve the compiled Vite client and `/api/v1` from one container on a proposed Cloud Run deployment, giving judges one HTTPS URL. Verify account, region, billing, service permissions and deployment access early.
- **State:** proposed Firestore document persistence; private Cloud Storage only for optional audio/images. Do not rely on container filesystem persistence. Store versioned country configs and small, licensed evidence fixtures in the repository. Store secrets server-side through deployment secret configuration; never Vite environment variables.
- **AI:** one server-side `AiGateway` calling a research-verified Gemini model via Vertex AI; optional Cloud Speech-to-Text and Cloud Translation only after locale/region checks. Pin the model identifier at build time following research, not an invented model/version. Google AI performs bounded extraction or evidence-grounded explanation; deterministic code owns arithmetic and state changes.
- **Access:** anonymous judges receive isolated synthetic demo sessions; real operator writes require authentication and role checks. Restrict uploads by type/size, rate-limit AI calls and cap requests per session. Never expose a public production administrator.
- **Build outline:** `web/src/features/{selected-ps}`, `server/routes`, `server/services/{ai,evidence,policy}`, `shared/contracts.ts`, `config/countries/{IN,BR}.json`, `server/adapters`, `fixtures`. Build **one** PS, not four applications.
- **Implementation dependencies, not installed:** React, Vite, TypeScript, Express, Zod; Google authentication/client libraries selected against fetched documentation. Environment: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GEMINI_MODEL`, `COUNTRY_CONFIG_DIR`, `DEMO_MODE`; bucket/database identifiers only if used. Prefer service identity to a downloaded long-lived service-account key.

### Concrete portability contracts

Country switching selects policy, terminology, locale and a data adapter together. Translation alone is insufficient.

```ts
type CountryConfig = {
  id: string; version: string; timezone: string;
  defaultLocale: string; enabledLocales: string[];
  speechLocales: Record<string, string>; // only verified model/region combinations
  adapters: Partial<Record<'civic'|'air'|'stock'|'agri', string>>;
  policyBundle: string; vocabularyBundle: string;
  sourceMaxAgeHours: Record<string, number>;
};
type Evidence<T> = {
  id: string; country: string; regionId: string; payload: T;
  sourceUrl: string | null; license: string | null;
  observedAt: string; fetchedAt: string; validUntil?: string;
  mode: 'live'|'snapshot'|'synthetic'; adapterVersion: string;
};
interface SourceAdapter<Q, T> {
  id: string;
  fetch(query: Q): Promise<unknown>;
  normalize(raw: unknown): Evidence<T>[];
}
interface AiGateway {
  extract(input: string, schemaId: string): Promise<unknown>;
  explain(input: {
    locale: string; facts: unknown;
    evidence: Evidence<unknown>[]; allowedActions: string[];
  }): Promise<unknown>;
}
```

Validate AI output with Zod; reject unknown evidence IDs and action codes. Evidence IDs link to excerpts in the UI. Treat fetched/user text as data, never as instructions; model receives no write tools. An invalid answer receives at most one retry, then a visible structured fallback. An evidence ID proves traceability, not factual entailment; manually check demo answers against their excerpts.

Suggested config instances: `IN` defaults to `en-IN`, `Asia/Kolkata`, `policy/in-v1`; `BR` to `pt-BR`, `America/Sao_Paulo`, `policy/br-v1`. Additional locales and speech maps stay empty until validated. These are demo defaults, not representations of all languages/timezones in either country. Distinct regional IDs and vocabulary bundles prevent India-specific district, facility and crop codes leaking into Brazil.

`GET /api/v1/config?country=IN` returns enabled capabilities, locales and policy version. Domain routes accept `{country, regionId, locale, ...}` and reject unsupported combinations. Preserve original source units, then normalize with explicit conversions; reject ambiguous units. Store provenance/config version with every result. If Brazil has only a synthetic adapter, label the demonstration **adapter-contract portability**, not validated Brazilian deployment.

## PS1 — Citizen feedback: evidence-linked routing desk

**Smallest useful scope:** turn one citizen report into a reviewed, traceable service ticket. A text input and staff queue suffice; voice is optional.

**Flow:** citizen text → optional verified Speech-to-Text for audio → server removes contact details from AI input → Gemini extracts `{summary, categoryCode, locationText, evidenceSpans, needsClarification}` → deterministic lookup maps allowed category + confirmed jurisdiction to department → citizen confirms extracted details → staff queue → staff records status. Optional Translation renders a summary; retain the original text for review. Do not let sentiment determine service entitlement or priority.

**Data:** `Ticket{id,country,regionId,originalText,summary,categoryCode,departmentCode,status,configVersion}` plus append-only `TicketEvent{ticketId,actor,from,to,at}`. Store contact details separately and omit them from demo fixtures.

**Endpoints:** `POST /feedback/analyze` returns a validated draft with missing fields; `POST /tickets` accepts the confirmed draft with an idempotency key; `GET /tickets/:id` returns tracking; authorized `PATCH /tickets/:id/status` enforces `submitted→triaged→in_progress→resolved` and writes an event. The demo changes status only inside its synthetic session; it does not submit to government systems.

**Portability implementation:** `CivicDirectoryAdapter` returns `{jurisdictionId, categoryCode, departmentCode, publicContactUrl}`; `vocabularyBundle` contains localized category labels; `policyBundle` defines routing and permitted transitions. Same API handles IN and BR. Use a versioned curated directory fixture if no usable government directory exists, visibly marked synthetic. No national grievance API integration is required for the prototype.

**Four-minute demo:** enter a local-language report if verified (otherwise English), inspect extracted fields, correct location, submit, show operator transition and citizen receipt; switch country and route a second report to a different configured department. Show source/config provenance.

**Risks and cut line:** automatic duplicate detection, government integrations and nationwide geocoding are stretch work. Do not promise actual government receipt, response-time guarantees or emergency dispatch. Main dependency: authoritative categories/jurisdictions and multilingual extraction quality. This option can demonstrate its core with synthetic directories and minimal external data.

## PS2 — Air quality: explain the nearest trustworthy observation

**Smallest useful scope:** station-level observations with freshness and an evidence-linked explanation. No forecasting or street-level exposure claims.

**Flow:** selected location → `AirAdapter` obtains station observations → deterministic unit, timestamp and completeness checks → select a station with visible distance → optional country-specific index calculation only with a verified standard and sufficient averaging window → Gemini explains supplied measurements using a small approved guidance bundle → localized observation card. The model neither calculates the index nor invents missing pollutants.

**Data:** `AirObservation{stationId,lat,lon,pollutant,value,unit,averagingMinutes,windowStart,windowEnd,qualityFlag}`. Preserve canonical concentration separately from an optional `IndexResult{standardId,standardVersion,value,category,inputs}`. Never compare different national index numbers as if equivalent.

**Endpoints:** `GET /air/observations?country=IN&lat=...&lon=...` returns evidence records and freshness; `POST /air/explain {observationIds,locale}` loads server-held records and returns `{summary,caveats,evidenceIds}`. Missing/stale observations yield a clear unavailable result; explicitly selected snapshots remain dated historical examples.

**Portability implementation:** `AirAdapter` maps each provider's station IDs, timestamps, units and pollutant names to the schema. A `policyBundle` supplies the verified local AQI breakpoints, averaging rules and approved guidance references. Without a validated local standard, show concentrations and metadata only. Do not convert gas measurements between mass and volume units without required conditions.

**Four-minute demo:** select one verified Indian station, inspect raw observation/time, generate explanation, then choose one Brazilian station/source and show identical UI with separate index policy or concentration-only output. Toggle an old fixture to demonstrate stale-data handling.

**Risks and cut line:** source keys, rate limits, station gaps and a noncomparable Brazil dataset can block the live story. Satellite aerosol/climate data is not a substitute for surface PM measurements. A regional dashboard with sourced explanations is feasible; health personalization, forecasting and sensor deployment are not in the initial scope. Research must establish at least one usable observation source before selection.

## PS3 — PHC supply chain: reviewed stock redistribution draft

**Smallest useful scope:** two or three facilities and a small medicine catalog; detect likely stock-outs and propose a draft transfer. Use synthetic facility stock unless access is actually established. No patient data or prescribing.

**Flow:** operator uploads stock CSV → deterministic parser validates facility, SKU, base unit, batch, expiry and movements → server computes usable stock and recent average daily consumption → identify deficit and eligible nearby surplus → Gemini explains the deterministic proposal and missing evidence → operator reviews → save a transfer request in demo ledger. Gemini does not choose dose substitutions, change stock or approve transfers.

**Data:** `StockBatch{facilityId,sku,batchId,quantityBase,baseUnit,expiresAt,coldChainRequired}`; `Consumption{facilityId,sku,date,quantityBase}`; `TransferDraft{from,to,sku,batchId,quantityBase,reasons,status,stockVersion}`. Define `daysCover=usableQuantity/avgDailyConsumption` only with a complete, nonzero consumption window; otherwise return `unknown`. Exclude expired/expiring-before-arrival batches and unresolved cold-chain eligibility.

**Endpoints:** `POST /stock/import` validates CSV and previews row errors; `POST /stock/import/:id/commit` persists a confirmed batch; `GET /stock/risks`; `POST /transfers/propose` runs deterministic constraints then AI explanation; `POST /transfers/:id/approve` records an authorized request with an optimistic version check. Approval reserves stock atomically to avoid duplicate allocation; actual dispatch and receipt are out of scope and remain visibly pending.

**Portability implementation:** `StockAdapter` converts local facility/product codes and pack sizes to canonical inventory records; `vocabularyBundle` maps products to exact ingredient, strength, dosage form and base unit. Matching ingredient alone is insufficient. Local `policyBundle` configures buffer days, transfer permissions, lead times and cold-chain rules; unsupported logistics produce “manual review required.”

**Four-minute demo:** import a small synthetic CSV, reveal a stock-out risk, inspect candidate donor and expiry exclusions, generate a sourced explanation, approve a draft and demonstrate a second approval cannot reserve the same stock. Switch to a Brazilian facility/pack-size fixture and show normalization.

**Risks and cut line:** public aggregate health statistics rarely prove facility-level inventory access; research must distinguish them. Live procurement integration, route optimization and real medicine logistics are undemoable initial dependencies. Use synthetic ledger evidence honestly. Practical software demo, but real impact claims need operator validation and appropriate data access.

## PS4 — Agricultural advisory: evidence-bounded crop-stage answer

**Smallest useful scope:** one crop, one district, one growth stage and a narrow question category such as irrigation timing. No image diagnosis or unconstrained pesticide prescriptions.

**Flow:** farmer selects location, crop, stage and asks a question → optional verified Speech-to-Text → `AgriAdapter` retrieves a small approved local advisory corpus and optional dated weather observations/forecast → deterministic filter on country/crop/stage/validity → Gemini generates `{answer,evidenceIds,missingInputs,escalate}` using only retrieved excerpts → validate evidence/action codes → optional verified Translation → evidence and freshness shown beside the answer. Insufficient matching evidence produces a clarification or referral.

**Data:** `AdvisoryDoc{id,country,regionIds,cropCode,stageCodes,validFrom,validUntil,language,text,sourceUrl}` and `WeatherRecord{kind:'observed'|'forecast',issuedAt,validAt,rainfallMm,tempC,sourceUrl}` wrapped in the shared provenance envelope. Weather must not silently turn a general extension note into a precise field-level recommendation.

**Endpoints:** `GET /agri/options?country=IN&regionId=...`; `POST /agri/answers {cropCode,stageCode,question,locale}` returns answer, cited excerpts and missing inputs; `GET /agri/answers/:id` retrieves the saved result and source dates. Country config prohibits advice categories outside the curated scope.

**Portability implementation:** `AgriAdapter` normalizes crop codes, region coverage, growth stages and source validity; country vocabulary maps local crop/stage terms; country policy selects applicable extension guidance. Use crop stage and local weather dates rather than transferring Indian calendar months to another hemisphere. A Brazilian run needs a genuinely applicable Brazilian advisory, not a translation of an Indian recommendation.

**Four-minute demo:** ask one supported crop-stage question, inspect source excerpt and date, ask one unsupported question to show abstention, then switch to a Brazilian crop/region fixture backed by a separate local document.

**Risks and cut line:** multilingual technical terminology, poorly dated documents and missing local guidance are the main blockers. A small licensed corpus can use deterministic metadata/keyword retrieval; no vector database is necessary. Voice, satellite ingestion, computer vision and personalized chemical recommendations are stretch work or outside the demo.

## Delivery and verification gates

For a **solo builder**, implement text input, one country plus a second adapter fixture, one Gemini call and one persistent result; leave optional voice/maps out. For **two people**, divide server/data/AI and client/deployment/demo. For **three**, separate adapters/evidence evaluation. For **four**, assign deployment/integration/demo QA to the fourth person. Do not assign one PS per person: the deliverable is one complete product. Available build duration is unknown, so these are scope bounds rather than a promised schedule.

Suggested order: (1) confirm full PS/rules and deploy a static shell; (2) complete domain flow with explicitly synthetic data; (3) integrate one verified source and Gemini; (4) add second country adapter and failure states; (5) rehearse and record a four-minute flow using the actual deployed URL. Budget roughly 15/35/25/15/10 percent of available time; cut optional services first.

Use a synchronous AI call with a proposed application deadline around 20 seconds, one retry only within the overall deadline, and a visible deterministic fallback. These are application budgets, not vendor latency guarantees. Keep saved results labeled as saved; never present a replay as a live AI response. If a provider is down, show the failure and a dated result, and state that live execution remains unproven for that run.

Acceptance checks: deployed URL works in a clean browser; happy path persists and reloads; unauthorized mutation rejected; malformed model response handled; source age/license/mode visible; country swap changes the adapter and policy without component edits. Add focused tests for country normalization, PS2 averaging/unit validation, PS3 reservation concurrency or PS4 no-evidence abstention as relevant to the chosen PS. Confirm the deployed account can actually make one Google AI request before investing in visuals.

## Research reconciliation — pending

Research reports now available: [PS1](research/ps1-citizen-feedback.md), [PS2](research/ps2-air-quality.md), [PS3](research/ps3-phc-supply-chain.md), [PS4](research/ps4-agri-advisory.md). See [Google AI validation](research/google-ai-validation.md) for fetched docs and [official rules](research/official-rules.md). No external sources were fetched by this architecture worker; this deliberately avoided duplicating research. The selected PS1's reconciled flow uses explicitly labelled planning fixtures, since operational demographic/infrastructure/investment joins were not verified. Gemini Developer API evidence does not validate Vertex AI parity; candidate-spec.md makes that provider boundary explicit.

| Dependency owned by research/orchestrator | Consequence for architecture |
|---|---|
| Full PS text and official eligibility/submission/judging rules | Re-scope before choosing; BRICS portability may be a project differentiator rather than an official requirement. |
| Gemini model, region, structured output, quotas, billing and credential path | Finalize `AiGateway`, schema strategy and deployment config; no model identifier assumed here. |
| Speech/Translation locale and model coverage | Enable only verified language paths; text entry remains the initial path. |
| Actual downloadable datasets, license, freshness and permitted reuse | Replace synthetic fixtures only after inspecting usable records, not merely a landing page. |
| Brazil comparable source and domain relevance | Establish real adapter portability or explicitly retain contract-only evidence. |
| Prior-art scan and operator need | Adjust the distinctive workflow; no originality claim is established. |

**Provisional technical ranking only:** PS1 has the fewest external-data dependencies; PS3 supports a strong transactional demo with honestly synthetic data; PS4 becomes credible with a small applicable corpus; PS2 depends most directly on usable observations. This is not a final problem selection or an impact ranking. Reconcile research and full PS requirements first. This draft is ready for reconciliation; unresolved entries above remain open.
