import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './index.ts'

const sessionId = '9eac1a45-91a7-49d7-82ef-8c5cc1e50c3b'
let server: Server
let base = ''

beforeEach(async () => {
  server = createApp().listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterEach(async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) })

async function request(path: string, body?: unknown) {
  const response = await fetch(`${base}${path}`, body === undefined ? undefined : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return { response, json: await response.json() as Record<string, unknown> }
}

describe('planning API', () => {
  it('stores server-generated drafts and rejects forged confirmation', async () => {
    const forged = await request('/api/v1/requests/confirm', { sessionId, draftId: '0b77bcb8-8768-43bf-8f7c-5bfe1797d5de' })
    expect(forged.response.status).toBe(404)

    const intake = await request('/api/v1/intake/analyze', { sessionId, configId: 'IN-TN', regionId: 'TN-KOV-N', text: 'Water access is unreliable in our locality.', channel: 'text' })
    expect(intake.response.status).toBe(201)
    const draft = intake.json.draft as { id: string; spans: { quote: string }[] }
    expect(draft.spans[0].quote).toBe('Water')

    const confirmation = await request('/api/v1/requests/confirm', { sessionId, draftId: draft.id })
    expect(confirmation.response.status).toBe(201)
    expect((confirmation.json.request as { status: string }).status).toBe('confirmed')
  })

  it('persists a category-scoped plan and enforces stale-review protection', async () => {
    const planned = await request('/api/v1/plans/compute', { sessionId, configId: 'IN-TN', category: 'water', demandWeight: .5, simulateMissingInvestment: false })
    expect(planned.response.status).toBe(201)
    const plan = planned.json as { id: string; revision: number; candidates: { category: string }[] }
    expect(plan.candidates).toHaveLength(2)
    expect(plan.candidates.every((candidate) => candidate.category === 'water')).toBe(true)

    const reviewed = await request(`/api/v1/plans/${plan.id}/review`, { sessionId, decision: 'reviewed', note: 'Checked fixture assumptions', expectedRevision: plan.revision })
    expect(reviewed.response.status).toBe(201)
    const stale = await request(`/api/v1/plans/${plan.id}/review`, { sessionId, decision: 'reviewed', note: '', expectedRevision: plan.revision })
    expect(stale.response.status).toBe(409)
  })

  it('stages matching message imports and reports incompatible rows', async () => {
    const imported = await request('/api/v1/intake/import', { sessionId, configId: 'IN-TN', regionId: 'TN-KOV-N', records: [{ text: 'Water is unavailable near the school.' }, { text: 'The road has dangerous potholes.' }] })
    expect(imported.response.status).toBe(201)
    const result = imported.json as { drafts: { status: string }[]; errors: unknown[] }
    expect(result.drafts).toHaveLength(1)
    expect(result.drafts[0].status).toBe('draft')
    expect(result.errors).toHaveLength(1)
  })

  it('serves health status and clusters with declared coverage', async () => {
    const health = await request('/health')
    expect(health.response.status).toBe(200)
    expect(health.json.status).toBe('ok')
    expect(health.json.aiMode).toBeDefined()

    const clusters = await (await fetch(`${base}/api/v1/clusters?sessionId=${sessionId}&configId=IN-TN`)).json() as { regionId: string; coverageDeclared: boolean }[]
    expect(Array.isArray(clusters)).toBe(true)
    expect(clusters.length).toBeGreaterThan(0)
    expect(clusters[0].coverageDeclared).toBe(true)
  })

  it('provides structured rationale explanation for a computed plan', async () => {
    const planned = await request('/api/v1/plans/compute', { sessionId, configId: 'IN-TN', category: 'water', demandWeight: .5, simulateMissingInvestment: true })
    const plan = planned.json as { id: string }
    const explained = await request(`/api/v1/plans/${plan.id}/explain`, { sessionId })
    expect(explained.response.status).toBe(200)
    const rationale = explained.json.rationale as { summary: string; reasons: string[]; caveats: string[] }
    expect(rationale.summary).toBeDefined()
    expect(rationale.reasons.length).toBeGreaterThan(0)
    expect(rationale.caveats.length).toBeGreaterThan(0)
    expect(explained.json.evidenceHash).toBeDefined()
  })

  it('returns JSON 404 for an unknown API route', async () => {
    const unknown = await request('/api/v1/not-a-route')
    expect(unknown.response.status).toBe(404)
    expect(unknown.json.error).toBe('API route not found')
  })
})
