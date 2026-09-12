from pathlib import Path
import json,re,hashlib
r=Path('planning/research')
u='https://hack2skill.com/event/codeforcommunities2'
r.joinpath('official-rules.md').write_text('''# Official rules verified — 2026-09-11

[Official Hack2skill event page](https://hack2skill.com/event/codeforcommunities2) was fetched successfully with Scrapling CLI browser mode using installed `/usr/bin/chromium` after static extraction produced only a page shell. Dynamic request initially timed out, then its retry returned HTTP 200. Evidence: `sources/rules-dynamic.md` and `rules-dynamic.log`. No browser install was needed.

## Confirmed constraints

| Item | Official evidence |
|---|---|
| Team | 1–4; solo participation supported |
| AI | Meaningful Google AI integration is mandatory |
| Functionality | Working end-to-end prototype for the track's core use case |
| Data | Real **or realistic** public/sample/API data accepted where live data is unavailable |
| Submission | Public or access-granted GitHub repository; 3–5 minute demo video; 10–12 slide pitch deck; 2–3 line description; live deployed prototype link |
| India scope | Architecture should scale across states/communities; full localization everywhere is not required for the prototype |
| Cross-border | Rules explicitly ask for applicability across BRICS nations |
| Originality | Build during hackathon; pre-existing projects require substantial extension; cite properly licensed reused components |

## Confirmed judging weights

| Criterion | Weight |
|---|---|
| AI/Technical Execution | 25% |
| Deployability & Scalability | 20% |
| Depth & Reach Across India | 20% |
| Problem-Solution Fit | 20% |
| Impact Potential | 15% |

The user's quoted weights are verified, though abbreviated labels differ. No points are guaranteed by adding more Google products.

## Full problem statements recovered

The complete official problem and challenge wording is archived in `sources/rules-dynamic.md`, under “Problem statements”. The source, rather than a reconstructed quotation, is authoritative. Concise scope mapping:

- PS1: aggregate multilingual **development requests**, combine with demographics, infrastructure indices and investment plans, find demand hotspots and recommend development projects. Ordinary grievance routing alone does not satisfy this scope.
- PS2: combine citizen photos/sensors, satellite and meteorological data for hidden pollution hotspots, forecasts and coordination across jurisdictions. Historical national statistics alone do not satisfy the core use case.
- PS3: medicine stock, beds and attendance visibility across PHCs, demand warnings and cross-district resource redistribution with federated modelling. Facility directories alone do not meet it.
- PS4: localized agro-advisories integrating satellite, soil and weather, regenerative crop recommendations and crop-disease diagnosis; interoperable cross-state agricultural infrastructure. A historical crop chatbot alone is insufficient.

## Consequence for recommendation

Keep PS1 **only with a development-investment planning flow**. Realistic fixtures are explicitly permitted; label fictional demographic/infrastructure/investment inputs and demonstrate an actual computation/model call over them. Data realism does not establish measured national impact. Final implementation scope must be reconciled with the recovered full text before council approves it.

The page currently displays registration ending September 30 and an October demo day. Dates are mutable; this research prioritizes the verified submission requirements above.
''')
p=r/'ps1-citizen-feedback.md';s=p.read_text();s=s.replace('**Recommendation: first choice, provisional pending full official PS.** Build a multilingual feedback-to-review workflow with evidence-linked routing and correction history. A fresh user submission supplies genuine input without pretending to have government complaint-system access.','**Recommendation: first choice, revised against the recovered official PS.** Build multilingual development-request aggregation into evidence-backed infrastructure investment priorities. Full official scope and rules are now verified in [official-rules.md](official-rules.md). A complaint-routing app alone is insufficient. Realistic sample data is explicitly allowed.')
s=s.replace('Gemini extracts category candidates, locations and supporting text spans into a schema; deterministic jurisdiction/category configuration and a reviewer determine routing.','Gemini extracts development needs, locations and supporting text spans, then clusters equivalent requests and drafts a cited project rationale. Deterministic scoring combines demand with demographic/infrastructure gaps and proposed budget constraints; a reviewer approves the recommendation.')
s=s.replace('Prefer a narrow differentiator: route uncertainty made visible, source-backed jurisdiction rules, reviewer overrides and an auditable before/after result.','Prefer a narrow differentiator: auditable project prioritization with explicit missing evidence, a demographic/infrastructure gap score, and a sensitivity control showing how priorities change when policy weights change. The supplied policy weights are demo assumptions until sourced; do not confuse them with judging weights.')
s=s.replace('Show Hindi/Tamil text or short speech → editable transcript → structured issue with quoted evidence → reviewer confirms a proposed route → tracking card. Switch to Portuguese and a Brazil-specific taxonomy without changing flow code. Use a clearly labelled fictional municipality routing configuration until real routing rules are fetched. Never imply actual government submission.','Show Hindi/Tamil development request → editable transcript → needs cluster → join labelled sample population/infrastructure/investment rows → ranked project proposal with evidence → reviewer changes a weight and sees the result update. Switch to Portuguese and a Brazil-specific project taxonomy without changing flow code. Show voice/text now; represent messaging intake as a labelled import adapter unless an actual integration is built. Never imply government adoption or actual investment approval.')
s=s.replace('**Remaining gate:** exact PS, real municipal taxonomy and a successful Brazilian complaint sample. This research does not establish access to Indian complaint-level public data.','**Remaining data gaps:** verified demographic/infrastructure/investment-plan joins, a real project taxonomy and a successful Brazilian request sample. Use explicit realistic fixtures for the missing joins under the official allowance. This research does not establish access to Indian complaint-level public data or validate a national investment model.')
p.write_text(s)
for f,txt in [('ps2-air-quality.md','Official PS requires citizen/sensor/satellite/meteorological fusion, hotspot detection and forecasting. The historical-only alternative below is a data-safe fallback, **not full PS compliance**. A credible submission needs an explicitly labelled realistic event scenario and a working bounded hotspot/forecast flow; no such model was validated here.'),('ps3-phc-supply-chain.md','Official PS also covers bed availability and staff attendance, federated modelling and cross-district redistribution. Realistic sample data is explicitly allowed, making a simulated ledger viable, but facility directories alone are insufficient. Include the wider requirements in the architecture and identify implemented versus planned scope.'),('ps4-agri-advisory.md','Official PS requires local satellite/soil/weather-aware regenerative advice and disease diagnosis. Historical statistics alone are **not full PS compliance**. Realistic samples are allowed, but an advisory/disease pipeline still needs a working, clearly bounded demonstration; no agronomic model accuracy was verified here.')]:
 p=r/f;s=p.read_text();lines=s.splitlines();lines.insert(2,'**Official-scope update:** '+txt+' See [rules](official-rules.md).\n');p.write_text('\n'.join(lines)+'\n')
