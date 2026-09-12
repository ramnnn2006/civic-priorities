import { describe, expect, it } from 'vitest'
import { configs } from './data'
import { makeDraft, scoreCandidates } from './engine'

describe('planning score', () => {
  it('reproduces the documented weight reversal', () => {
    const regions = configs[0].regions.slice(0, 2)
    const even = scoreCandidates(regions, [], .5, false)
    const demandFirst = scoreCandidates(regions, [], .8, false)
    expect(even.map((x) => Math.round(x.score ?? 0))).toEqual([55, 45])
    expect(demandFirst.map((x) => Math.round(x.score ?? 0))).toEqual([54, 40])
  })
  it('blocks a project when the investment inventory is absent', () => {
    expect(scoreCandidates(configs[0].regions.slice(0, 2), [], .5, true).find((item) => item.id === 'TN-SAN-E')?.eligibility).toBe('BLOCKED')
  })
  it('keeps an explicit local extraction span', () => {
    const draft = makeDraft('Water is unavailable after noon', 'TN-KOV-N', 'ta-IN', 'text')
    const span = draft.spans[0]
    expect(Array.from(draft.text).slice(span.start, span.end).join('')).toBe(span.quote)
  })
  it('rejects a cross-category ranking', () => {
    expect(() => scoreCandidates(configs[0].regions, [], .5, false)).toThrow('share one category')
  })
})
