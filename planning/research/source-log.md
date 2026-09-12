# Source log — 2026-09-11

All essential Scrapling requests were retried outside the sandbox with require_escalated. Initial sandbox DNS errors are not source-availability evidence. The log below records eventual escalated results. Raw sample curl downloads followed Scrapling, preserving JSON/PDF bytes when possible.

| Source | URL | Eventual result | Evidence |
|---|---|---|---|
| rules | https://hack2skill.com/event/codeforcommunities2 | HTTP 200 | sources/rules.md |
| gdg | https://gdg.community.dev/events/details/google-gdg-cloud-bhubaneswar-presents-code-for-communities-20/ | HTTP 200 | sources/gdg.md |
| speech-languages | https://cloud.google.com/speech-to-text/v2/docs/speech-to-text-supported-languages | HTTP 200 | sources/speech-languages.md |
| speech-limits | https://cloud.google.com/speech-to-text/v2/quotas | HTTP 200 | sources/speech-limits.md |
| translation-languages | https://cloud.google.com/translate/docs/languages | HTTP 200 | sources/translation-languages.md |
| translation-limits | https://cloud.google.com/translate/quotas | HTTP 200 | sources/translation-limits.md |
| gemini-limits | https://ai.google.dev/gemini-api/docs/rate-limits | HTTP 200 | sources/gemini-limits.md |
| gemini-structured | https://ai.google.dev/gemini-api/docs/structured-output | HTTP 200 | sources/gemini-structured.md |
| cpcb | https://www.data.gov.in/resource/real-time-air-quality-index-various-locations | HTTP 200 | sources/cpcb.md |
| agmarknet | https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi | HTTP 200 | sources/agmarknet.md |
| bhuvan | https://bhuvan.nrsc.gov.in/home/index.php | HTTP 200 | sources/bhuvan.md |
| imd | https://mausam.imd.gov.in/imd_latest/contents/api.pdf | HTTP 404 | sources/imd.md |
| who | https://ghoapi.azureedge.net/api/WHOSIS_000001?$filter=SpatialDim%20eq%20%27IND%27&$top=2 | HTTP 200 | sources/who.md |
| br-health | https://apidadosabertos.saude.gov.br/v1/cnes/estabelecimentos?limit=2&offset=0 | HTTP 404 | sources/br-health.md |
| br-civic | https://dados.recife.pe.gov.br/api/3/action/package_search?q=ouvidoria&rows=1 | TLS/connection reset | No response body; see machine log |
| br-agri | https://servicodados.ibge.gov.br/api/v3/agregados/5457/periodos/2023/variaveis/214?localidades=N1[all]&classificacao=782[40124] | HTTP 200 | sources/br-agri.md |
| br-air | https://api.openaq.org/v3/locations?iso=BRA&limit=1 | HTTP 401 | sources/br-air.md |
| fao | https://fenixservices.fao.org/faostat/api/v1/en/data/QCL?area_code=100&year=2023&item_code=15&element_code=5510 | timeout | No response body; see machine log |
| ps1-india | https://www.pib.gov.in/PressReleasePage.aspx?PRID=2085649&lang=2&reg=48 | HTTP 200; raw 200 text/html; charset=utf-8; 142216 bytes | sources/ps1-india.md |
| ps1-brazil | https://dados.recife.pe.gov.br/api/3/action/package_show?id=manifestacoes-recebidas-via-ouvidoria | TLS/connection reset; raw 000 ; 0 bytes | No response body; see machine log |
| ps2-india | https://api.worldbank.org/v2/country/IND/indicator/EN.ATM.PM25.MC.M3?format=json&date=2020&per_page=2 | HTTP 200; raw 200 application/json;charset=utf-8; 350 bytes | sources/ps2-india.md |
| ps2-brazil | https://api.worldbank.org/v2/country/BRA/indicator/EN.ATM.PM25.MC.M3?format=json&date=2020&per_page=2 | HTTP 200; raw 200 application/json;charset=utf-8; 351 bytes | sources/ps2-brazil.md |
| ps3-brazil | https://apidadosabertos.saude.gov.br/cnes/estabelecimentos?limit=2&offset=0 | HTTP 200; raw 200 application/json; 3250 bytes | sources/ps3-brazil.md |
| ps4-india | https://api.worldbank.org/v2/country/IND/indicator/AG.YLD.CREL.KG?format=json&date=2022&per_page=2 | HTTP 200; raw 200 application/json;charset=utf-8; 294 bytes | sources/ps4-india.md |
| prior-civic | https://github.com/theabhishek4u/JanMitra-AI | HTTP 200 | sources/prior-civic.md |
| prior-air | https://github.com/Akhila-Dubasi/GA-KELM-AQI-Predictor | HTTP 200 | sources/prior-air.md |
| prior-health | https://github.com/archer-paul/pharmacy-inventory-management | HTTP 200 | sources/prior-health.md |
| prior-agri | https://github.com/SnoozeScript/404 | HTTP 200 | sources/prior-agri.md |
| cpgrams-pdf | https://darpg.gov.in/sites/default/files/2024-07-01-state.pdf | timeout; raw 000 ; 0 bytes | No response body; see machine log |
| rules dynamic | https://hack2skill.com/event/codeforcommunities2 | HTTP 200 after browser retry; full PS and rules recovered | sources/rules-dynamic.md; rules-dynamic.log |

## Content interpretation
- HTTP 200 on CPCB/Agmarknet/Bhuvan established page access only, not a dataset download.
- WHO and IBGE contain real observations. CNES corrected endpoint contains facilities, not stock. World Bank samples contain non-null historical observations.
- OpenAQ response explicitly requests an API key. Recife reset persists after escalation. FAOSTAT and DARPG PDF timed out; neither is asserted permanently unavailable.
- Prior-art GitHub pages were fetched; their claims were not independently performance-tested.
- Initial CNES /v1 URL failed; corrected endpoint succeeded. See both records above.

## Downloaded sample integrity
- `ps1-india.html`: 142216 bytes; SHA-256 `9ecac331452724fde4e157ea805488a29913101ac809abc50141a0193b4a81d0`.
- `ps2-brazil.json`: 351 bytes; SHA-256 `e8c5ff117b00849386e4fae1c19db1920c8fc0b7f20b7781651fb6084418b1e8`.
- `ps2-india.json`: 350 bytes; SHA-256 `83ba8d87db77a92f34973db9b7a774c3d82aaed5e24f66818519dfdd74122fa8`.
- `ps3-brazil.json`: 3250 bytes; SHA-256 `c46ae85b63f89727991532d7518c5f2b14f9a04020db77dde28a34f396b0a176`.
- `ps3-india.json`: 1714 bytes; SHA-256 `71003fe2360466393193cbb506ec8525b56966805fee468719d7056dfee894ac`.
- `ps4-brazil.json`: 706 bytes; SHA-256 `183a9c5d0345d6ab7f9d4562a1676a47edc666ddfa100d9e668283aa7a9ce9f2`.
- `ps4-india.json`: 294 bytes; SHA-256 `8eee2a72e5e0ca863ed29ed3b03411846517e220bfa804a267517a31e2fb6cdd`.
