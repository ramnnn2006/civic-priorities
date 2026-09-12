# Council evidence and verdict

Six independent advisor calls and six final blind reviewer calls completed through separate ephemeral Codex CLI sessions, launched in parallel within each stage by run_council.py. The dedicated validation agent saved final-spec.md before hitting its usage limit. The parent orchestrator completed the evidence audit, fixed Unicode span semantics and comparison-group clarity, and wrote this process record. No new opinions or rankings were invented.

| Lens | Requested CLI model | Mean rank, lower is better |
|---|---|---:|
| Domain Specialist | gpt-6-astra | 2.0000 |
| Assumption Ripper | gpt-5.6-sol | 2.6667 |
| Expansionist | gpt-5.6-terra | 3.3333 |
| Contrarian | gpt-6-astra | 3.6667 |
| Outsider | gpt-5.6-luna | 3.8333 |
| Executor | gpt-5.5 | 5.5000 |

These are five requested model identifiers across six lenses. Successful CLI calls establish that the configured requests completed; this log does not independently attest the provider's underlying model routing. Each reviewer used a fresh context, no persona or author/model mapping, and was instructed not to call tools. Independent contexts reduce shared-answer contamination but do not guarantee independent training or unbiased judgments.

- [Question and supplied context](question.txt).
- Advisor originals: advisor-1.md through advisor-6.md, with prompts, status JSON, CLI JSONL and stderr.
- [Anonymized answer packet](blind-packet.txt), shuffled with seed 94504; chair-mapping.json was withheld from reviewers.
- Final reviews: review-1.md through review-6.md, each with a complete A–F ranking.
- [Aggregate calculation](aggregate.json): six rank positions, sums and means for every answer.
- [Final synthesized build spec](../final-spec.md): decision, changes, retained choices, disagreements and implementation gates.

An initial review batch exposed self-identifying role language in response text. It was superseded after that language was removed; its files are preserved in superseded-unblinded-reviews/ for transparency and excluded from the final aggregate. The original six advisor answers were retained. The final anonymized packet contains no advisor labels or model IDs. Role writing styles may still be inferable; anonymity is not a guarantee that reviewers cannot guess a lens.

The parent independently parsed all six final FINAL RANKING blocks, checked each contains A–F once, and recomputed positions and means against aggregate.json. All final reviewer status files report successful responses. The council evaluates the design; it does not prove application functionality, model accuracy, operational data access or future judging outcomes.
