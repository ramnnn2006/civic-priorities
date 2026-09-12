PS1 fits the complete brief. Feasible for 2–4 people; solo feasibility requires tiny fixtures and one reusable flow. Originality rests on auditable investment prioritization; intake and hotspots overlap JanMitra.

Retain voice/text/messaging import, aggregation, demographic/infrastructure/investment joins, hotspots, policymaker project recommendations, reviewer control and India/Brazil adapters.

Require these contracts and gates:

- **Records:** immutable ID, country, regional code system/ID/boundary version, reference period, unit, source ID/URL (nullable for fixtures), source mode, version and missingness reason. Requests additionally need original text, locale, channel, transcript revision, confirmed jurisdiction, taxonomy version and duplicate-review status.
- **Joins:** enforce unique region/category/period keys; aggregate investment rows before joining to prevent count multiplication. Reject incompatible boundaries, periods, units or infrastructure definitions.
- **Scoring:** within one fixed reporting window, let \(U\) be confirmed, conservatively deduplicated requests and \(P>0\) population. Set \(D=\min(1,(1000U/P)/T_c)\), where \(T_c>0\) is a published category-specific demo threshold. Define comparable infrastructure gap \(G\in[0,1]\). Score \(100[wD+(1-w)G]\), default \(w=0.5\). Display raw counts, denominators and saturation.
- **Eligibility:** missing required evidence blocks ranking; unknown investment status is not zero funding. Costs use integer currency units; enforce budget and funded-project overlap constraints.
- **AI:** require exact source-span validation, clarification and structured evidence references; render numerical claims deterministically.

For judging: prioritize authenticated extraction evidence (25%), deployable isolation/provenance (20%), two substantive state configurations (20%), complete planning flow (20%), and honest impact assumptions (15%).

DPG design needs licensing, privacy, open schemas/export; national architecture needs partitioned aggregates. Brazil must change currency, geography, taxonomy and policy—not merely labels.

**Recommendation: approve conditionally on these contracts and a four-minute end-to-end demo.**