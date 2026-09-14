import express from 'express'
import { createHash, randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { configs } from '../src/data.ts'
import { findCategory, makeDraft, scoreCandidates } from '../src/engine.ts'
import type { CandidateResult, ConfigId, Draft } from '../src/types.ts'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dirname, '..')
const configId = z.enum(['IN-TN', 'IN-UP', 'BR-PE'])
const uuid = z.string().uuid()
const sessionTtlMs = 24 * 60 * 60 * 1000

export type UserRole = 'planner' | 'auditor' | 'citizen'
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  organization: string
  createdAt: string
  passwordHash?: string
}
export interface AuthSession {
  token: string
  userId: string
  expiresAt: number
}

type StoredDraft = { draft: Draft; configId: ConfigId; expiresAt: number }
type StoredPlan = {
  id: string
  revision: number
  configId: ConfigId
  category: 'water' | 'roads' | 'lighting'
  candidates: CandidateResult[]
  evidenceHash: string
  createdAt: string
  reviewed?: {
    decision: 'reviewed' | 'rejected'
    note: string
    savedAt: string
    reviewer?: { id?: string; name?: string; role?: string; organization?: string }
  }
}
type Session = { touchedAt: number; drafts: Map<string, StoredDraft>; confirmed: Draft[]; plans: Map<string, StoredPlan> }

const getConfig = (id: ConfigId) => configs.find((config) => config.id === id)!
const apiError = (res: express.Response, status: number, error: string) => res.status(status).json({ error })
const getSession = (sessions: Map<string, Session>, id: string) => {
  const now = Date.now()
  for (const [key, value] of sessions) if (now - value.touchedAt > sessionTtlMs) sessions.delete(key)
  let session = sessions.get(id)
  if (!session) {
    if (sessions.size >= 100) throw new Error('capacity')
    session = { touchedAt: now, drafts: new Map(), confirmed: [], plans: new Map() }
    sessions.set(id, session)
  }
  session.touchedAt = now
  return session
}

