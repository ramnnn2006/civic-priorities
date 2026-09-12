from pathlib import Path
import json,re
r=Path('planning/research')
def write(n,t): (r/n).write_text(t.strip()+'\n')
write('google-ai-validation.md','''# Google AI validation — 2026-09-11
All documentation below was fetched with Scrapling after an escalated retry. No authenticated API invocation was performed; documented availability is not a tested project entitlement.

| Capability | Verified documentation | Demo implication |
|---|---|---|
| Gemini structured output | Supports a subset of JSON Schema; syntactically valid output still needs semantic validation. [Docs](https://ai.google.dev/gemini-api/docs/structured-output), local `sources/gemini-structured.md` | Use extraction/classification with schema checks, source references and abstention. Never let the model invent official categories or calculate stock arithmetic. |
| Gemini rate limits | RPM, TPM and RPD apply per project; active limits depend on account/model/tier and are viewed in AI Studio; capacity is not guaranteed. [Docs](https://ai.google.dev/gemini-api/docs/rate-limits) | No universal free-tier RPM is asserted. Verify the chosen model in the actual project before build; queue requests and handle 429. |
| Speech-to-Text | Synchronous: 10 MB or one minute, whichever first. Streaming: 25 KB per audio message, stream up to five minutes. [Quotas](https://cloud.google.com/speech-to-text/v2/quotas) | Record 15–30 seconds; retain editable text fallback. Quotas page redirects to current unified docs; inspect actual V2 method before implementation. |
| Translation general model | Default 6,000,000 characters/project/minute; v3 6,000 requests/project/minute. Recommended request size 5,000 code points; Advanced maximum 30,000 code points; Basic maximum 100,000 bytes. [Quotas](https://cloud.google.com/translate/quotas) | Use short segments; these are default service quotas, not free allowances or confirmed account allocations. |

[Speech language matrix](https://cloud.google.com/speech-to-text/v2/docs/speech-to-text-supported-languages), saved in `sources/speech-languages.md`, explicitly lists Hindi `hi-IN`, Tamil `ta-IN`, Bengali `bn-IN`, Gujarati `gu-IN`, Kannada `kn-IN`, Malayalam `ml-IN`, Marathi `mr-IN`, Telugu `te-IN`, Assamese `as-IN`, Punjabi `pa-Guru-IN` and Brazilian Portuguese `pt-BR` with `chirp_2` in `asia-southeast1`. This is a verified subset, not a claim of all Indian languages. Model features and regional availability differ; dialect/code-switching quality was not tested.

[Translation languages](https://cloud.google.com/translate/docs/languages), local `sources/translation-languages.md`, lists NMT support for `hi`, `ta`, `bn`, `gu`, `kn`, `ml`, `mr`, `te`, `as`, `pa`, `or`, `ur`, and Portuguese including `pt-BR`. Do not conflate the NMT list with Translation LLM: the latter marks Odia experimental in the fetched table. Language support does not establish translation quality for administrative, clinical or agronomic terminology.

For every PS: use explicit `country`, `input_locale`, `output_locale`, `speech_model`, `speech_region`, `translation_model`, `taxonomy_version`, and `source_ids`. Demonstrate India and Brazil configuration changes using the same normalized contract. Neither language support nor a second-country dataset proves deployability across all BRICS members.
''')
write('ps1-citizen-feedback.md','''# PS1 — Citizen feedback
**Recommendation: first choice, provisional pending full official PS.** Build a multilingual feedback-to-review workflow with evidence-linked routing and correction history. A fresh user submission supplies genuine input without pretending to have government complaint-system access.

## Data actually checked
- India: [PIB CPGRAMS November 2024 report](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2085649&lang=2&reg=48) fetched HTTP 200; raw HTML in `samples/ps1-india.html`, readable evidence in `sources/ps1-india.md`. It reports state-level volumes (Uttar Pradesh 20,250 received, 20,255 disposed). This is real published aggregate data, **not complaint narratives, labels or an operational complaints API**.
- A direct [DARPG July 2024 PDF](https://darpg.gov.in/sites/default/files/2024-07-01-state.pdf) was also probed: final result is in `final-probes.json`; do not infer success from the URL alone.
- Brazil comparison: Recife's official [Ouvidoria dataset](https://dados.recife.pe.gov.br/dataset/manifestacoes-recebidas-via-ouvidoria) is discoverable with CSV resources and describes complaint content, processing and status. Both live CKAN search and package-show probes failed with connection-reset/TLS errors **after escalation**. No CSV row was downloaded: comparable dataset discovered, availability **not validated**. Do not claim a completed Brazilian complaints-data integration.

## Google AI fit and limits
Gemini extracts category candidates, locations and supporting text spans into a schema; deterministic jurisdiction/category configuration and a reviewer determine routing. Speech-to-Text supplies short voice intake; Translation NMT supplies accessible summaries. See [verified limits and Indian/Brazilian language matrix](google-ai-validation.md). Keep original text alongside translations; require user correction for misheard names. No authenticated model call was tested.

## Prior art and differentiation
[JanMitra AI](https://github.com/theabhishek4u/JanMitra-AI), fetched HTTP 200 (`sources/prior-civic.md`), already advertises Gemini multimodal categorization, speech intake, routing and hotspot clustering. Those features alone are not original. This is repository self-description, not verified deployment performance. Prefer a narrow differentiator: route uncertainty made visible, source-backed jurisdiction rules, reviewer overrides and an auditable before/after result. Novelty remains a hypothesis; no exhaustive competition scan was performed.

## Honest demo and portability
Show Hindi/Tamil text or short speech → editable transcript → structured issue with quoted evidence → reviewer confirms a proposed route → tracking card. Switch to Portuguese and a Brazil-specific taxonomy without changing flow code. Use a clearly labelled fictional municipality routing configuration until real routing rules are fetched. Never imply actual government submission.

Use fresh participant input as user-provided data. Authored sample grievances must carry `synthetic=true`; historical PIB aggregates can supply contextual charts only. A fixture fallback is permitted as a design option, not a verified dataset. Evaluate 10–20 labelled examples for category accuracy and abstention; this is a proposed validation, not a completed result.

**Remaining gate:** exact PS, real municipal taxonomy and a successful Brazilian complaint sample. This research does not establish access to Indian complaint-level public data.
''')
write('ps2-air-quality.md','''# PS2 — Air quality
**Recommendation: second choice for a historical exposure explainer; live local AQI remains unvalidated.**

## Verified downloads
[World Bank India endpoint](https://api.worldbank.org/v2/country/IND/indicator/EN.ATM.PM25.MC.M3?format=json&date=2020&per_page=2) and [Brazil endpoint](https://api.worldbank.org/v2/country/BRA/indicator/EN.ATM.PM25.MC.M3?format=json&date=2020&per_page=2) returned HTTP 200 JSON and non-null observations. Raw samples: `samples/ps2-india.json`, `samples/ps2-brazil.json`.

| Country | Observation year | Mean annual PM2.5 exposure, µg/m³ |
|---|---|---|
| India | 2020 | 52.1933674059995 |
| Brazil | 2020 | 13.6658296866126 |

These are historical national exposure estimates. They are **not current AQI, station measurements, ward-level pollution or a forecast**. The shared indicator gives a real cross-country schema test, not evidence of local coverage. Source metadata reports update date 2026-07-13, which must not replace observation year.

## Indian operational sources and blockers
[CPCB/data.gov.in resource](https://www.data.gov.in/resource/real-time-air-quality-index-various-locations) returned HTTP 200 but the static extraction exposed a page shell without usable records; no live pollution sample verified. [Bhuvan](https://bhuvan.nrsc.gov.in/home/index.php) returned a portal page, not a downloadable raster. The probed [IMD API document](https://mausam.imd.gov.in/imd_latest/contents/api.pdf) returned 404. These are bounded endpoint results, not claims that the institutions have no open data.

[Brazil OpenAQ probe](https://api.openaq.org/v3/locations?iso=BRA&limit=1) returned an unauthorized message requiring `X-API-Key`; no station row verified. The World Bank Brazil sample is the validated comparable fallback.

## Google AI fit
Gemini can explain supplied observations and produce cited structured summaries; calculate comparisons deterministically. Translation/Speech support accessible intake and playback text; see [limits/languages](google-ai-validation.md). Never ask Gemini to invent PM2.5, forecast values or health thresholds. Medical advice is outside this proposed scope.

## Prior art
[GA-KELM-AQI-Predictor](https://github.com/Akhila-Dubasi/GA-KELM-AQI-Predictor), fetched HTTP 200 (`sources/prior-air.md`), advertises maps, forecast analytics and a Gemini AQI assistant. Generic AQI dashboard plus chatbot has close prior art; claimed prediction accuracy was not assessed. Differentiate through observation-age visibility, missing-data handling and explicit cross-country indicator definitions.

## Demo and portability gate
Use a historical, source-labelled India/Brazil comparison with explanation and language switch. Normalize `{country, indicator, value, unit, observed_period, fetched_at, source_url, spatial_resolution}`; keep AQI scales separate from concentration units. A live risk/route-advice demo requires another validated station feed and documented thresholds. Synthetic station scenarios must be visibly labelled and cannot support claims of real city coverage.
''')
write('ps3-phc-supply-chain.md','''# PS3 — PHC health supply chain
**Recommendation: defer unless the team accepts an explicitly simulated stock ledger or obtains an authorized facility export.** No real Indian PHC stock/consumption transaction dataset was verified.

## Downloads and their actual meaning
- [WHO India GHO query](https://ghoapi.azureedge.net/api/WHOSIS_000001?$filter=SpatialDim%20eq%20%27IND%27&$top=2) returned HTTP 200 and two observations; retained in `sources/who.md`. One record is India male life expectancy, 2018, NumericValue 68.875555990. This proves accessible health statistics, **not facility inventory, medicine demand, procurement or stockout data**. The query is not ordered; the first record is not necessarily latest.
- Brazil: the initial `/v1/cnes/estabelecimentos` endpoint returned 404. Official API discovery revealed the corrected [CNES endpoint](https://apidadosabertos.saude.gov.br/cnes/estabelecimentos?limit=2&offset=0), which returned HTTP 200 JSON. `samples/ps3-brazil.json` contains facility records with CNES identifiers, names, municipality-related fields, facility type and address. This validates a facility-directory adapter only, not medicine inventory or PHC-only coverage. Avoid rendering unnecessary contact fields in the demo.
- No data.gov.in inventory download was established in this bounded scan; do not infer that WHO or CNES can train a demand predictor.

## Google AI fit
Gemini can normalize an uploaded stock sheet into a schema and explain deterministic reorder/transfer suggestions with source-row references. Human confirmation must precede ledger changes. Code calculates quantities, expiries and balance conservation. Translation supports staff-facing labels; short Speech-to-Text intake is optional. See [fetched docs and limits](google-ai-validation.md). No clinical diagnosis, dosing or substitution is proposed.

## Prior art
[PharmStock repository](https://github.com/archer-paul/pharmacy-inventory-management), fetched HTTP 200 (`sources/prior-health.md`), already describes Gemini medication-image extraction, expiry/batch information and inventory management deployed through Google Cloud. An AI stock dashboard alone is weak differentiation; repository claims are not measured operational evidence. The earlier HealthGrid winner claim surfaced only in a participant social post and was not independently verified; do not cite it as an official winner record.

## Honest demonstration
Use a labelled synthetic ledger for three fictional clinics and two products, a documented deterministic consumption assumption, then show an impending shortage and a reviewer-approved simulated transfer. Keep WHO context and genuine Brazil facility records separate from the fictional ledger. No real shortage prediction, reduction in wastage or PHC integration can be claimed from this evidence.

Portable adapters should normalize facility IDs, product codes, unit conversions, currency, expiry formats and jurisdiction-specific transfer policy. A CNES directory establishes schema portability only. Country-config changes cannot supply missing inventory authority or clinical validation.
''')
write('ps4-agri-advisory.md','''# PS4 — Agricultural advisory
**Recommendation: third choice; limit to evidence-grounded historical crop information unless a current local weather/advisory feed is verified.**

## Real sample data
- [World Bank India cereal yield](https://api.worldbank.org/v2/country/IND/indicator/AG.YLD.CREL.KG?format=json&date=2022&per_page=2) returned HTTP 200 JSON: 2022 value **3564 kg/hectare**. Raw file: `samples/ps4-india.json`. National historical aggregate, not farm yield, crop suitability or a recommended input dose.
- [Brazil IBGE production query](https://servicodados.ibge.gov.br/api/v3/agregados/5457/periodos/2023/variaveis/214?localidades=N1%5Ball%5D&classificacao=782%5B40124%5D) returned HTTP 200 with Brazil soybean production in 2023: **152144238 tonnes**, category `Soja (em grão)`, variable `Quantidade produzida`; `sources/br-agri.md`. This is a real agriculture portability sample. Production tonnes and yield kg/hectare are different measures and must not share a comparison chart.

## Sources attempted, not validated as usable feeds
[Agmarknet data.gov.in page](https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi) returned HTTP 200 but no usable record export in static extraction. No mandi price sample verified. [FAOSTAT filtered API](https://fenixservices.fao.org/faostat/api/v1/en/data/QCL?area_code=100&year=2023&item_code=15&element_code=5510) timed out after escalation; this does not establish that FAO is unavailable globally. [Bhuvan](https://bhuvan.nrsc.gov.in/home/index.php) exposed a portal, not a tested raster download. The attempted [IMD API PDF](https://mausam.imd.gov.in/imd_latest/contents/api.pdf) returned 404. No current field weather observation or official agronomic prescription was verified.

## Google AI fit and language limits
Gemini can answer questions only from uploaded, source-labelled agronomic material and explain normalized historical indicators. Schema output includes `source_ids`, `observed_period`, `crop`, `unit` and `unknowns`. Translation NMT plus short speech intake fits Indian languages and Portuguese; [validated documentation](google-ai-validation.md) lists the exact subset and quota caveats. Language coverage does not establish agronomic correctness. Keep unsupported recommendations unanswered.

## Prior art
[FarmGenius](https://github.com/SnoozeScript/404), fetched HTTP 200 (`sources/prior-agri.md`), already advertises Gemini chat, disease diagnosis, mandi forecasting and yield prediction. Those broad features are crowded; README claims are not validated model accuracy. A narrow provenance-first crop question flow could differentiate, but originality is not established by this quick scan.

## Demo and portability
Show a crop question → retrieve a verified historical statistic → source/date/unit-aware answer → Portuguese country switch. The country adapter must map crop taxonomy, units, season calendar and observation granularity, not merely translate labels. Do not compare unlike IBGE production and World Bank yield as equivalent indicators. Farm photographs, weather shocks or advisory documents authored by the team are explicitly synthetic fixtures; no pesticide doses or yield forecasts should be fabricated.
''')
write('README.md','''# Research handoff — 2026-09-11
Provisional order: **PS1 citizen feedback**, PS2 historical air-quality explanation, PS4 narrow crop-information assistant, PS3 simulated inventory workflow. This is an implementation-risk judgment, not a verified judging score. Full official problem statements are missing from the supplied attachment.

- [PS1 citizen feedback](ps1-citizen-feedback.md)
- [PS2 air quality](ps2-air-quality.md)
- [PS3 PHC supply chain](ps3-phc-supply-chain.md)
- [PS4 agricultural advisory](ps4-agri-advisory.md)
- [Google AI docs, limits and language coverage](google-ai-validation.md)
- [Official-rule verification](official-rules.md)
- [Source log](source-log.md); machine evidence: `scrapling-log.json`, `final-probes.json`

All files are research only. No application or dependency installation was performed. First Scrapling attempts hit sandbox DNS failures; essential probes were rerun with `require_escalated`. The saved Scrapling log contains the escalated results and must not be read as initial sandbox evidence. API responses and observations were inspected; HTTP 200 alone does not establish usable data, recency, license or operational fit.

Verified machine-readable data: India/Brazil historical PM2.5, India cereal yield, Brazil crop production, WHO India health statistics and Brazil facility directory. None verifies real-time Indian AQI, current mandi prices, complaint-level Indian narratives or PHC inventory. Recife is a discovered but inaccessible civic comparison. Dataset licensing/reuse terms were not independently validated beyond official public endpoint access; preserve attribution and check terms before redistribution.

Prior-art repositories were fetched for all four PS. The short scan establishes close feature overlap, not exhaustive saturation or winner status. No authenticated Google AI calls, translation quality tests or forecasting evaluation were performed.
''')
