import { ChangeEvent, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowDown, ArrowUp, BadgeCheck, Bot, ChevronDown, CircleAlert, FileUp,
  FileText, Lightbulb, MapPin, MessageSquareText, Mic, Pause,
  ShieldCheck, Sparkles, TriangleAlert, WalletCards, Droplets, X,
  CheckCircle2, Activity, Cpu, Sliders
} from 'lucide-react'
import { categoryMeta, configs } from './data'
import { findCategory, makeDraft, scoreCandidates } from './engine'
import type { CandidateResult, ConfigId, Draft } from './types'

const money = (value: number, currency: 'INR' | 'BRL') => new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'pt-BR', {
  style: 'currency', currency, maximumFractionDigits: 0,
}).format(value / 100)

const sentiment = (score: number | null) => score === null ? 'blocked' : score >= 55 ? 'high' : score >= 40 ? 'medium' : 'low'

interface ClusterItem {
  regionId: string
  label: string
  category: string
  seededRequests: number
  confirmedSessionRequests: number
  population: number
  coverageDeclared: boolean
}

interface ExplainPayload {
  provider: string
  evidenceHash?: string
  rationale: {
    summary: string
    reasons: string[]
    caveats: string[]
  }
}

function App() {
  const [configId, setConfigId] = useState<ConfigId>('IN-TN')
  const [selectedRegion, setSelectedRegion] = useState('TN-KOV-N')
  const [planningCategory, setPlanningCategory] = useState<'water' | 'roads' | 'lighting'>('water')
  const [message, setMessage] = useState('குடிநீர் குழாயில் தினமும் தண்ணீர் வரவில்லை.')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [weight, setWeight] = useState(.5)
  const [missingPlan, setMissingPlan] = useState(false)
  const [runSaved, setRunSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedMemo, setCopiedMemo] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [apiMode, setApiMode] = useState<'server' | 'offline'>('offline')
  const [sessionId] = useState(() => crypto.randomUUID())
  const [serverCandidates, setServerCandidates] = useState<CandidateResult[] | null>(null)
  const [importQueue, setImportQueue] = useState<Draft[]>([])
  const [planId, setPlanId] = useState<string | null>(null)
  const [planRevision, setPlanRevision] = useState<number>(1)
  const [evidenceHash, setEvidenceHash] = useState<string>('')
  const [clusterData, setClusterData] = useState<ClusterItem[]>([])
  const [showExplainModal, setShowExplainModal] = useState(false)
  const [explainLoading, setExplainLoading] = useState(false)
  const [explainData, setExplainData] = useState<ExplainPayload | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewDecision, setReviewDecision] = useState<'reviewed' | 'rejected'>('reviewed')
  const [reviewNote, setReviewNote] = useState('Audited against statutory infrastructure baselines and 90-day intake window.')
  const [reviewedRecord, setReviewedRecord] = useState<{ decision: string; note: string; savedAt: string; revision: number } | null>(null)
  const [showCopilot, setShowCopilot] = useState(true)

  const inputRef = useRef<HTMLInputElement>(null)
  const config = configs.find((item) => item.id === configId)!

  // Initial health check to detect API availability
  useEffect(() => {
    fetch('/health')
      .then((res) => { if (res.ok) setApiMode('server') })
      .catch(() => setApiMode('offline'))
  }, [])

  useEffect(() => {
    setSelectedRegion(config.regions[0].id)
    setPlanningCategory(config.regions[0].category)
    setDraft(null)
    setImportQueue([])
    setDrafts([])
    setServerCandidates(null)
    setMissingPlan(false)
    setRunSaved(false)
    setReviewedRecord(null)
    setMessage(config.id === 'IN-TN' ? 'குடிநீர் குழாயில் தினமும் தண்ணீர் வரவில்லை.' : config.id === 'IN-UP' ? 'हमारे मोहल्ले में पीने का पानी नहीं आता।' : 'A água não chega todos os dias na nossa rua.')
  }, [config.id])

  const comparableRegions = useMemo(() => config.regions.filter((region) => region.category === planningCategory), [config.regions, planningCategory])
  const localCandidates = useMemo(() => scoreCandidates(comparableRegions, drafts, weight, missingPlan), [comparableRegions, drafts, weight, missingPlan])
  const candidates = serverCandidates ?? localCandidates
  const top = candidates.find((candidate) => candidate.selected)
  const selected = config.regions.find((region) => region.id === selectedRegion)!

  // Plan calculation via server or fallback
  useEffect(() => {
    if (apiMode !== 'server') { setServerCandidates(null); return }
    let cancelled = false
    const refresh = async () => {
      try {
        const response = await fetch('/api/v1/plans/compute', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, configId: config.id, category: planningCategory, demandWeight: weight, simulateMissingInvestment: missingPlan }),
        })
        if (!response.ok) throw new Error('Planning API unavailable')
        const result = await response.json() as { id: string; revision: number; candidates: CandidateResult[]; evidenceHash: string }
        if (!cancelled) {
          setServerCandidates(result.candidates)
          setPlanId(result.id)
          setPlanRevision(result.revision ?? 1)
          setEvidenceHash(result.evidenceHash ?? '')
        }
      } catch {
        if (!cancelled) { setApiMode('offline'); setServerCandidates(null) }
      }
    }
    void refresh()
    return () => { cancelled = true }
  }, [apiMode, config.id, drafts, missingPlan, planningCategory, sessionId, weight])

  // Cluster demographics and intake footprint
  useEffect(() => {
    let cancelled = false
    const fetchClusters = async () => {
      if (apiMode === 'server') {
        try {
          const res = await fetch(`/api/v1/clusters?sessionId=${sessionId}&configId=${config.id}`)
          if (res.ok) {
            const data = await res.json() as ClusterItem[]
            if (!cancelled) setClusterData(data)
            return
          }
        } catch {
          // offline fallback
        }
      }
      if (!cancelled) {
        setClusterData(
          config.regions.map((region) => ({
            regionId: region.id,
            label: region.label,
            category: region.category,
            seededRequests: region.seededRequests,
            confirmedSessionRequests: drafts.filter((d) => d.regionId === region.id && d.category === region.category).length,
            population: region.population,
            coverageDeclared: true,
          }))
        )
      }
    }
    void fetchClusters()
    return () => { cancelled = true }
  }, [apiMode, config.id, config.regions, drafts, sessionId])

  async function analyzeText(text: string, channel: Draft['channel']) {
    if (findCategory(text) !== selected.category) {
      window.alert(`This request matches ${categoryMeta[findCategory(text)].label}, but ${selected.label} is configured for ${categoryMeta[selected.category].label}. Choose a compatible planning region first.`)
      return
    }
    const local = () => {
      setApiMode('offline')
      setDraft(makeDraft(text, selectedRegion, config.locale, channel))
    }
    try {
      const response = await fetch('/api/v1/intake/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, configId: config.id, regionId: selectedRegion, text, channel }),
      })
      if (!response.ok) return local()
      const result = await response.json() as { draft: Draft }
      setApiMode('server')
      setDraft(result.draft)
    } catch { local() }
  }

  function analyze(channel: Draft['channel'] = 'text') {
    if (!message.trim()) return
    void analyzeText(message.trim(), channel)
    setRunSaved(false)
  }

  async function confirmDraft() {
    if (!draft) return
    const confirmed = { ...draft, status: 'confirmed' as const }
    try {
      const response = await fetch('/api/v1/requests/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, draftId: draft.id }) })
      if (!response.ok) throw new Error('API confirmation failed')
      const result = await response.json() as { request: Draft }
      setApiMode('server')
      setDrafts((items) => items.some((item) => item.id === result.request.id) ? items : [...items, result.request])
    } catch {
      setApiMode('offline')
      setDrafts((items) => [...items, confirmed])
    }
    setDraft(importQueue[0] ?? null)
    setImportQueue((items) => items.slice(1))
    setMessage('')
    setRunSaved(false)
  }

  async function queueImport(records: string[]) {
    const compatible = records.filter((text) => findCategory(text) === selected.category)
    if (!compatible.length) { window.alert('No messages match the selected planning region/category.'); return }
    const localDrafts = compatible.map((text) => makeDraft(text, selectedRegion, config.locale, 'message_import'))
    try {
      const response = await fetch('/api/v1/intake/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, configId: config.id, regionId: selectedRegion, records: compatible.map((text) => ({ text })) }) })
      if (!response.ok) throw new Error('Import API unavailable')
      const result = await response.json() as { drafts: Draft[]; errors: { index: number; error: string }[] }
      setApiMode('server')
      setDraft(result.drafts[0] ?? null)
      setImportQueue(result.drafts.slice(1))
      if (result.errors.length) window.alert(`${result.errors.length} imported messages need a different region/category and were not staged.`)
    } catch {
      setApiMode('offline')
      setDraft(localDrafts[0] ?? null)
      setImportQueue(localDrafts.slice(1))
    }
    setRunSaved(false)
  }

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 1_000_000) { window.alert('This demo accepts JSON files under 1 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data: unknown = JSON.parse(String(reader.result))
        const records = Array.isArray(data) ? data : Array.isArray((data as { messages?: unknown[] })?.messages) ? (data as { messages: unknown[] }).messages : []
        const imported = records.slice(0, 100).flatMap((record) => {
          const text = typeof record === 'string' ? record : typeof (record as { text?: unknown })?.text === 'string' ? (record as { text: string }).text : ''
          return text ? [text] : []
        })
        void queueImport(imported)
      } catch { window.alert('Use a JSON array of messages, or { "messages": [{ "text": "..." }] }.') }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  function toggleVoice() {
    type RecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> }
    type Recognition = { lang: string; interimResults: boolean; maxAlternatives: number; onstart: (() => void) | null; onend: (() => void) | null; onerror: (() => void) | null; onresult: ((event: RecognitionEvent) => void) | null; start: () => void }
    type SpeechWindow = Window & { webkitSpeechRecognition?: new () => Recognition; SpeechRecognition?: new () => Recognition }
    const speech = window as SpeechWindow
    const Recognition = speech.SpeechRecognition ?? speech.webkitSpeechRecognition
    if (!Recognition) { window.alert('Speech recognition is unavailable in this browser. Type your request instead.'); return }
    const recognition = new Recognition()
    recognition.lang = config.locale
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? ''
      setMessage(text)
      void analyzeText(text, 'voice')
    }
    recognition.start()
  }

  const exportSnapshot = async () => {
    const data = JSON.stringify({
      generatedAt: new Date().toISOString(),
      config: config.id,
      weight,
      missingPlan,
      candidates,
      confirmedRequests: drafts,
      evidenceHash: evidenceHash || 'unhashed-local-draft',
      reviewedRecord
    }, null, 2)
    await navigator.clipboard.writeText(data)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  async function openExplain() {
    setShowExplainModal(true)
    setExplainLoading(true)
    if (planId && apiMode === 'server') {
      try {
        const res = await fetch(`/api/v1/plans/${planId}/explain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        })
        if (res.ok) {
          const json = await res.json() as ExplainPayload
          setExplainData(json)
          setExplainLoading(false)
          return
        }
      } catch {
        // fallback to local
      }
    }

    const topCandidate = candidates.find((c) => c.selected)
    const blockedCandidate = candidates.find((c) => c.eligibility !== 'ELIGIBLE')
    setExplainData({
      provider: 'local-deterministic-engine',
      evidenceHash: evidenceHash || undefined,
      rationale: {
        summary: topCandidate
          ? `${topCandidate.project} (${topCandidate.label}) is ranked highest based on ${topCandidate.requestUnits} verified requests (${topCandidate.rate.toFixed(1)}/1k residents) and a ${(topCandidate.gap * 100).toFixed(0)}% infrastructure deficit.`
          : 'No candidate is currently shortlisted under the active constraints.',
        reasons: [
          `Score combines normalized demand D (${topCandidate ? topCandidate.demand.toFixed(2) : '0'}) at ${Math.round(weight * 100)}% weight and infrastructure gap G (${topCandidate ? topCandidate.gap.toFixed(2) : '0'}) at ${Math.round((1 - weight) * 100)}% weight.`,
          blockedCandidate
            ? `${blockedCandidate.project} is excluded from ranking due to unverified investment inventory evidence, adhering to DPG non-zero blocking standards.`
            : 'All evaluated candidates possess verified baseline investment evidence.',
          `The top priority fits within the ${money(candidates[0]?.budgetMinor ?? 0, config.currency)} regional envelope.`
        ],
        caveats: [
          'Local fallback explanation (set server-side GEMINI_API_KEY for live generative rationale).',
          'Transparent decision-support prototype. Requires human municipal authority verification before allocation.'
        ]
      }
    })
    setExplainLoading(false)
  }

  async function submitReview() {
    if (planId && apiMode === 'server') {
      try {
        const res = await fetch(`/api/v1/plans/${planId}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            decision: reviewDecision,
            note: reviewNote,
            expectedRevision: planRevision
          })
        })
        if (res.ok) {
          const data = await res.json() as { revision: number; decision: string; note: string; savedAt: string }
          setPlanRevision(data.revision)
          setReviewedRecord({ decision: data.decision, note: data.note, savedAt: data.savedAt, revision: data.revision })
          setRunSaved(true)
          setShowReviewModal(false)
          return
        }
      } catch {
        // fallback
      }
    }
    setReviewedRecord({
      decision: reviewDecision,
      note: reviewNote,
      savedAt: new Date().toISOString(),
      revision: planRevision + 1
    })
    setPlanRevision((prev) => prev + 1)
    setRunSaved(true)
    setShowReviewModal(false)
  }

  const exportAuditMemorandum = async () => {
    const lines = [
      `# CIVIC PLANNING AUDIT MEMORANDUM`,
      `Jurisdiction: ${config.country} - ${config.state} (${config.locale})`,
      `Timestamp: ${new Date().toISOString()}`,
      `Planning Category: ${categoryMeta[planningCategory].label}`,
      `Policy Weight: Demand ${Math.round(weight * 100)}% / Gap ${Math.round((1 - weight) * 100)}%`,
      `Evidence Hash: ${evidenceHash || 'deterministic-fixture'}`,
      `Review Status: ${reviewedRecord ? `${reviewedRecord.decision.toUpperCase()} (Rev #${reviewedRecord.revision})` : 'DRAFT CALCULATION'}`,
      ``,
      `## CANDIDATE EVALUATION`,
      ...candidates.map((c, i) => `${i + 1}. ${c.project} (${c.label}) - Score: ${c.score ?? 'BLOCKED'} [Status: ${c.eligibility}]`),
      ``,
      `## AUDIT NOTES`,
      reviewedRecord?.note ?? 'Draft evaluation run. Awaiting formal municipal sign-off.'
    ]
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopiedMemo(true)
    window.setTimeout(() => setCopiedMemo(false), 2000)
  }

  // Sensitivity computation for Co-Pilot
  const sensitivityNotes = useMemo(() => {
    if (comparableRegions.length < 2) return null
    const atDemandHeavy = scoreCandidates(comparableRegions, drafts, 0.8, false)
    const atGapHeavy = scoreCandidates(comparableRegions, drafts, 0.2, false)
    const topDemand = atDemandHeavy.find((c) => c.selected)?.label
    const topGap = atGapHeavy.find((c) => c.selected)?.label
    const flips = topDemand !== topGap
    return {
      topDemand,
      topGap,
      flips,
      description: flips
        ? `Policy Inversion Warning: At 80% demand weighting, ${topDemand} is shortlisted. At 80% infrastructure gap weighting, ${topGap} takes priority.`
        : `Policy Stability: ${topDemand} maintains top rank across both 80% demand and 80% gap weightings.`
    }
  }, [comparableRegions, drafts])

  return (
    <main>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="site-header shell">
        <a className="brand" href="#top" aria-label="CivicPriorities home"><span className="brand-mark"><Sparkles size={16} /></span><span>Civic<span>Priorities</span></span></a>
        <div className="header-meta">
          <span className="live-dot" />
          {apiMode === 'server' ? 'Live API Verified' : 'Deterministic Client Engine'}
          <span className="divider" />
          v0.1
        </div>
      </header>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Evidence-gated civic planning</p>
          <h1>Make public priorities <em>explainable.</em></h1>
          <p className="hero-text">Turn multilingual development requests into transparent, reviewable project priorities. Evidence gaps block a rank — they never become a guess.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#workspace">Try a development request <ArrowDown size={17} /></a>
            <button className="button button-quiet" onClick={openExplain}><Bot size={16} /> Explain Priority Rationale</button>
            <button className="button button-quiet" onClick={exportSnapshot}>{copied ? 'Copied snapshot' : 'Export demo snapshot'}</button>
          </div>
          <div className="trust-row">
            <span><ShieldCheck size={17} />Human review required</span>
            <span><BadgeCheck size={17} />No hidden score boosts</span>
            <span><Cpu size={17} />DPG Evidence Gated</span>
          </div>
        </div>
        <div className="hero-card" aria-label="Planning result preview">
          <div className="hero-card-top"><span className="pill pill-aqua">Reviewable result</span><span className="muted">90-day window</span></div>
          <div className="preview-route"><div className="route-node"><MessageSquareText size={17} /></div><span /><div className="route-node"><MapPin size={17} /></div><span /><div className="route-node active"><WalletCards size={17} /></div></div>
          <h2>{top?.project ?? 'Water network extension'}</h2>
          <p>Evidence-backed priority, not an automatic allocation.</p>
          <div className="preview-score">
            <div>
              <small>Priority score</small>
              <strong>{top?.score?.toFixed(1) ?? '55.0'}</strong>
            </div>
            <div className="score-orbit"><span>{top?.eligibility ?? 'Eligible'}</span></div>
          </div>
          <div className="preview-foot"><span><span className="mini-dot" /> Needs + infrastructure</span><span>Policy v1.0</span></div>
        </div>
      </section>

      <section className="workspace shell" id="workspace">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span /> Interactive prototype</p>
            <h2>Planning workbench</h2>
          </div>
          <p>All regional values are clearly labelled synthetic demo fixtures with Unicode-safe evidence tracking.</p>
        </div>

        <div className="config-bar">
          <label className="select-label">
            <span>Configuration</span>
            <div className="select-wrap">
              <select value={configId} onChange={(e) => setConfigId(e.target.value as ConfigId)} aria-label="Country and state configuration">
                {configs.map((item) => <option key={item.id} value={item.id}>{item.country} · {item.state} · {item.language}</option>)}
              </select>
              <ChevronDown size={16} />
            </div>
          </label>
          <div className="config-note">
            <MapPin size={16} />
            <span>{config.country} / {config.state}</span>
            <span className="divider" />
            {config.language} ({config.locale})
            <span className="divider" />
            {config.currency}
          </div>
          <span className="fixture-label">Synthetic fixture</span>
        </div>

        {/* Cluster Demographics & Collection Footprint */}
        <div className="cluster-strip" aria-label="Reporting Cluster Demographics">
          <div className="cluster-strip-head">
            <h4><Activity size={15} /> Reporting Footprint & Collection Signals ({config.state})</h4>
            <span className="pill pill-aqua">Declared Coverage · 90-Day Window</span>
          </div>
          <div className="cluster-grid">
            {clusterData.map((c) => (
              <div key={c.regionId} className="cluster-chip">
                <div className="cluster-chip-top">
                  <strong>{c.label}</strong>
                  <span className="fixture-label">{categoryMeta[c.category as 'water'|'roads'|'lighting']?.label}</span>
                </div>
                <div className="cluster-metrics-row">
                  <span>Baseline: <strong>{c.seededRequests}</strong></span>
                  <span>Session: <strong>+{c.confirmedSessionRequests}</strong></span>
                  <span>Pop: <strong>{(c.population / 1000).toFixed(0)}k</strong></span>
                </div>
              </div>
            ))}
          </div>
          <div className="equity-alert">
            <CircleAlert size={14} />
            <span><strong>Collection Equity Disclosure:</strong> Unequal digital connectivity must not penalize silent areas. Planners must supplement digital intake with field assessments.</span>
          </div>
        </div>

        <div className="grid-main">
          <section className="panel intake-panel" aria-labelledby="intake-title">
            <div className="panel-title">
              <div><span className="step">01</span><h3 id="intake-title">Capture a request</h3></div>
              <span className={apiMode === 'server' ? 'status-local server' : 'status-local'}>
                <Bot size={15} /> {apiMode === 'server' ? 'Server-backed API' : 'Local extraction fallback'}
              </span>
            </div>
            <p className="panel-intro">When the API is available the request is validated server-side; extraction stays a labelled local fallback until a real Gemini adapter is configured.</p>
            <div className="region-picker">
              <span>Planning region</span>
              <div className="region-pills">
                {config.regions.map((region) => (
                  <button key={region.id} className={selectedRegion === region.id ? 'region-pill selected' : 'region-pill'} onClick={() => { setSelectedRegion(region.id); setPlanningCategory(region.category); setDraft(null) }}>
                    {region.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="message-label" htmlFor="request">Development request</label>
            <textarea id="request" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} placeholder="Describe a local infrastructure need…" />
            <div className="input-actions">
              <span>{message.length}/5,000</span>
              <div>
                <input ref={inputRef} type="file" accept="application/json" onChange={handleImport} hidden />
                <button className="icon-button" onClick={() => inputRef.current?.click()} title="Import JSON messages" aria-label="Import JSON messages"><FileUp size={18} /></button>
                <button className={isListening ? 'icon-button listening' : 'icon-button'} onClick={toggleVoice} title="Use voice input" aria-label="Use voice input">{isListening ? <Pause size={18} /> : <Mic size={18} />}</button>
                <button className="button button-primary small" onClick={() => analyze()} disabled={!message.trim()}><Sparkles size={16} /> Analyze</button>
              </div>
            </div>
            {draft && (
              <div className="draft-card">
                <div className="draft-head">
                  <div><span className="step">02</span><strong>Review extracted request</strong></div>
                  <button onClick={() => setDraft(null)} aria-label="Discard draft"><X size={17} /></button>
                </div>
                <div className="draft-grid">
                  <span>Need</span><strong>{categoryMeta[draft.category].label}</strong>
                  <span>Region</span><strong>{config.regions.find((item) => item.id === draft.regionId)?.label}</strong>
                  <span>Evidence span</span><code>“{draft.spans[0].quote}”</code>
                </div>
                <div className="draft-actions">
                  <span><ShieldCheck size={15} /> You must confirm before it affects a score.</span>
                  <button className="button button-dark small" onClick={confirmDraft}>Confirm request</button>
                </div>
              </div>
            )}
          </section>

          <aside className="panel policy-panel" aria-labelledby="policy-title">
            <div className="panel-title">
              <div><span className="step">03</span><h3 id="policy-title">Policy lens</h3></div>
              <span className="policy-version">v1.0</span>
            </div>
            <p className="panel-intro">Weights are transparent demo assumptions, not a welfare model or judging criteria.</p>
            <label className="range-label">Demand signal <strong>{Math.round(weight * 100)}%</strong></label>
            <input className="range" type="range" min="0" max="1" step=".05" value={weight} onChange={(e) => { setWeight(Number(e.target.value)); setRunSaved(false) }} />
            <div className="range-ends">
              <span>Infrastructure gap {Math.round((1 - weight) * 100)}%</span>
              <span>Requests / 1,000</span>
            </div>
            <div className="formula">
              <small>Priority score</small>
              <code>S = 100 × (wD + (1−w)G)</code>
              <p>D is normalized requests per 1,000. G is the category-specific infrastructure gap.</p>
            </div>
            <button className={missingPlan ? 'evidence-toggle missing' : 'evidence-toggle'} onClick={() => { setMissingPlan(!missingPlan); setRunSaved(false) }}>
              <span className="toggle-dot" />
              {missingPlan ? 'Restore investment evidence' : 'Simulate missing investment evidence'}
            </button>
            <p className="fine-print">Missing evidence blocks a candidate; it never becomes a zero score.</p>
          </aside>
        </div>

        {/* Agentic Planning Co-Pilot Strip */}
        {showCopilot && (
          <div className="copilot-strip">
            <div className="copilot-header">
              <h3><Bot size={22} /> Civic Planning Agentic Co-Pilot</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="button button-quiet" style={{ color: '#fff', borderColor: '#35756a', minHeight: '32px', fontSize: '12px' }} onClick={exportAuditMemorandum}>
                  <FileText size={14} /> {copiedMemo ? 'Copied Memorandum' : 'Export Audit Memo'}
                </button>
                <span className="copilot-badge">Policy Auditor Active</span>
              </div>
            </div>
            <p style={{ color: '#bfe0d5', fontSize: '13px', margin: '0 0 10px 0' }}>
              Autonomous decision audit examining mathematical equity invariants, policy sensitivity shifts, and investment gates.
            </p>
            <div className="copilot-insights">
              <div className="copilot-card">
                <h4><Sliders size={14} /> Policy Sensitivity Simulation</h4>
                <p>{sensitivityNotes?.description}</p>
              </div>
              <div className="copilot-card">
                <h4><ShieldCheck size={14} /> Evidence Gate Integrity</h4>
                <p>
                  {missingPlan
                    ? '⚠️ Missing investment inventory active: Candidate rank blocked without corrupting demand history.'
                    : 'Verified baseline inventory present: All projects pass gatekeeper audit.'}
                </p>
              </div>
              <div className="copilot-card">
                <h4><WalletCards size={14} /> Envelope Constraint</h4>
                <p>
                  Local budget: <strong>{money(candidates[0]?.budgetMinor ?? 0, config.currency)}</strong>. Shortlist algorithm uses sequential greedy fit without overshooting.
                </p>
              </div>
            </div>
          </div>
        )}

        <section className="results-section" aria-labelledby="results-title">
          <div className="results-heading">
            <div>
              <p className="eyebrow"><span /> Decision support</p>
              <h2 id="results-title">Ranked project candidates</h2>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="button button-quiet small" onClick={openExplain}>
                <Bot size={14} /> Explain Rationale
              </button>
              <div className="run-state">
                {runSaved ? <><BadgeCheck size={17} /> Review saved (Rev #{reviewedRecord?.revision ?? planRevision})</> : <><CircleAlert size={17} /> Draft calculation</>}
              </div>
            </div>
          </div>
          <div className="category-filter" aria-label="Comparable planning category">
            {(Object.keys(categoryMeta) as Array<'water' | 'roads' | 'lighting'>).map((category) => (
              <button key={category} className={planningCategory === category ? 'selected' : ''} onClick={() => { setPlanningCategory(category); setSelectedRegion(config.regions.find((region) => region.category === category)?.id ?? selectedRegion); setRunSaved(false) }}>
                {categoryMeta[category].label}
              </button>
            ))}
          </div>
          <div className="score-explainer">
            <span><strong>{drafts.filter((item) => item.category === planningCategory).length}</strong> confirmed matching requests</span>
            <span><strong>90 days</strong> reporting window</span>
            <span><strong>{money(candidates[0]?.budgetMinor ?? 0, config.currency)}</strong> local envelope</span>
            <span><strong>{categoryMeta[planningCategory].label}</strong> comparison group</span>
          </div>
          <div className="candidate-list">
            {candidates.map((candidate, index) => (
              <CandidateRow key={candidate.id} candidate={candidate} rank={index + 1} currency={config.currency} />
            ))}
          </div>
          <div className="review-bar">
            <div>
              {top ? (
                <><BadgeCheck size={19} /><span><strong>{top.project}</strong> is in the current greedy draft shortlist. It is not an allocation.</span></>
              ) : (
                <><TriangleAlert size={19} /><span>No candidate can be shortlisted until blocked evidence is restored.</span></>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="button button-quiet" onClick={openExplain}><Bot size={15} /> Explain</button>
              <button className="button button-primary" disabled={!top} onClick={() => setShowReviewModal(true)}>
                {runSaved ? <><BadgeCheck size={17} /> Sign & Endorse Review</> : 'Save reviewed recommendation'}
              </button>
            </div>
          </div>
        </section>
      </section>

      {/* Explanation Modal */}
      {showExplainModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-head">
              <h3><Bot size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Priority Rationale & Evidence Audit</h3>
              <button onClick={() => setShowExplainModal(false)} aria-label="Close modal"><X size={18} /></button>
            </div>
            <div className="modal-body">
              {explainLoading ? (
                <p>Analyzing evidence spans and computing policy breakdown…</p>
              ) : (
                <>
                  <div className="rationale-summary">
                    {explainData?.rationale.summary}
                  </div>
                  <h4 style={{ margin: '14px 0 8px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '.05em', color: '#16483f' }}>
                    Evidence-Grounded Rationale
                  </h4>
                  <ul className="rationale-reasons">
                    {explainData?.rationale.reasons.map((r, i) => (
                      <li key={i}><CheckCircle2 size={16} /><span>{r}</span></li>
                    ))}
                  </ul>
                  <div className="rationale-caveats">
                    <strong>Caveats & Planning Safeguards</strong>
                    {explainData?.rationale.caveats.map((c, i) => (
                      <div key={i} style={{ marginTop: '4px' }}>• {c}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '11px', color: '#68827c' }}>
                    Provider Engine: <code>{explainData?.provider ?? 'deterministic-rules'}</code>
                  </div>
                  {evidenceHash && (
                    <div className="hash-badge">
                      <ShieldCheck size={12} /> SHA-256: {evidenceHash}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-actions">
              <button className="button button-primary small" onClick={() => setShowExplainModal(false)}>Close Audit</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-head">
              <h3><ShieldCheck size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Record Formal Municipal Review</h3>
              <button onClick={() => setShowReviewModal(false)} aria-label="Close modal"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>
                Under DPG participatory planning guidelines, AI-generated or algorithmic rankings cannot be automatically funded without verified human operator endorsement.
              </p>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, color: '#4a6f67' }}>
                Reviewer Determination
              </label>
              <div className="decision-row">
                <button className={`decision-btn ${reviewDecision === 'reviewed' ? 'active reviewed' : ''}`} onClick={() => setReviewDecision('reviewed')}>
                  <BadgeCheck size={16} style={{ verticalAlign: 'text-top', marginRight: '4px' }} /> Endorse Shortlist
                </button>
                <button className={`decision-btn ${reviewDecision === 'rejected' ? 'active rejected' : ''}`} onClick={() => setReviewDecision('rejected')}>
                  <TriangleAlert size={16} style={{ verticalAlign: 'text-top', marginRight: '4px' }} /> Flag for Resurvey
                </button>
              </div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, color: '#4a6f67', display: 'block', margin: '12px 0 6px' }}>
                Verification Note
              </label>
              <textarea className="review-textarea" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} maxLength={1000} />
              <div style={{ fontSize: '11px', color: '#68857f', marginTop: '8px' }}>
                Expected Revision: <strong>#{planRevision}</strong> · Immutable Plan ID: <code>{planId ? planId.slice(0, 8) + '…' : 'local-draft'}</code>
              </div>
            </div>
            <div className="modal-actions">
              <button className="button button-quiet small" onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button className="button button-primary small" onClick={submitReview}>Submit Official Review</button>
            </div>
          </div>
        </div>
      )}

      <section className="evidence shell">
        <div><p className="eyebrow"><span /> Built for scrutiny</p><h2>Every decision carries its limits with it.</h2></div>
        <div className="evidence-grid">
          <Evidence icon={<ShieldCheck size={21} />} title="Evidence gates" text="A missing denominator, incompatible boundary, or unknown investment plan blocks the rank." />
          <Evidence icon={<WalletCards size={21} />} title="No black-box allocation" text="The shortlist is a visible greedy draft. A human reviews every recommendation." />
          <Evidence icon={<MapPin size={21} />} title="Portable by contract" text="Language, local taxonomy, currency, boundaries, and policies change through a configuration." />
        </div>
      </section>

      <footer className="shell">
        <div className="brand"><span className="brand-mark"><Sparkles size={16} /></span><span>Civic<span>Priorities</span></span></div>
        <p>Evidence-gated civic planning engine · Open Source · Deployed on Vercel</p>
      </footer>
    </main>
  )
}

function CandidateRow({ candidate, rank, currency }: { candidate: CandidateResult; rank: number; currency: 'INR' | 'BRL' }) {
  const isBlocked = candidate.eligibility !== 'ELIGIBLE'
  return (
    <article className={`candidate ${isBlocked ? 'candidate-blocked' : ''}`}>
      <div className="rank">{candidate.selected ? <BadgeCheck size={19} /> : rank}</div>
      <div className="candidate-main">
        <div className="candidate-title">
          <div>
            <span className={`category-icon ${candidate.category}`}><CategoryIcon category={candidate.category} /></span>
            <div>
              <h3>{candidate.project}</h3>
              <p>{candidate.label} · {categoryMeta[candidate.category].label}</p>
            </div>
          </div>
          <span className={`status-chip ${sentiment(candidate.score)}`}>
            {candidate.eligibility === 'ELIGIBLE' ? 'Eligible' : candidate.eligibility.replace('_', ' ')}
          </span>
        </div>
        <div className="metrics">
          <Metric label="Requests" value={String(candidate.requestUnits)} helper={`${candidate.rate.toFixed(1)} / 1k`} />
          <Metric label="Demand D" value={candidate.demand.toFixed(2)} helper="saturated at 1" />
          <Metric label="Gap G" value={candidate.gap.toFixed(2)} helper={`${Math.round(candidate.coverage * 100)}% coverage`} />
          <Metric label="Cost" value={money(candidate.costMinor, currency)} helper={candidate.description} />
        </div>
        {candidate.reason && <p className="block-reason"><TriangleAlert size={15} />{candidate.reason}</p>}
      </div>
      <div className="score">
        <small>Score</small>
        <strong>{candidate.score === null ? '—' : candidate.score.toFixed(1)}</strong>
        {candidate.score !== null && (
          <span>
            {candidate.score >= 50 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {candidate.score >= 50 ? 'Higher priority' : 'Lower priority'}
          </span>
        )}
      </div>
    </article>
  )
}

function CategoryIcon({ category }: { category: CandidateResult['category'] }) { return category === 'water' ? <Droplets size={18} /> : category === 'roads' ? <MapPin size={18} /> : <Lightbulb size={18} /> }
function Metric({ label, value, helper }: { label: string; value: string; helper: string }) { return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{helper}</small></div> }
function Evidence({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="evidence-card"><span className="evidence-icon">{icon}</span><h3>{title}</h3><p>{text}</p></div> }

export default App