async function getPlanRationale(plan: StoredPlan, config: ReturnType<typeof getConfig>, clientGroqKey?: string) {
  const groqKey = clientGroqKey || process.env.GROQ_API_KEY
  if (groqKey) {
    try {
      const prompt = `You are an AI civic planning auditor for an evidence-gated municipal prioritization system.
Region: ${config.country}, ${config.state} (${config.language})
Infrastructure Category: ${plan.category}
Candidates evaluated:
${JSON.stringify(plan.candidates, null, 2)}

Provide an audit rationale in JSON format with:
"summary": A clear 1-2 sentence executive explanation of the ranking and top candidate.
"reasons": An array of 2-3 specific evidence-backed observations (referencing request counts, rates per 1,000, infrastructure gap, and investment-block status).
"caveats": An array of 2 essential civic caveats (e.g. digital submission disparity, synthetic fixtures, requirement for human verification).
Respond ONLY with a valid JSON object matching { "summary": "...", "reasons": [...], "caveats": [...] }.`

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an AI civic planning auditor for an evidence-gated municipal prioritization system. Return only valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        }),
        signal: AbortSignal.timeout(8000)
      })

      if (response.ok) {
        const json = await response.json() as { choices?: { message?: { content?: string } }[] }
        const rawText = json.choices?.[0]?.message?.content
        if (rawText) {
          const parsed = JSON.parse(rawText) as { summary?: string; reasons?: string[]; caveats?: string[] }
          if (parsed && typeof parsed.summary === 'string') {
            return {
              provider: 'groq-llama-3.3-70b',
              rationale: {
                summary: parsed.summary,
                reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
                caveats: Array.isArray(parsed.caveats) ? parsed.caveats.map(String) : []
              }
            }
          }
        }
      }
    } catch {
      // Fall through to Gemini or deterministic fallback
    }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (apiKey) {
    try {
      const prompt = `You are an AI civic planning auditor for an evidence-gated municipal prioritization system.
Region: ${config.country}, ${config.state} (${config.language})
Infrastructure Category: ${plan.category}
Candidates evaluated:
${JSON.stringify(plan.candidates, null, 2)}

Provide an audit rationale in JSON format with:
"summary": A clear 1-2 sentence executive explanation of the ranking and top candidate.
"reasons": An array of 2-3 specific evidence-backed observations (referencing request counts, rates per 1,000, infrastructure gap, and investment-block status).
"caveats": An array of 2 essential civic caveats (e.g. digital submission disparity, synthetic fixtures, requirement for human verification).
Respond ONLY with a valid JSON object matching { "summary": "...", "reasons": [...], "caveats": [...] }.`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }),
        signal: AbortSignal.timeout(8000)
      })
      if (response.ok) {
        const json = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text
        if (rawText) {
          const parsed = JSON.parse(rawText) as { summary?: string; reasons?: string[]; caveats?: string[] }
          if (parsed && typeof parsed.summary === 'string') {
            return {
              provider: 'gemini-2.5-flash',
              rationale: {
                summary: parsed.summary,
                reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
                caveats: Array.isArray(parsed.caveats) ? parsed.caveats.map(String) : []
              }
            }
          }
        }
      }
    } catch {
      // Graceful fallback to deterministic rationale
    }
  }

  const top = plan.candidates.find((c) => c.selected)
  const blocked = plan.candidates.filter((c) => c.eligibility !== 'ELIGIBLE')

  return {
    provider: 'deterministic-rules',
    rationale: {
      summary: top
        ? `${top.project} in ${top.label} is ranked highest based on ${top.requestUnits} verified community requests (${top.rate.toFixed(1)}/1k residents) and a ${(top.gap * 100).toFixed(0)}% infrastructure deficit.`
        : 'No project candidate was shortlisted under the current constraints.',
      reasons: [
        `The formula combines normalized demand D (${top ? top.demand.toFixed(2) : '0'}) and infrastructure gap G (${top ? top.gap.toFixed(2) : '0'}).`,
        blocked.length > 0
          ? `${blocked.map((b) => b.project).join(', ')} is blocked from scoring due to missing investment inventory evidence.`
          : 'All evaluated candidates possess verified baseline investment evidence.',
        'Selection respects the budgetary envelope without cross-category confounding.'
      ],
      caveats: [
        groqKey || apiKey ? 'Live AI call timed out or failed; deterministic explanation used.' : 'No Groq or Gemini API key configured in server environment; deterministic audit rationale returned.',
        'This calculation is an evidence-gated decision support prototype, not a binding government allocation.'
      ]
    }
  }
}

