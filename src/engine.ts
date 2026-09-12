import { categoryMeta } from './data'
import type { CandidateResult, Category, Draft, RegionFixture } from './types'

export const findCategory = (text: string): Category => {
  const normalized = text.toLocaleLowerCase()
  return (Object.keys(categoryMeta) as Category[]).find((category) =>
    categoryMeta[category].keywords.some((keyword) => normalized.includes(keyword)),
  ) ?? 'water'
}

export const makeDraft = (text: string, regionId: string, locale: Draft['locale'], channel: Draft['channel']): Draft => {
  const category = findCategory(text)
  const match = categoryMeta[category].keywords.find((keyword) => text.toLocaleLowerCase().includes(keyword))
  const codeUnitStart = match ? text.toLocaleLowerCase().indexOf(match.toLocaleLowerCase()) : 0
  const start = Array.from(text.slice(0, codeUnitStart)).length
  const end = start + Array.from(match ?? text.slice(0, 1)).length
  const quote = Array.from(text).slice(start, end).join('')
  return {
    id: crypto.randomUUID(), text, regionId, locale, channel, category, status: 'draft',
    spans: [{ start, end, quote, field: 'need' }],
  }
}

export function scoreCandidates(regions: RegionFixture[], drafts: Draft[], weight: number, missingPlan: boolean): CandidateResult[] {
  if (new Set(regions.map((region) => region.category)).size > 1) {
    throw new Error('Candidates must share one category and comparable metric definition before they can be ranked.')
  }
  const available = [...regions]
  const results = available.map((region) => {
    const added = drafts.filter((draft) => draft.status === 'confirmed' && draft.regionId === region.id && draft.category === region.category).length
    const requestUnits = region.seededRequests + added
    const rate = (1000 * requestUnits) / region.population
    const demand = Math.min(1, rate / 10)
    const gap = Math.max(0, (region.targetCoverage - region.coverage) / region.targetCoverage)
    const planMissing = missingPlan && region.id === available[1]?.id
    const score = 100 * (weight * demand + (1 - weight) * gap)
    return { ...region, requestUnits, rate, demand, gap, score: planMissing ? null : score, eligibility: planMissing ? 'BLOCKED' as const : 'ELIGIBLE' as const, reason: planMissing ? 'Investment inventory removed for this scenario.' : undefined, selected: false }
  })
  const budget = results[0]?.budgetMinor ?? 0
  let remaining = budget
  return [...results].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)).map((candidate) => {
    if (candidate.eligibility !== 'ELIGIBLE') return candidate
    if (candidate.costMinor > remaining) return { ...candidate, eligibility: 'BUDGET_EXCLUDED', reason: 'Does not fit the remaining local budget.' }
    remaining -= candidate.costMinor
    return { ...candidate, selected: true }
  })
}
