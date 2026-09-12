# PS4 — Agricultural advisory
**Recommendation: third choice; limit to evidence-grounded historical crop information unless a current local weather/advisory feed is verified.**
**Official-scope update:** Official PS requires local satellite/soil/weather-aware regenerative advice and disease diagnosis. Historical statistics alone are **not full PS compliance**. Realistic samples are allowed, but an advisory/disease pipeline still needs a working, clearly bounded demonstration; no agronomic model accuracy was verified here. See [rules](official-rules.md).


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
