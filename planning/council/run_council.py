"""Planning-only council runner; stdlib, no installs, no application changes."""
import concurrent.futures, json, pathlib, random, re, subprocess, time, sys

ROOT = pathlib.Path(__file__).resolve().parent
PLAN = ROOT.parent
MODELS = ['gpt-6-astra','gpt-5.6-sol','gpt-5.6-terra','gpt-5.6-luna','gpt-5.5','gpt-6-astra']
LENSES = [
 ('Contrarian','Steelman rejecting the default. Name hidden costs; attack novelty and judging fit.'),
 ('Assumption Ripper','Expose false premises; rebuild from first principles, especially denominators, missingness and scoring.'),
 ('Expansionist','Reframe bigger; identify a distinctive adjacent move while keeping a shippable core.'),
 ('Outsider','Use a different-field analogy; ignore sacred cows and expose the question others miss.'),
 ('Executor','Specify shipping order, time budget, failure modes, cut lines and concrete acceptance gates.'),
 ('Domain Specialist','Guard technical accuracy: schemas, arithmetic, joins, evidence, AI limits, DPG and portability.')]
QUESTION = '''Validate the finalized PS1 CivicPriorities candidate for Build with AI: Code for Communities. Attack feasibility for 1–4 people, originality versus JanMitra, judging weights 25% AI execution / 20% deployability / 20% India depth / 20% problem fit / 15% impact, and concrete BRICS portability. Recommend exact scoring/contracts, missing-data gates, required changes and retained choices. Preserve voice/text/messaging intake, request aggregation, demographics/infrastructure/investment joins, hotspots, development-project recommendations to policymakers, DPG design and national-scale architecture. Planning only; no quality/deployment claims. Target a real 3–5 minute demo. Do not build anything.'''
CONTEXT = '\n\n'.join((PLAN/p).read_text() for p in ['candidate-spec.md','research/official-rules.md','research/ps1-citizen-feedback.md','research/google-ai-validation.md'])
CONTEXT += '\nDESIGN: React/Vite/TS, semantic split hero, Magic UI Bento Grid; registry URLs fetched but installs/build/licenses untested. Optional Blur Fade; globe/Skiper reserve. No 3D needed. Keyboard, reduced motion, visible synthetic/live labels required. Architecture: single Cloud Run Node/Express service, Firestore sessions; Zod; Gemini Developer API, STT V2 chirp_2, Translation NMT. No authenticated provider calls yet.'

def invoke(stage, idx, prompt):
    stem=f'{stage}-{idx+1}'
    (ROOT/f'{stem}-prompt.txt').write_text(prompt)
    command=['codex','exec','--ephemeral','--skip-git-repo-check','-s','read-only','-m',MODELS[idx],'-c','model_reasoning_effort="low"','--json','-o',str(ROOT/f'{stem}.md'),'-']
    started=time.time()
    try:
        result=subprocess.run(command,input=prompt,text=True,capture_output=True,timeout=130,cwd='/tmp')
        (ROOT/f'{stem}.jsonl').write_text(result.stdout)
        (ROOT/f'{stem}.stderr').write_text(result.stderr)
        status={'stage':stage,'index':idx+1,'requested_model':MODELS[idx],'exit_code':result.returncode,'seconds':round(time.time()-started,2)}
    except subprocess.TimeoutExpired as e:
        (ROOT/f'{stem}.stderr').write_text('Timed out after 130 seconds')
        status={'stage':stage,'index':idx+1,'requested_model':MODELS[idx],'exit_code':None,'error':'timeout'}
    path=ROOT/f'{stem}.md'
    status['has_response']=path.exists() and bool(path.read_text().strip())
    (ROOT/f'{stem}-status.json').write_text(json.dumps(status,indent=2))
    print(json.dumps(status),flush=True)
    return path.read_text() if status['has_response'] else None

if __name__ == '__main__':
    (ROOT/'question.txt').write_text(QUESTION+'\n\n'+CONTEXT)
    if '--review-only' in sys.argv:
        answers=[(ROOT/f'advisor-{i+1}.md').read_text() for i in range(6)]
    else:
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            pending=[pool.submit(invoke,'advisor',i,f'No tools, browsing, file reads or other agents. Answer solely from supplied context. You are the {name}. Lens: {lens}\nAnswer independently in at most 250 words. Be decisive. End with one clear recommendation.\nQUESTION:\n{QUESTION}\nCONTEXT:\n{CONTEXT}') for i,(name,lens) in enumerate(LENSES)]
            answers=[f.result() for f in pending]
    if not all(answers):
        (ROOT/'INCOMPLETE.md').write_text('Some real advisor calls failed. No fabricated responses, reviews or rankings. Inspect status files.\n')
        raise SystemExit(2)
    order=list(range(6)); random.Random(94504).shuffle(order)
    mapping={chr(65+i):{'advisor':LENSES[j][0],'index':j+1,'requested_model':MODELS[j]} for i,j in enumerate(order)}
    # Mapping is kept out of every reviewer prompt; all reviewers have fresh contexts.
    (ROOT/'chair-mapping.json').write_text(json.dumps(mapping,indent=2))
    def anonymize(answer):
        for identity in [name for name,_ in LENSES]+MODELS:
            answer=re.sub(r'(?im)^\s*(?:#+\s*)?(?:\*\*)?'+re.escape(identity)+r'(?:\s+verdict)?(?:\*\*)?\s*[:—–-]\s*','',answer)
        return answer
    packet='\n\n'.join(f'Response {chr(65+i)}:\n{anonymize(answers[j])}' for i,j in enumerate(order))
    (ROOT/'blind-packet.txt').write_text(packet)
    review_prompt=f'No tools, file reads, browsing or other agents. Judge ONLY accuracy, depth, usefulness and decisiveness. Author/model identities are withheld. Give each response a one-line verdict. Maximum 150 words. End with EXACTLY this format (replace underscores; use each letter once):\nFINAL RANKING:\n1. Response _\n2. Response _\n3. Response _\n4. Response _\n5. Response _\n6. Response _\nQUESTION:\n{QUESTION}\nCONTEXT:\n{CONTEXT}\nANSWERS:\n{packet}'
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        pending=[pool.submit(invoke,'review',i,review_prompt) for i in range(6)]
        reviews=[f.result() for f in pending]
    ranks=[]
    for review in reviews:
        letters=re.findall(r'^\d\. Response ([A-F])\s*$', (review or '').split('FINAL RANKING:')[-1],re.M)
        if len(letters)!=6 or set(letters)!=set('ABCDEF'):
            raise SystemExit('Incomplete or invalid review ranking; no aggregate published')
        ranks.append({letter:i+1 for i,letter in enumerate(letters)})
    rows=[]
    for letter,identity in mapping.items():
        positions=[r[letter] for r in ranks]
        rows.append({'letter':letter,**identity,'positions':positions,'sum':sum(positions),'mean':sum(positions)/6})
    rows.sort(key=lambda r:(r['mean'],r['letter']))
    (ROOT/'aggregate.json').write_text(json.dumps({'seed':94504,'reviewer_count':6,'tie_break':'equal means remain tied; alphabetical display only','results':rows},indent=2))
    print('COMPLETE',flush=True)
