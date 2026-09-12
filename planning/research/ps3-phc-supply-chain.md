# PS3 — PHC health supply chain
**Recommendation: defer unless the team accepts an explicitly simulated stock ledger or obtains an authorized facility export.** No real Indian PHC stock/consumption transaction dataset was verified.
**Official-scope update:** Official PS also covers bed availability and staff attendance, federated modelling and cross-district redistribution. Realistic sample data is explicitly allowed, making a simulated ledger viable, but facility directories alone are insufficient. Include the wider requirements in the architecture and identify implemented versus planned scope. See [rules](official-rules.md).


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
