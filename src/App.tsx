import { ChangeEvent, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowDown, ArrowUp, BadgeCheck, Bot, ChevronDown, CircleAlert, FileUp,
  FileText, Lightbulb, MapPin, MessageSquareText, Mic,
  ShieldCheck, Sparkles, TriangleAlert, WalletCards, Droplets, X,
  CheckCircle2, Activity, Cpu, Sliders, UserCheck, LogIn, Users
} from 'lucide-react'
import { ThinkingOrb } from 'thinking-orbs'
import { categoryMeta, configs } from './data'
import { findCategory, makeDraft, scoreCandidates } from './engine'
import type { CandidateResult, ConfigId, Draft, AuthUser, UserRole, ReviewerMetadata } from './types'
import {
  AnimatedNumber, RollingText, ScoreOrbit, DynamicIslandToast,
  EvidenceGate, ProgressiveBlur, EndorsementSeal,
  CopilotEntrance, CopilotCardWrapper,
} from './brik'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { ThankYouPage } from './pages/ThankYouPage'
import { NotFoundPage } from './pages/NotFoundPage'

interface ToastNotification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  action?: { label: string; onClick: () => void }
}

const ROUTE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'CivicPriorities: Evidence, Not Guesswork',
    description: 'A clear civic planning tool that turns multilingual community requests into reviewable project priorities.'
  },
  '/privacy': {
    title: 'Privacy Policy: CivicPriorities',
    description: 'How we handle intake data, voice inputs, and why we do not track you across the web.'
  },
  '/terms': {
    title: 'Terms of Service and Model Rules: CivicPriorities',
    description: 'Why every score requires human review and why missing evidence blocks a rank instead of guessing.'
  },
  '/thank-you': {
    title: 'Request Confirmed: CivicPriorities',
    description: 'Your infrastructure request is saved in the active 90-day planning cycle.'
  },
  '404': {
    title: 'Page Not Found: CivicPriorities',
    description: 'We could not find the page or planning document you were looking for.'
  }
}