export function createApp() {
  const app = express()
  const sessions = new Map<string, Session>()
  const users = new Map<string, User>()
  const authSessions = new Map<string, AuthSession>()

  const seedUsers: User[] = [
    {
      id: 'usr-planner-01',
      name: 'Maya Sundaram',
      email: 'maya.sundaram@civic.tn.gov.in',
      role: 'planner',
      organization: 'Tamil Nadu Urban Development Board',
      passwordHash: createHash('sha256').update('planner123').digest('hex'),
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-auditor-01',
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@open-audit.org',
      role: 'auditor',
      organization: 'Independent Civic Planning Observatory',
      passwordHash: createHash('sha256').update('auditor123').digest('hex'),
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-citizen-01',
      name: 'Priya Anandan',
      email: 'priya.anandan@community.org',
      role: 'citizen',
      organization: 'Kovilpatti Ward 4 Residents Forum',
      passwordHash: createHash('sha256').update('citizen123').digest('hex'),
      createdAt: new Date().toISOString()
    }
  ]
  seedUsers.forEach((u) => users.set(u.id, u))

  app.use(express.json({ limit: '1mb' }))

  // Better-Auth compatible endpoints
  app.get('/api/auth/demo-users', (_req, res) => {
    res.json(Array.from(users.values()).map(({ passwordHash, ...u }) => u))
  })

  app.get('/api/auth/get-session', (req, res) => {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-session-token'] as string)
    if (!token) return res.json({ session: null, user: null })
    const session = authSessions.get(token)
    if (!session || session.expiresAt < Date.now()) return res.json({ session: null, user: null })
    const user = users.get(session.userId)
    if (!user) return res.json({ session: null, user: null })
    const { passwordHash, ...safeUser } = user
    return res.json({ session: { token: session.token, expiresAt: session.expiresAt }, user: safeUser })
  })

  app.post('/api/auth/sign-in/email', (req, res) => {
    const body = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse(req.body)
    if (!body.success) return apiError(res, 400, 'Invalid email or password format')
    const user = Array.from(users.values()).find((u) => u.email.toLowerCase() === body.data.email.toLowerCase())
    if (!user) return apiError(res, 401, 'Invalid email or password')
    const hash = createHash('sha256').update(body.data.password).digest('hex')
    if (user.passwordHash !== hash) return apiError(res, 401, 'Invalid email or password')
    const token = randomUUID()
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
    authSessions.set(token, { token, userId: user.id, expiresAt })
    const { passwordHash, ...safeUser } = user
    return res.json({ token, user: safeUser })
  })

  app.post('/api/auth/sign-up/email', (req, res) => {
    const body = z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['planner', 'auditor', 'citizen']).default('citizen'),
      organization: z.string().max(120).default('Public Citizen')
    }).safeParse(req.body)
    if (!body.success) return apiError(res, 400, 'Invalid registration details')
    const existing = Array.from(users.values()).find((u) => u.email.toLowerCase() === body.data.email.toLowerCase())
    if (existing) return apiError(res, 409, 'User with this email already exists')
    const newUser: User = {
      id: `usr-${randomUUID().slice(0, 8)}`,
      name: body.data.name,
      email: body.data.email,
      role: body.data.role,
      organization: body.data.organization,
      passwordHash: createHash('sha256').update(body.data.password).digest('hex'),
      createdAt: new Date().toISOString()
    }
    users.set(newUser.id, newUser)
    const token = randomUUID()
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
    authSessions.set(token, { token, userId: newUser.id, expiresAt })
    const { passwordHash, ...safeUser } = newUser
    return res.status(201).json({ token, user: safeUser })
  })

  app.post('/api/auth/sign-out', (req, res) => {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-session-token'] as string)
    if (token) authSessions.delete(token)
    return res.json({ success: true })
  })

  app.get('/health', (_req, res) => {
    const hasGroq = Boolean(process.env.GROQ_API_KEY)
    const hasGemini = Boolean(process.env.GEMINI_API_KEY)
    return res.json({
      status: 'ok',
      aiMode: hasGroq ? 'groq-live' : (hasGemini ? 'gemini-live' : 'local-fallback'),
      provider: hasGroq ? 'groq-llama-3.3' : (hasGemini ? 'google-gemini' : 'deterministic-engine'),
      persistence: 'ephemeral-demo',
      timestamp: new Date().toISOString()
    })
  })
  app.get('/api/v1/config', (_req, res) => res.json(configs.map(({ regions, ...config }) => ({ ...config, regions: regions.map(({ population, coverage, seededRequests, costMinor, budgetMinor, ...region }) => region), limitations: ['Synthetic planning fixtures', 'Local extraction fallback until a server-side Gemini adapter is configured'] }))))

  app.post('/api/v1/intake/analyze', (req, res) => {
    const body = z.object({ sessionId: uuid, configId, regionId: z.string().min(1), text: z.string().min(1).max(5000), channel: z.enum(['text', 'voice', 'message_import']).default('text') }).safeParse(req.body)
    if (!body.success) return apiError(res, 422, 'Invalid intake request')
    const config = getConfig(body.data.configId)
    const region = config.regions.find((item) => item.id === body.data.regionId)
    if (!region) return apiError(res, 422, 'Region is not supported by this configuration')
    if (findCategory(body.data.text) !== region.category) return res.status(422).json({ error: 'Clarification required: choose a planning region that supports the extracted need.' })
    try {
      const session = getSession(sessions, body.data.sessionId)
      if (session.drafts.size >= 100) return apiError(res, 429, 'Demo draft limit reached')
      const draft = makeDraft(body.data.text, region.id, config.locale, body.data.channel)
      session.drafts.set(draft.id, { draft, configId: config.id, expiresAt: Date.now() + 15 * 60 * 1000 })
      return res.status(201).json({ draft, execution: { mode: 'local-fallback', provider: null, warning: 'No Gemini call was made.' } })
    } catch { return apiError(res, 503, 'Demo session capacity reached') }
  })

  app.post('/api/v1/requests/confirm', (req, res) => {
    const body = z.object({ sessionId: uuid, draftId: uuid }).safeParse(req.body)
    if (!body.success) return apiError(res, 422, 'Invalid confirmation request')
    const session = sessions.get(body.data.sessionId)
    const stored = session?.drafts.get(body.data.draftId)
    if (!session || !stored || stored.expiresAt < Date.now()) return apiError(res, 404, 'Draft not found or expired')
    const { draft } = stored
    const validSpans = draft.spans.length > 0 && draft.spans.every((span) => span.end > span.start && span.quote.length > 0 && Array.from(draft.text).slice(span.start, span.end).join('') === span.quote)
    const config = getConfig(stored.configId)
    const region = config.regions.find((item) => item.id === draft.regionId)
    if (!validSpans || !region || region.category !== draft.category || config.locale !== draft.locale) return apiError(res, 422, 'Draft evidence or configuration is invalid')
    const confirmed = { ...draft, status: 'confirmed' as const }
    session.drafts.delete(draft.id)
    if (!session.confirmed.some((item) => item.id === confirmed.id)) session.confirmed.push(confirmed)
    return res.status(201).json({ request: confirmed, idempotent: false })
  })

  app.post('/api/v1/intake/import', (req, res) => {
    const body = z.object({ sessionId: uuid, configId, regionId: z.string().min(1), records: z.array(z.object({ externalRecordId: z.string().max(120).optional(), text: z.string().min(1).max(5000) })).min(1).max(100) }).safeParse(req.body)
    if (!body.success) return apiError(res, 422, 'Invalid message import')
    const config = getConfig(body.data.configId)
    const region = config.regions.find((item) => item.id === body.data.regionId)
    if (!region) return apiError(res, 422, 'Region is not supported by this configuration')
    try {
      const session = getSession(sessions, body.data.sessionId)
      const drafts: Draft[] = []
      const errors: { index: number; error: string }[] = []
      body.data.records.forEach((record, index) => {
        if (findCategory(record.text) !== region.category) { errors.push({ index, error: 'Need does not match selected planning region category' }); return }
        if (session.drafts.size + drafts.length >= 100) { errors.push({ index, error: 'Demo draft limit reached' }); return }
        const draft = makeDraft(record.text, region.id, config.locale, 'message_import')
        session.drafts.set(draft.id, { draft, configId: config.id, expiresAt: Date.now() + 15 * 60 * 1000 })
        drafts.push(draft)
      })
      return res.status(201).json({ drafts, errors, execution: { mode: 'local-fallback', provider: null } })
    } catch { return apiError(res, 503, 'Demo session capacity reached') }
  })

  app.get('/api/v1/clusters', (req, res) => {
    const sessionId = uuid.safeParse(req.query.sessionId)
    const activeConfigId = configId.safeParse(req.query.configId)
    if (!sessionId.success || !activeConfigId.success) return apiError(res, 422, 'Valid sessionId and configId are required')
    const session = sessions.get(sessionId.data)
    const config = getConfig(activeConfigId.data)
    return res.json(config.regions.map((region) => ({ regionId: region.id, label: region.label, category: region.category, seededRequests: region.seededRequests, confirmedSessionRequests: session?.confirmed.filter((draft) => draft.regionId === region.id && draft.category === region.category).length ?? 0, population: region.population, coverageDeclared: true, sourceMode: 'synthetic' })))
  })

  app.post('/api/v1/plans/compute', (req, res) => {
    const body = z.object({ sessionId: uuid, configId, category: z.enum(['water', 'roads', 'lighting']).default('water'), demandWeight: z.number().min(0).max(1), simulateMissingInvestment: z.boolean().default(false) }).safeParse(req.body)
    if (!body.success) return apiError(res, 422, 'Invalid planning request')
    try {
      const session = getSession(sessions, body.data.sessionId)
      if (session.plans.size >= 50) return apiError(res, 429, 'Demo planning-run limit reached')
      const config = getConfig(body.data.configId)
      const candidates = scoreCandidates(config.regions.filter((region) => region.category === body.data.category), session.confirmed, body.data.demandWeight, body.data.simulateMissingInvestment)
      const plan: StoredPlan = { id: randomUUID(), revision: 1, configId: config.id, category: body.data.category, candidates, createdAt: new Date().toISOString(), evidenceHash: createHash('sha256').update(JSON.stringify({ config: config.id, candidates, policy: body.data.demandWeight })).digest('hex') }
      session.plans.set(plan.id, plan)
      return res.status(201).json({ ...plan, sourceMode: 'synthetic', policyVersion: 'demo-v1', disclaimer: 'A reviewed prototype calculation, not a government allocation.' })
    } catch { return apiError(res, 503, 'Demo session capacity reached') }
  })

  const loadPlan = (req: express.Request, res: express.Response) => {
    const sessionId = uuid.safeParse(req.body?.sessionId ?? req.query.sessionId)
    const planId = uuid.safeParse(req.params.id)
    if (!sessionId.success || !planId.success) { apiError(res, 422, 'Valid sessionId and plan ID are required'); return null }
    const plan = sessions.get(sessionId.data)?.plans.get(planId.data)
    if (!plan) { apiError(res, 404, 'Planning run not found'); return null }
    return plan
  }
  app.get('/api/v1/plans/:id', (req, res) => { const plan = loadPlan(req, res); if (plan) res.json(plan) })
  app.get('/api/v1/plans/:id/explain', async (req, res) => {
    const plan = loadPlan(req, res)
    if (!plan) return
    const config = getConfig(plan.configId)
    const clientKey = (req.headers['x-groq-key'] as string) || (req.query.groqKey as string)
    const { provider, rationale } = await getPlanRationale(plan, config, clientKey)
    res.json({ planId: plan.id, revision: plan.revision, evidenceHash: plan.evidenceHash, provider, rationale })
  })
  app.post('/api/v1/plans/:id/explain', async (req, res) => {
    const plan = loadPlan(req, res)
    if (!plan) return
    const config = getConfig(plan.configId)
    const clientKey = (req.headers['x-groq-key'] as string) || (req.body?.groqKey as string) || (req.query.groqKey as string)
    const { provider, rationale } = await getPlanRationale(plan, config, clientKey)
    res.json({ planId: plan.id, revision: plan.revision, evidenceHash: plan.evidenceHash, provider, rationale })
  })
  app.post('/api/v1/plans/:id/review', (req, res) => {
    const body = z.object({
      sessionId: uuid,
      decision: z.enum(['reviewed', 'rejected']),
      note: z.string().max(1000).default(''),
      expectedRevision: z.number().int().positive(),
      reviewer: z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        role: z.string().optional(),
        organization: z.string().optional()
      }).optional()
    }).safeParse(req.body)
    if (!body.success) return apiError(res, 422, 'Invalid review')
    const plan = loadPlan(req, res)
    if (!plan) return
    if (plan.revision !== body.data.expectedRevision) return apiError(res, 409, 'Planning run was updated; reload before reviewing')
    plan.reviewed = {
      decision: body.data.decision,
      note: body.data.note,
      savedAt: new Date().toISOString(),
      ...(body.data.reviewer ? { reviewer: body.data.reviewer } : {})
    }
    plan.revision += 1
    return res.status(201).json({ id: plan.id, revision: plan.revision, ...plan.reviewed })
  })
  app.use('/api', (_req, res) => apiError(res, 404, 'API route not found'))

  const dist = path.join(root, 'dist')
  if (existsSync(dist)) {
    app.use(express.static(dist))
    app.use((req, res) => req.accepts('html') ? res.sendFile(path.join(dist, 'index.html')) : res.status(404).end())
  }
  return app
}

if (process.env.RUN_SERVER === 'true') {
  const port = Number(process.env.PORT ?? 4173)
  createApp().listen(port, '0.0.0.0', () => console.log(`CivicPriorities API listening on :${port}`))
}