p=r/'README.md';s=p.read_text().replace('Provisional order: **PS1 citizen feedback**, PS2 historical air-quality explanation, PS4 narrow crop-information assistant, PS3 simulated inventory workflow. This is an implementation-risk judgment, not a verified judging score. Full official problem statements are missing from the supplied attachment.','**Council recommendation: PS1 development-request aggregation and infrastructure investment prioritization.** The final browser fetch recovered the full official PS and confirmed all quoted weights, 1–4 team size, live-link and 3–5 minute demo constraints. Realistic sample data is explicitly allowed. Grievance routing alone is insufficient: demo requests → demand cluster → demographic/infrastructure/investment fixture join → evidence-backed project proposal → reviewer sensitivity change.\n\nDo not adopt the earlier historical-only PS2/PS4 fallbacks as full-scope submissions. PS3 becomes more feasible under the confirmed realistic-data allowance but still lacks real stock data. The ranking is a research judgment, not a council verdict.');p.write_text(s)
# Preserve valid JSON payloads that Scrapling extracted, reversing Markdown underscore escaping for WHO.
for ident,name in [('br-agri','ps4-brazil.json'),('who','ps3-india.json')]:
 data=json.loads((r/'sources'/f'{ident}.md').read_text().replace('\\_','_'));(r/'samples'/name).write_text(json.dumps(data,ensure_ascii=False,indent=2))
rows=json.loads((r/'scrapling-log.json').read_text())+json.loads((r/'final-probes.json').read_text())
lines=['# Source log — 2026-09-11','','All essential Scrapling requests were retried outside the sandbox with require_escalated. Initial sandbox DNS errors are not source-availability evidence. The log below records eventual escalated results. Raw sample curl downloads followed Scrapling, preserving JSON/PDF bytes when possible.','', '| Source | URL | Eventual result | Evidence |','|---|---|---|---|']
for x in rows:
 log=x.get('log','');m=re.search(r'Fetched \((\d+)\)',log);status=('HTTP '+m.group(1)) if m else ('timeout' if 'Timeout' in log or 'timed out' in log else 'TLS/connection reset' if 'reset' in log else 'error')
 ev='sources/'+x['id']+'.md' if (r/'sources'/f"{x['id']}.md").exists() else 'No response body; see machine log'
 if 'raw_status'in x:status+='; raw '+x['raw_status']+'; '+str(x.get('bytes',0))+' bytes'
 lines.append('| '+x['id']+' | '+x['url']+' | '+status+' | '+ev+' |')
lines+=['| rules dynamic | '+u+' | HTTP 200 after browser retry; full PS and rules recovered | sources/rules-dynamic.md; rules-dynamic.log |','','## Content interpretation','- HTTP 200 on CPCB/Agmarknet/Bhuvan established page access only, not a dataset download.','- WHO and IBGE contain real observations. CNES corrected endpoint contains facilities, not stock. World Bank samples contain non-null historical observations.','- OpenAQ response explicitly requests an API key. Recife reset persists after escalation. FAOSTAT and DARPG PDF timed out; neither is asserted permanently unavailable.','- Prior-art GitHub pages were fetched; their claims were not independently performance-tested.','- Initial CNES /v1 URL failed; corrected endpoint succeeded. See both records above.','','## Downloaded sample integrity']
for p in sorted((r/'samples').glob('*')):
 if p.stat().st_size:lines.append('- `'+p.name+'`: '+str(p.stat().st_size)+' bytes; SHA-256 `'+hashlib.sha256(p.read_bytes()).hexdigest()+'`.')
(r/'source-log.md').write_text('\n'.join(lines)+'\n')
print('Completed reports, official rules, source log and sample payloads.')