const DEMO_PERSONAS: AuthUser[] = [
  {
    id: 'usr-planner-01',
    name: 'Maya Sundaram',
    email: 'maya.sundaram@chennaicivic.gov.in',
    role: 'planner',
    organization: 'Greater Chennai Corporation & Kovilpatti Planning Board'
  },
  {
    id: 'usr-auditor-01',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@open-audit.org',
    role: 'auditor',
    organization: 'Independent Civic Planning Observatory'
  },
  {
    id: 'usr-citizen-01',
    name: 'Priya Anandan',
    email: 'priya.anandan@community.org',
    role: 'citizen',
    organization: 'Kovilpatti Ward 4 Residents Forum'
  }
]

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
  const [reviewNote, setReviewNote] = useState('Checked against current survey records and the 90-day community intake list.')
  const [reviewedRecord, setReviewedRecord] = useState<{
    decision: string
    note: string
    savedAt: string
    revision: number
    reviewerName?: string
    reviewerRole?: string
  } | null>(null)
  const [showCopilot, setShowCopilot] = useState(true)

  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem('civic_user')
      if (saved) return JSON.parse(saved) as AuthUser
    } catch {}
    return DEMO_PERSONAS[0]
  })
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('civic_token'))
  const [demoUsers, setDemoUsers] = useState<AuthUser[]>(DEMO_PERSONAS)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authTab, setAuthTab] = useState<'personas' | 'signin' | 'signup'>('personas')
  const [loginEmail, setLoginEmail] = useState('maya.sundaram@chennaicivic.gov.in')
  const [loginPassword, setLoginPassword] = useState('planner123')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState<UserRole>('citizen')
  const [regOrg, setRegOrg] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Router state
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/')
  const [lastConfirmedDraft, setLastConfirmedDraft] = useState<{
    id: string
    category: string
    regionLabel: string
    text: string
    authorName?: string
    authorRole?: string
  } | null>(null)

  // Autonomic / async loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isComputingPlan, setIsComputingPlan] = useState(false)

  // Form field validation states
  const [intakeError, setIntakeError] = useState('')
  const [signInError, setSignInError] = useState('')
  const [signUpErrors, setSignUpErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [reviewFormError, setReviewFormError] = useState('')

  // Multi-toast system
  const [toasts, setToasts] = useState<ToastNotification[]>([])

  const addToast = (
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'success',
    action?: { label: string; onClick: () => void }
  ) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev.slice(-2), { id, type, message, action }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const onPop = () => setCurrentPath(window.location.pathname || '/')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Dynamic meta title and description per page
  useEffect(() => {
    const meta = ROUTE_META[currentPath] ?? ROUTE_META['404']
    document.title = meta.title
    const descTag = document.querySelector('meta[name="description"]')
    if (descTag) descTag.setAttribute('content', meta.description)
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', meta.title)
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', meta.description)
  }, [currentPath])

  const inputRef = useRef<HTMLInputElement>(null)
  const config = configs.find((item) => item.id === configId)!

  // Initial health check and auth sync
  useEffect(() => {
    fetch('/health')
      .then((res) => { if (res.ok) setApiMode('server') })
      .catch(() => setApiMode('offline'))

    fetch('/api/auth/demo-users')
      .then((res) => res.json())
      .then((users: AuthUser[]) => {
        if (Array.isArray(users) && users.length) setDemoUsers(users)
      })
      .catch(() => {})

    const token = localStorage.getItem('civic_token')
    if (token) {
      fetch('/api/auth/get-session', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data: { session: { token: string } | null; user: AuthUser | null }) => {
          if (data.user) {
            setCurrentUser(data.user)
            localStorage.setItem('civic_user', JSON.stringify(data.user))
          }
        })
        .catch(() => {})
    }
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
    setIntakeError('')
    if (findCategory(text) !== selected.category) {
      const msg = `This message is about ${categoryMeta[findCategory(text)].label.toLowerCase()}, but ${selected.label} is set to ${categoryMeta[selected.category].label.toLowerCase()}. Pick a matching region first.`
      setIntakeError(msg)
      addToast(msg, 'warning')
      return
    }
    setIsAnalyzing(true)
    const local = () => {
      setApiMode('offline')
      const d = makeDraft(text, selectedRegion, config.locale, channel)
      d.author = { name: currentUser.name, role: currentUser.role, organization: currentUser.organization }
      setDraft(d)
      setIsAnalyzing(false)
    }
    try {
      const response = await fetch('/api/v1/intake/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, configId: config.id, regionId: selectedRegion, text, channel }),
      })
      if (!response.ok) return local()
      const result = await response.json() as { draft: Draft }
      result.draft.author = { name: currentUser.name, role: currentUser.role, organization: currentUser.organization }
      setApiMode('server')
      setDraft(result.draft)
    } catch { local() }
    finally { setIsAnalyzing(false) }
  }

  function analyze(channel: Draft['channel'] = 'text') {
    if (!message.trim()) {
      setIntakeError('Please enter a short description of what is needed in your neighborhood.')
      addToast('Please enter a description first', 'warning')
      return
    }
    setIntakeError('')
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
    const regionName = config.regions.find((r) => r.id === draft.regionId)?.label ?? 'selected region'
    setLastConfirmedDraft({
      id: draft.id,
      category: categoryMeta[draft.category].label,
      regionLabel: regionName,
      text: draft.text,
      authorName: currentUser.name,
      authorRole: currentUser.role
    })
    addToast(
      `Request recorded for ${regionName} by ${currentUser.name}`,
      'success',
      { label: 'View receipt', onClick: () => navigate('/thank-you') }
    )
    setDraft(importQueue[0] ?? null)
    setImportQueue((items) => items.slice(1))
    setMessage('')
    setRunSaved(false)
  }

  async function queueImport(records: string[]) {
    const compatible = records.filter((text) => findCategory(text) === selected.category)
    if (!compatible.length) {
      const msg = 'None of the imported messages match the selected planning region or category.'
      setIntakeError(msg)
      addToast(msg, 'error')
      return
    }
    const localDrafts = compatible.map((text) => makeDraft(text, selectedRegion, config.locale, 'message_import'))
    try {
      const response = await fetch('/api/v1/intake/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, configId: config.id, regionId: selectedRegion, records: compatible.map((text) => ({ text })) }) })
      if (!response.ok) throw new Error('Import API unavailable')
      const result = await response.json() as { drafts: Draft[]; errors: { index: number; error: string }[] }
      setApiMode('server')
      setDraft(result.drafts[0] ?? null)
      setImportQueue(result.drafts.slice(1))
      addToast(`Imported ${compatible.length} requests into the review queue`, 'success')
      if (result.errors.length) addToast(`${result.errors.length} messages belong to other categories and were skipped.`, 'warning')
    } catch {
      setApiMode('offline')
      setDraft(localDrafts[0] ?? null)
      setImportQueue(localDrafts.slice(1))
      addToast(`Imported ${compatible.length} requests into local queue`, 'info')
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
          ? `${topCandidate.project} in ${topCandidate.label} is ranked first right now. It has ${topCandidate.requestUnits} verified resident requests (${topCandidate.rate.toFixed(1)} per 1,000 people) and a ${(topCandidate.gap * 100).toFixed(0)}% infrastructure gap.`
          : 'No project is currently shortlisted under these settings.',
        reasons: [
          `We weighted public requests at ${Math.round(weight * 100)}% and the physical infrastructure gap at ${Math.round((1 - weight) * 100)}%.`,
          blockedCandidate
            ? `${blockedCandidate.project} is paused because baseline inventory records are missing. We never treat missing records as a zero score.`
            : 'All candidate projects have verified survey records on file.',
          `The top project fits inside the regional budget of ${money(candidates[0]?.budgetMinor ?? 0, config.currency)}.`
        ],
        caveats: [
          'This is a decision-support preview. A qualified municipal planner or auditor must verify the numbers before any funding is approved.',
          'Rankings are meant to guide public discussion, not make automatic spending decisions.'
        ]
      }
    })
    setExplainLoading(false)
  }

  const switchPersona = (persona: AuthUser) => {
    setCurrentUser(persona)
    localStorage.setItem('civic_user', JSON.stringify(persona))
    setShowAuthModal(false)
    addToast(`Switched persona to ${persona.name} (${persona.role})`, 'info')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setSignInError('')
    if (!loginEmail.trim() || !loginPassword.trim()) {
      const msg = 'Please enter both email and password.'
      setSignInError(msg)
      setAuthError(msg)
      return
    }
    setAuthLoading(true)
    try {
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid email or password')
      setCurrentUser(data.user)
      setAuthToken(data.token)
      localStorage.setItem('civic_user', JSON.stringify(data.user))
      localStorage.setItem('civic_token', data.token)
      setShowAuthModal(false)
      addToast(`Signed in as ${data.user.name} (${data.user.role})`, 'success')
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Sign in failed'
      setAuthError(msg)
      setSignInError(msg)
      addToast(msg, 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    const errors: { name?: string; email?: string; password?: string } = {}
    if (!regName.trim()) errors.name = 'Full name is required'
    if (!regEmail.trim() || !regEmail.includes('@')) errors.email = 'Valid email address is required'
    if (regPassword.length < 6) errors.password = 'Password must be at least 6 characters'

    if (Object.keys(errors).length) {
      setSignUpErrors(errors)
      return
    }
    setSignUpErrors({})
    setAuthLoading(true)
    try {
      const res = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          organization: regOrg || 'Public Civic Contributor'
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to register account')
      setCurrentUser(data.user)
      setAuthToken(data.token)
      localStorage.setItem('civic_user', JSON.stringify(data.user))
      localStorage.setItem('civic_token', data.token)
      setShowAuthModal(false)
      addToast(`Account registered for ${data.user.name}`, 'success')
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Registration failed'
      setAuthError(msg)
      addToast(msg, 'error')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (authToken) {
      try {
        await fetch('/api/auth/sign-out', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` }
        })
      } catch {}
    }
    setAuthToken(null)
    localStorage.removeItem('civic_token')
    const fallback = DEMO_PERSONAS[0]
    setCurrentUser(fallback)
    localStorage.setItem('civic_user', JSON.stringify(fallback))
    setShowAuthModal(false)
    addToast('Signed out. Reverted to default demo persona.', 'info')
  }

  async function submitReview() {
    if (!reviewNote.trim()) {
      setReviewFormError('Please enter a verification note before submitting.')
      return
    }
    setReviewFormError('')
    const reviewer: ReviewerMetadata = {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      organization: currentUser.organization
    }

    if (planId && apiMode === 'server') {
      try {
        const res = await fetch(`/api/v1/plans/${planId}/review`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
          },
          body: JSON.stringify({
            sessionId,
            decision: reviewDecision,
            note: reviewNote,
            expectedRevision: planRevision,
            reviewer
          })
        })
        if (res.ok) {
          const data = await res.json() as { revision: number; decision: string; note: string; savedAt: string; reviewer?: ReviewerMetadata }
          setPlanRevision(data.revision)
          setReviewedRecord({
            decision: data.decision,
            note: data.note,
            savedAt: data.savedAt,
            revision: data.revision,
            reviewerName: data.reviewer?.name ?? currentUser.name,
            reviewerRole: data.reviewer?.role ?? currentUser.role
          })
          setRunSaved(true)
          setShowReviewModal(false)
          addToast(`Review signed & endorsed by ${currentUser.name}`, 'success')
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
      revision: planRevision + 1,
      reviewerName: currentUser.name,
      reviewerRole: currentUser.role
    })
    setPlanRevision((prev) => prev + 1)
    setRunSaved(true)
    setShowReviewModal(false)
    addToast(`Review signed & recorded by ${currentUser.name}`, 'success')
  }

  const exportAuditMemorandum = async () => {
    const lines = [
      `CIVIC PLANNING AUDIT MEMO`,
      `Jurisdiction: ${config.country}, ${config.state} (${config.locale})`,
      `Date: ${new Date().toISOString()}`,
      `Category: ${categoryMeta[planningCategory].label}`,
      `Policy Weight: Demand ${Math.round(weight * 100)}% / Gap ${Math.round((1 - weight) * 100)}%`,
      `Evidence Hash: ${evidenceHash || 'deterministic-fixture'}`,
      `Review Status: ${reviewedRecord ? `${reviewedRecord.decision.toUpperCase()} (Rev #${reviewedRecord.revision})` : 'Draft calculation'}`,
      `Reviewer: ${reviewedRecord?.reviewerName ?? currentUser.name} (${(reviewedRecord?.reviewerRole ?? currentUser.role).toUpperCase()}) - ${currentUser.organization}`,
      `Standards: DPG Participatory Planning Standard`,
      ``,
      `CANDIDATE PROJECTS`,
      ...candidates.map((c, i) => `${i + 1}. ${c.project} (${c.label}) - Score: ${c.score ?? 'Paused'} [Status: ${c.eligibility}]`),
      ``,
      `NOTES`,
      reviewedRecord?.note ?? 'Draft evaluation run. Awaiting municipal sign-off.'
    ]
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopiedMemo(true)
    addToast('Audit memo copied to clipboard', 'info')
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
        ? `If you weigh resident requests at 80%, ${topDemand} ranks first. If you focus 80% on existing infrastructure gaps, ${topGap} takes priority instead.`
        : `${topDemand} stays at the top whether you lean heavily toward public requests or existing infrastructure gaps.`
    }
  }, [comparableRegions, drafts])

  return (
    <main>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="site-header shell">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/') }} aria-label="CivicPriorities home">
          <span className="brand-mark"><Sparkles size={16} /></span>
          <span>Civic<span>Priorities</span></span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <nav className="nav-links">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/') }} className={currentPath === '/' ? 'active' : ''}>Workbench</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy') }} className={currentPath === '/privacy' ? 'active' : ''}>Privacy</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms') }} className={currentPath === '/terms' ? 'active' : ''}>Terms</a>
          </nav>
          <button className="user-badge-btn" onClick={() => setShowAuthModal(true)} title="Switch persona or sign in" type="button">
            <span className={`user-avatar ${currentUser.role}`}>
              {currentUser.name.charAt(0)}
            </span>
            <span>{currentUser.name}</span>
            <span className={`role-tag ${currentUser.role}`}>{currentUser.role}</span>
            <ChevronDown size={14} style={{ color: '#7b958e' }} />
          </button>
          <div className="header-meta">
            <span className="live-dot" />
            {apiMode === 'server' ? 'Live API Verified' : 'Deterministic Client Engine'}
            <span className="divider" />
            v0.1
          </div>
        </div>
      </header>

      {currentPath === '/privacy' && <PrivacyPage onNavigate={navigate} />}
      {currentPath === '/terms' && <TermsPage onNavigate={navigate} />}
      {currentPath === '/thank-you' && <ThankYouPage onNavigate={navigate} lastConfirmed={lastConfirmedDraft} />}
      {currentPath !== '/' && currentPath !== '/privacy' && currentPath !== '/terms' && currentPath !== '/thank-you' && (
        <NotFoundPage onNavigate={navigate} />
      )}

      {currentPath === '/' && (
        <>
          <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Evidence-gated civic planning</p>
          <h1>Make public priorities <em>explainable.</em></h1>
          <p className="hero-text">Turn multilingual community requests into clear, reviewable project priorities. If evidence is missing, the system pauses the ranking instead of guessing.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#workspace">Try a request <ArrowDown size={17} /></a>
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
          <p>Test how local requests and infrastructure data shape real project priorities. All figures here are realistic demo examples.</p>
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
            <h4><Activity size={15} /> Neighborhood overview and intake status ({config.state})</h4>
            <span className="pill pill-aqua">Active 90-day cycle</span>
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
            <span>Areas with fewer smartphones or slower connections should never lose out. Planners need to back up online submissions with in-person field surveys.</span>
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
            <p className="panel-intro">When the server is connected, your request is checked live. If you are offline, it runs locally so you can still test the full workflow.</p>
            <div className="user-identity-strip">
              <span>Intake submitter: <strong>{currentUser.name}</strong> · <span className={`role-tag ${currentUser.role}`}>{currentUser.role}</span> ({currentUser.organization})</span>
              <button type="button" onClick={() => setShowAuthModal(true)}>Switch Persona</button>
            </div>
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
            <label className="message-label" htmlFor="request">Community request</label>
            <textarea
              id="request"
              className={intakeError ? 'input-error' : ''}
              value={message}
              onChange={(e) => { setMessage(e.target.value); if (intakeError) setIntakeError('') }}
              maxLength={5000}
              placeholder="Describe an infrastructure need in your neighborhood..."
            />
            {intakeError && (
              <div className="field-error">
                <CircleAlert size={14} /> {intakeError}
              </div>
            )}
            <div className="input-actions">
              <span>{message.length}/5,000</span>
              <div>
                <input ref={inputRef} type="file" accept="application/json" onChange={handleImport} hidden />
                <button className="icon-button" onClick={() => inputRef.current?.click()} title="Import JSON messages" aria-label="Import JSON messages"><FileUp size={18} /></button>
                <button
                  className={isListening ? 'icon-button listening' : 'icon-button'}
                  onClick={toggleVoice}
                  title="Use voice input"
                  aria-label="Use voice input"
                >
                  {isListening ? <ThinkingOrb state="listening" size={20} /> : <Mic size={18} />}
                </button>
                <button
                  className="button button-primary small"
                  onClick={() => analyze()}
                  disabled={!message.trim() || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <ThinkingOrb state="searching" size={20} /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Analyze
                    </>
                  )}
                </button>
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
                  {draft.author && (
                    <>
                      <span>Submitter</span>
                      <strong>{draft.author.name} ({draft.author.role})</strong>
                    </>
                  )}
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
            <p className="panel-intro">Adjust how much weight goes to community requests versus physical infrastructure gaps.</p>
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
            <p className="fine-print">Missing records pause the project instead of giving it a zero score.</p>
          </aside>
        </div>

        {/* Planning Assistant Strip */}
        {showCopilot && (
          <div className="copilot-strip">
            <div className="copilot-header">
              <h3><Bot size={22} /> Planning Assistant</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="button button-quiet" style={{ color: '#fff', borderColor: '#35756a', minHeight: '32px', fontSize: '12px' }} onClick={exportAuditMemorandum}>
                  <FileText size={14} /> {copiedMemo ? 'Copied Memorandum' : 'Export Audit Memo'}
                </button>
                <span className="copilot-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="orb-inline"><ThinkingOrb state="breathing" size={20} /></span>
                  Assistant Active
                </span>
              </div>
            </div>
            <p style={{ color: '#bfe0d5', fontSize: '13px', margin: '0 0 10px 0' }}>
              A quick check on whether changing weights flips the top project, and whether all survey records are intact.
            </p>
            <div className="copilot-insights">
              <div className="copilot-card">
                <h4><Sliders size={14} /> Sensitivity check</h4>
                <p>{sensitivityNotes?.description}</p>
              </div>
              <div className="copilot-card">
                <h4><ShieldCheck size={14} /> Survey records check</h4>
                <p>
                  {missingPlan
                    ? 'Missing survey records detected. This project is on hold until paperwork is restored.'
                    : 'All baseline survey records are accounted for.'}
                </p>
              </div>
              <div className="copilot-card">
                <h4><WalletCards size={14} /> Budget limit</h4>
                <p>
                  Local budget is <strong>{money(candidates[0]?.budgetMinor ?? 0, config.currency)}</strong>. Projects are added in rank order until this cap is reached.
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
                {runSaved ? (
                  <><BadgeCheck size={17} /> Endorsed by {reviewedRecord?.reviewerName ?? currentUser.name} (Rev #{reviewedRecord?.revision ?? planRevision})</>
                ) : (
                  <><CircleAlert size={17} /> Draft calculation</>
                )}
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
                <><BadgeCheck size={19} /><span><strong>{top.project}</strong> is in the current draft shortlist. This is a recommendation, not an approval to spend funds.</span></>
              ) : (
                <><TriangleAlert size={19} /><span>No candidate can be shortlisted until missing records are restored.</span></>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="button button-quiet" onClick={openExplain}><Bot size={15} /> Explain</button>
              <button className="button button-primary" disabled={!top} onClick={() => setShowReviewModal(true)}>
                {runSaved ? <><BadgeCheck size={17} /> Endorsed by {reviewedRecord?.reviewerName ?? currentUser.name}</> : currentUser.role === 'citizen' ? 'Review & Comments' : 'Sign & Endorse Review'}
              </button>
            </div>
          </div>
        </section>
      </section>

          <section className="evidence shell">
            <div><p className="eyebrow"><span /> Open to inspection</p><h2>Every recommendation shows its working.</h2></div>
            <div className="evidence-grid">
              <Evidence icon={<ShieldCheck size={21} />} title="Evidence comes first" text="If survey data or project details are missing, the system pauses the ranking instead of making up a number." />
              <Evidence icon={<WalletCards size={21} />} title="Humans make the final call" text="The ranked list is an open draft to guide discussion. A person reviews and approves every project before any funds move." />
              <Evidence icon={<MapPin size={21} />} title="Built for different places" text="Languages, regional needs, currencies, and policy priorities can all be adjusted to fit local guidelines." />
            </div>
          </section>

          {top && (
            <aside className="sticky-mobile-cta" aria-label="Top priority summary">
              <div className="sticky-cta-info">
                <span className="sticky-cta-label">Top Priority Candidate</span>
                <span className="sticky-cta-project">{top.project}</span>
              </div>
              <div className="sticky-cta-actions">
                <button className="button button-quiet small" onClick={openExplain} type="button">
                  <Bot size={14} /> Explain
                </button>
                <a className="button button-primary small" href="#workspace">
                  Workbench
                </a>
              </div>
            </aside>
          )}
        </>
      )}

      {/* Explanation Modal */}
      {showExplainModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-head">
              <h3><Bot size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Why this project is ranked first</h3>
              <button onClick={() => setShowExplainModal(false)} aria-label="Close modal"><X size={18} /></button>
            </div>
            <div className="modal-body">
              {explainLoading ? (
                <div className="orb-box">
                  <ThinkingOrb state="connecting" size={64} />
                  <p style={{ marginTop: '12px', color: '#567a72' }}>Checking evidence records and calculating policy weights...</p>
                </div>
              ) : (
                <>
                  <div className="rationale-summary">
                    {explainData?.rationale.summary}
                  </div>
                  <h4 style={{ margin: '14px 0 8px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '.05em', color: '#16483f' }}>
                    How the score was calculated
                  </h4>
                  <ul className="rationale-reasons">
                    {explainData?.rationale.reasons.map((r, i) => (
                      <li key={i}><CheckCircle2 size={16} /><span>{r}</span></li>
                    ))}
                  </ul>
                  <div className="rationale-caveats">
                    <strong>Things to keep in mind</strong>
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
              <button className="button button-primary small" onClick={() => setShowExplainModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-head">
              <h3><ShieldCheck size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Record official review</h3>
              <button onClick={() => setShowReviewModal(false)} aria-label="Close modal"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>
                An algorithm cannot approve municipal spending on its own. A human planner or auditor must check the numbers and endorse the list.
              </p>

              <div style={{ background: '#f0f6f3', border: '1px solid #d0e4da', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '12px' }}>
                Reviewer: <strong>{currentUser.name}</strong> · <span className={`role-tag ${currentUser.role}`}>{currentUser.role}</span>
                <div style={{ color: '#567a72', fontSize: '11px', marginTop: '2px' }}>{currentUser.organization}</div>
              </div>

              {currentUser.role === 'citizen' && (
                <div className="citizen-gate-warning">
                  <TriangleAlert size={16} style={{ display: 'inline', verticalAlign: 'text-top', marginRight: '6px' }} />
                  <span>You are signed in as a citizen contributor. You can leave comments that will be recorded in the audit log, but official sign-off requires a municipal planner or auditor account.</span>
                  <div className="citizen-gate-actions">
                    <button
                      type="button"
                      className="button button-quiet small"
                      onClick={() => {
                        const planner = demoUsers.find((u) => u.role === 'planner') || DEMO_PERSONAS[0]
                        switchPersona(planner)
                      }}
                    >
                      <UserCheck size={14} /> Switch to Maya (Planner)
                    </button>
                    <button
                      type="button"
                      className="button button-quiet small"
                      onClick={() => {
                        const auditor = demoUsers.find((u) => u.role === 'auditor') || DEMO_PERSONAS[1]
                        switchPersona(auditor)
                      }}
                    >
                      <ShieldCheck size={14} /> Switch to Rajesh (Auditor)
                    </button>
                  </div>
                </div>
              )}

              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, color: '#4a6f67' }}>
                Reviewer Decision
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
                Review note
              </label>
              <textarea
                className={`review-textarea ${reviewFormError ? 'input-error' : ''}`}
                value={reviewNote}
                onChange={(e) => {
                  setReviewNote(e.target.value)
                  if (reviewFormError) setReviewFormError('')
                }}
                maxLength={1000}
              />
              {reviewFormError && (
                <div className="field-error" style={{ marginTop: '6px' }}>
                  <CircleAlert size={14} /> {reviewFormError}
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#68857f', marginTop: '8px' }}>
                Expected Revision: <strong>#{planRevision}</strong> · Immutable Plan ID: <code>{planId ? planId.slice(0, 8) + '…' : 'local-draft'}</code>
              </div>
            </div>
            <div className="modal-actions">
              <button className="button button-quiet small" onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button className="button button-primary small" onClick={submitReview}>
                {currentUser.role === 'citizen' ? 'Submit comment' : 'Sign and endorse review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persona & Authentication Modal */}
      {showAuthModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-head">
              <h3><Users size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Choose role or sign in</h3>
              <button onClick={() => setShowAuthModal(false)} aria-label="Close modal"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="auth-tabs">
                <button className={`auth-tab ${authTab === 'personas' ? 'active' : ''}`} onClick={() => { setAuthTab('personas'); setAuthError('') }}>
                  Switch Persona
                </button>
                <button className={`auth-tab ${authTab === 'signin' ? 'active' : ''}`} onClick={() => { setAuthTab('signin'); setAuthError('') }}>
                  Email Sign In
                </button>
                <button className={`auth-tab ${authTab === 'signup' ? 'active' : ''}`} onClick={() => { setAuthTab('signup'); setAuthError('') }}>
                  Create Account
                </button>
              </div>

              {authError && <div className="auth-error" style={{ marginBottom: '14px' }}>{authError}</div>}

              {authTab === 'personas' && (
                <div>
                  <p style={{ fontSize: '12.5px', color: '#52726b', margin: '0 0 12px 0' }}>
                    Pick a demo profile to test how permissions and sign-off options change:
                  </p>
                  <div className="persona-list">
                    {demoUsers.map((persona) => {
                      const isSelected = currentUser.id === persona.id
                      return (
                        <div
                          key={persona.id}
                          className={`persona-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => switchPersona(persona)}
                        >
                          <span className={`user-avatar ${persona.role}`} style={{ width: '32px', height: '32px', fontSize: '13px', flexShrink: 0 }}>
                            {persona.name.charAt(0)}
                          </span>
                          <div style={{ flex: 1 }}>
                            <h4>
                              {persona.name}
                              <span className={`role-tag ${persona.role}`}>{persona.role}</span>
                              {isSelected && <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#167e6b', fontWeight: 600 }}>Active</span>}
                            </h4>
                            <p><strong>{persona.organization}</strong></p>
                            <p style={{ marginTop: '3px' }}>
                              {persona.role === 'planner' && 'Calculates project rankings and can endorse the official shortlist.'}
                              {persona.role === 'auditor' && 'Checks evidence records and can flag projects for resurvey.'}
                              {persona.role === 'citizen' && 'Submits local infrastructure requests and leaves community comments.'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {authTab === 'signin' && (
                <form className="auth-form" onSubmit={handleSignIn}>
                  <p style={{ fontSize: '12.5px', color: '#52726b', margin: '0 0 10px 0' }}>
                    Sign in with your email or use one of the demo accounts:
                  </p>
                  <label>
                    Email Address
                    <input
                      type="email"
                      required
                      className={signInError ? 'input-error' : ''}
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value)
                        if (signInError) setSignInError('')
                        if (authError) setAuthError('')
                      }}
                      placeholder="e.g. maya.sundaram@chennaicivic.gov.in"
                    />
                  </label>
                  {signInError && (
                    <div className="field-error" style={{ marginTop: '4px' }}>
                      <CircleAlert size={12} /> {signInError}
                    </div>
                  )}
                  <label>
                    Password
                    <input
                      type="password"
                      required
                      className={signInError ? 'input-error' : ''}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value)
                        if (signInError) setSignInError('')
                        if (authError) setAuthError('')
                      }}
                      placeholder="Password"
                    />
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button type="button" className="button button-quiet small" onClick={() => setShowAuthModal(false)}>Cancel</button>
                    <button type="submit" className="button button-primary small" disabled={authLoading}>
                      <LogIn size={15} /> {authLoading ? 'Signing in…' : 'Sign In'}
                    </button>
                  </div>
                </form>
              )}

              {authTab === 'signup' && (
                <form className="auth-form" onSubmit={handleSignUp}>
                  <p style={{ fontSize: '12.5px', color: '#52726b', margin: '0 0 10px 0' }}>
                    Create an account to participate in the planning process:
                  </p>
                  <label>
                    Full Name
                    <input
                      type="text"
                      required
                      className={signUpErrors.name ? 'input-error' : ''}
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value)
                        setSignUpErrors((prev) => ({ ...prev, name: undefined }))
                      }}
                      placeholder="e.g. Anand Kumar"
                    />
                    {signUpErrors.name && (
                      <div className="field-error" style={{ marginTop: '4px' }}>
                        <CircleAlert size={12} /> {signUpErrors.name}
                      </div>
                    )}
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      required
                      className={signUpErrors.email ? 'input-error' : ''}
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value)
                        setSignUpErrors((prev) => ({ ...prev, email: undefined }))
                      }}
                      placeholder="anand@example.org"
                    />
                    {signUpErrors.email && (
                      <div className="field-error" style={{ marginTop: '4px' }}>
                        <CircleAlert size={12} /> {signUpErrors.email}
                      </div>
                    )}
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      required
                      minLength={6}
                      className={signUpErrors.password ? 'input-error' : ''}
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value)
                        setSignUpErrors((prev) => ({ ...prev, password: undefined }))
                      }}
                      placeholder="At least 6 characters"
                    />
                    {signUpErrors.password && (
                      <div className="field-error" style={{ marginTop: '4px' }}>
                        <CircleAlert size={12} /> {signUpErrors.password}
                      </div>
                    )}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <label>
                      Civic Role
                      <select value={regRole} onChange={(e) => setRegRole(e.target.value as UserRole)}>
                        <option value="citizen">Citizen Contributor</option>
                        <option value="planner">Municipal Planner</option>
                        <option value="auditor">Civic Auditor</option>
                      </select>
                    </label>
                    <label>
                      Organization
                      <input
                        type="text"
                        value={regOrg}
                        onChange={(e) => setRegOrg(e.target.value)}
                        placeholder="e.g. Ward 4 Forum"
                      />
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button type="button" className="button button-quiet small" onClick={() => setShowAuthModal(false)}>Cancel</button>
                    <button type="submit" className="button button-primary small" disabled={authLoading}>
                      {authLoading ? 'Registering…' : 'Register Account'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="modal-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: '#68827c' }}>
                Signed in as <strong>{currentUser.name}</strong> ({currentUser.email})
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="button button-quiet small" onClick={handleSignOut}>
                  Sign Out
                </button>
                <button type="button" className="button button-primary small" onClick={() => setShowAuthModal(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Toast Notification Stack */}
      {toasts.length > 0 && (
        <div className="toast-stack" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast-item ${toast.type}`}>
              <div className="toast-icon">
                {toast.type === 'success' && <CheckCircle2 size={16} />}
                {toast.type === 'warning' && <TriangleAlert size={16} />}
                {toast.type === 'error' && <CircleAlert size={16} />}
                {toast.type === 'info' && <Sparkles size={16} />}
              </div>
              <div className="toast-body">
                <p className="toast-msg">{toast.message}</p>
                {toast.action && (
                  <button
                    type="button"
                    className="toast-action"
                    onClick={() => {
                      toast.action?.onClick()
                      dismissToast(toast.id)
                    }}
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                className="toast-close"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <footer className="shell">
        <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-label="CivicPriorities home">
          <span className="brand-mark"><Sparkles size={16} /></span>
          <span>Civic<span>Priorities</span></span>
        </div>
        <div className="footer-links">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>Workbench</a>
          <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy') }}>Privacy Policy</a>
          <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms') }}>Terms of Service</a>
          {lastConfirmedDraft && (
            <a href="/thank-you" onClick={(e) => { e.preventDefault(); navigate('/thank-you') }}>Recent Receipt</a>
          )}
          <a href="https://github.com/ramnnn2006/civic-priorities" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <p>A transparent civic planning tool. Open source on GitHub.</p>
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
        <strong>{candidate.score === null ? 'Paused' : candidate.score.toFixed(1)}</strong>
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
