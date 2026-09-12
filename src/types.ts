export type Locale = 'ta-IN' | 'hi-IN' | 'pt-BR'
export type Category = 'water' | 'roads' | 'lighting'
export type InputChannel = 'text' | 'voice' | 'message_import'

export type ConfigId = 'IN-TN' | 'IN-UP' | 'BR-PE'

export interface RegionFixture {
  id: string
  label: string
  population: number
  category: Category
  coverage: number
  targetCoverage: number
  seededRequests: number
  costMinor: number
  budgetMinor: number
  currency: 'INR' | 'BRL'
  project: string
  description: string
}

export interface CountryConfig {
  id: ConfigId
  country: string
  state: string
  locale: Locale
  language: string
  currency: 'INR' | 'BRL'
  taxonomy: Record<Category, string>
  regions: RegionFixture[]
}

export interface Draft {
  id: string
  text: string
  category: Category
  regionId: string
  channel: InputChannel
  locale: Locale
  status: 'draft' | 'confirmed'
  spans: { start: number; end: number; quote: string; field: string }[]
}

export type Eligibility = 'ELIGIBLE' | 'BLOCKED' | 'ALREADY_FUNDED' | 'BUDGET_EXCLUDED'

export interface CandidateResult extends RegionFixture {
  requestUnits: number
  rate: number
  demand: number
  gap: number
  score: number | null
  eligibility: Eligibility
  reason?: string
  selected: boolean
}
