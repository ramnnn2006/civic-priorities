# PS2 — Air quality
**Recommendation: second choice for a historical exposure explainer; live local AQI remains unvalidated.**
**Official-scope update:** Official PS requires citizen/sensor/satellite/meteorological fusion, hotspot detection and forecasting. The historical-only alternative below is a data-safe fallback, **not full PS compliance**. A credible submission needs an explicitly labelled realistic event scenario and a working bounded hotspot/forecast flow; no such model was validated here. See [rules](official-rules.md).


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
