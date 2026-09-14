import { useState, useMemo } from 'react'
import {
  ArrowRight,
  Database,
  Sliders,
  ShieldCheck,
  BadgeCheck,
  Layers,
  FileCheck2,
  UsersRound,
  Droplets,
  Route as RoadIcon,
  Sun
} from 'lucide-react'
import { configs } from '../data'
import { scoreCandidates } from '../engine'
import type { ConfigId, UserRole } from '../types'

interface LandingPageProps {
  onNavigate: (path: string) => void
  onSelectRegionAndCategory: (regionId: ConfigId, category: 'water' | 'roads' | 'lighting') => void
  onPickRole: (role: UserRole) => void
}

export function LandingPage({ onNavigate, onSelectRegionAndCategory, onPickRole }: LandingPageProps) {
  const [selectedConfigId, setSelectedConfigId] = useState<ConfigId>('IN-TN')
  const [selectedCategory, setSelectedCategory] = useState<'water' | 'roads' | 'lighting'>('water')
  const [demandWeight, setDemandWeight] = useState(0.55)

  const activeConfig = useMemo(() => {
    return configs.find((c) => c.id === selectedConfigId) || configs[0]
  }, [selectedConfigId])

  const showcaseCandidates = useMemo(() => {
    const matching = activeConfig.regions.filter((r) => r.category === selectedCategory)
    const regionsToScore = matching.length > 0
      ? matching
      : activeConfig.regions.filter((r) => r.category === activeConfig.regions[0]?.category)
    return scoreCandidates(
      regionsToScore,
      [],
      demandWeight,
      false
    )
  }, [activeConfig, selectedCategory, demandWeight])

  const handleLaunchWorkbench = (regionId: ConfigId, category: 'water' | 'roads' | 'lighting') => {
    onSelectRegionAndCategory(regionId, category)
    onNavigate('/workbench')
  }

  return (
    <div className="landing-page shell">
      <section className="landing-hero">
        <p className="eyebrow">
          <span /> Transparent Capital Planning
        </p>
        <h1>Fair municipal investments based on real community need</h1>
        <p className="landing-hero-lead">
          Instead of backroom negotiations or noisy internet polls, CivicPriorities combines verified resident outreach with physical infrastructure surveys to rank public projects openly.
        </p>
        <div className="landing-hero-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() => onNavigate('/workbench')}
          >
            <Sliders size={16} /> Open Planning Workbench <ArrowRight size={16} />
          </button>
          <a href="#live-showcase" className="button button-quiet">
            <Database size={16} /> Inspect Live Data
          </a>
        </div>
      </section>

      <section className="stats-banner" aria-label="Key system facts">
        <div className="stat-item">
          <strong>3 Pilot Cities</strong>
          <span>Tamil Nadu, Uttar Pradesh, and Pernambuco datasets</span>
        </div>
        <div className="stat-item">
          <strong>100% Explainable</strong>
          <span>Deterministic scoring math with zero hidden weighting</span>
        </div>
        <div className="stat-item">
          <strong>Missing Data Safety</strong>
          <span>Unverified records pause scoring instead of counting as zero</span>
        </div>
        <div className="stat-item">
          <strong>Verified Audits</strong>
          <span>Cryptographic hashes recorded on every planning decision</span>
        </div>
      </section>

      <section className="showcase-section" id="live-showcase">
        <div className="showcase-header">
          <div>
            <p className="eyebrow"><span /> Interactive Showcase</p>
            <h2>See real municipal calculations live</h2>
            <p>
              Switch pilot regions and adjust the policy slider below. Watch how verified resident requests and physical infrastructure deficits determine which candidate project ranks first.
            </p>
          </div>
          <button
            type="button"
            className="button button-primary small"
            onClick={() => handleLaunchWorkbench(selectedConfigId, selectedCategory)}
          >
            Launch in Workbench <ArrowRight size={14} />
          </button>
        </div>

        <div className="showcase-region-tabs" role="tablist">
          <button
            type="button"
            className={`showcase-region-tab ${selectedConfigId === 'IN-TN' && selectedCategory === 'water' ? 'active' : ''}`}
            onClick={() => {
              setSelectedConfigId('IN-TN')
              setSelectedCategory('water')
            }}
          >
            <Droplets size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Tamil Nadu (Drinking Water)
          </button>
          <button
            type="button"
            className={`showcase-region-tab ${selectedConfigId === 'IN-UP' && selectedCategory === 'roads' ? 'active' : ''}`}
            onClick={() => {
              setSelectedConfigId('IN-UP')
              setSelectedCategory('roads')
            }}
          >
            <RoadIcon size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Uttar Pradesh (Flood Roads)
          </button>
          <button
            type="button"
            className={`showcase-region-tab ${selectedConfigId === 'BR-PE' && selectedCategory === 'lighting' ? 'active' : ''}`}
            onClick={() => {
              setSelectedConfigId('BR-PE')
              setSelectedCategory('lighting')
            }}
          >
            <Sun size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Pernambuco (Solar Lighting)
          </button>
        </div>

        <div className="showcase-controls">
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#164840', marginBottom: '4px' }}>
              Policy Weight Balance: Public Demand {Math.round(demandWeight * 100)}% / Physical Deficit {Math.round((1 - demandWeight) * 100)}%
            </div>
            <div style={{ fontSize: '11px', color: '#59756f' }}>
              Drag to prioritize resident submissions or focus on existing physical infrastructure gaps
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
            <span style={{ fontSize: '11px', color: '#68847e' }}>Physical Deficit</span>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={demandWeight}
              onChange={(e) => setDemandWeight(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: '#177e6b' }}
              aria-label="Policy weighting slider"
            />
            <span style={{ fontSize: '11px', color: '#68847e' }}>Resident Demand</span>
          </div>
        </div>

        <div className="showcase-cards-grid">
          {showcaseCandidates.map((candidate, idx) => (
            <div
              key={candidate.id}
              className={`showcase-card ${candidate.selected ? 'ranked-first' : ''}`}
            >
              <div className="showcase-card-top">
                <span className="showcase-rank">#{idx + 1}</span>
                <span className={`status-chip ${candidate.eligibility === 'ELIGIBLE' ? (candidate.selected ? 'high' : 'medium') : 'blocked'}`}>
                  {candidate.eligibility === 'ELIGIBLE' ? (candidate.selected ? 'Rank 1 Priority' : 'Shortlisted') : 'Paused for Audit'}
                </span>
              </div>
              <h3>{candidate.project}</h3>
              <div className="showcase-card-loc">{candidate.label}</div>

              <div className="showcase-metrics">
                <div className="showcase-metric-item">
                  <small>Community Need</small>
                  <strong>{candidate.requestUnits} requests</strong>
                </div>
                <div className="showcase-metric-item">
                  <small>Per 1k Residents</small>
                  <strong>{candidate.rate.toFixed(1)}</strong>
                </div>
                <div className="showcase-metric-item">
                  <small>Physical Gap</small>
                  <strong>{Math.round(candidate.gap * 100)}%</strong>
                </div>
              </div>

              <div className="showcase-score-row">
                <span style={{ fontSize: '11px', color: '#56756e' }}>
                  Budget: {activeConfig.currency} {(candidate.budgetMinor / 100).toLocaleString()}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', color: '#7a948e', display: 'block' }}>Score</span>
                  <strong style={{ fontSize: '18px', color: '#134e44', fontFamily: 'Fraunces, Georgia, serif' }}>
                    {candidate.score !== null ? candidate.score.toFixed(3) : 'Paused'}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="showcase-cta-strip">
          <div style={{ fontSize: '12.5px', color: '#1a4e44' }}>
            Want to simulate missing field surveys, test multilingual voice intake, or sign off a planning revision?
          </div>
          <button
            type="button"
            className="button button-primary small"
            onClick={() => handleLaunchWorkbench(selectedConfigId, activeConfig.regions[0]?.category ?? 'water')}
          >
            Open Full Workbench <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <section className="pillars-section">
        <div className="pillars-header">
          <p className="eyebrow"><span /> The Methodology</p>
          <h2>Four safeguards against political bias</h2>
          <p>
            Traditional municipal budgeting often prioritizes connected neighborhoods. Here is how CivicPriorities keeps allocations grounded in reality.
          </p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon"><UsersRound size={22} /></div>
            <h3>Balanced Resident Intake</h3>
            <p>
              Submissions collected by phone, paper surveys, and field staff are weighted equally with web app entries. Wards with lower smartphone access are never left behind.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon"><Layers size={22} /></div>
            <h3>Grounded Physical Deficits</h3>
            <p>
              Community enthusiasm alone cannot trigger funding. Every project is cross-checked against municipal asset inventories to verify that a genuine physical gap exists.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon"><ShieldCheck size={22} /></div>
            <h3>Missing Record Pausing</h3>
            <p>
              When survey data is absent or expired, the system pauses the project instead of giving it a zero score. This protects marginalized areas from being penalized for bureaucratic delays.
            </p>
          </div>
        </div>
      </section>

      <section className="jurisdictions-section">
        <div className="pillars-header">
          <p className="eyebrow"><span /> Real Deployments</p>
          <h2>Three pilot regions in production</h2>
          <p>
            Explore real datasets configured with local currencies, languages, and municipal infrastructure constraints.
          </p>
        </div>

        <div className="jurisdictions-grid">
          <div className="jurisdiction-card">
            <div>
              <span className="jurisdiction-badge">Tamil Nadu, India</span>
              <h3>Kovilpatti Municipal Council</h3>
              <p>
                Gauges drinking water distribution needs across North and South wards, balancing residential pipe renewal with commercial pressure booster grids.
              </p>
            </div>
            <div className="jurisdiction-meta">
              <span>Category: Water supply</span>
              <button
                type="button"
                className="button button-quiet small"
                onClick={() => handleLaunchWorkbench('IN-TN', 'water')}
              >
                Open Region
              </button>
            </div>
          </div>

          <div className="jurisdiction-card">
            <div>
              <span className="jurisdiction-badge">Uttar Pradesh, India</span>
              <h3>Gorakhpur Rural Block</h3>
              <p>
                Prioritizes box culvert installations and all-weather road elevation to protect flood-prone farming hamlets before the monsoon season begins.
              </p>
            </div>
            <div className="jurisdiction-meta">
              <span>Category: Roads and drainage</span>
              <button
                type="button"
                className="button button-quiet small"
                onClick={() => handleLaunchWorkbench('IN-UP', 'roads')}
              >
                Open Region
              </button>
            </div>
          </div>

          <div className="jurisdiction-card">
            <div>
              <span className="jurisdiction-badge">Pernambuco, Brazil</span>
              <h3>Caruaru Agreste District</h3>
              <p>
                Ranks solar-powered LED safety corridors along transit routes and school perimeters, combining police incident logs with neighborhood petitions.
              </p>
            </div>
            <div className="jurisdiction-meta">
              <span>Category: Street lighting</span>
              <button
                type="button"
                className="button button-quiet small"
                onClick={() => handleLaunchWorkbench('BR-PE', 'lighting')}
              >
                Open Region
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="pillars-section" style={{ marginBottom: '50px' }}>
        <div className="pillars-header">
          <p className="eyebrow"><span /> Stakeholders</p>
          <h2>Roles built for real municipal workflows</h2>
          <p>
            Different participants have distinct responsibilities. Choose a role to see how permissions adjust.
          </p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon"><FileCheck2 size={22} /></div>
            <h3>Municipal Planner</h3>
            <p>
              Configures policy weights, tests infrastructure feasibility, and signs off on the official shortlist for council submission.
            </p>
            <button
              type="button"
              className="button button-quiet small"
              style={{ marginTop: '16px', width: '100%' }}
              onClick={() => onPickRole('planner')}
            >
              Test as Planner
            </button>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon"><BadgeCheck size={22} /></div>
            <h3>Civic Auditor</h3>
            <p>
              Inspects baseline surveys, checks for digital collection disparities, and flags stalled projects for municipal resurvey.
            </p>
            <button
              type="button"
              className="button button-quiet small"
              style={{ marginTop: '16px', width: '100%' }}
              onClick={() => onPickRole('auditor')}
            >
              Test as Auditor
            </button>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon"><UsersRound size={22} /></div>
            <h3>Citizen Contributor</h3>
            <p>
              Submits neighborhood requests with physical evidence, tracks status receipts, and reviews public project scorecards.
            </p>
            <button
              type="button"
              className="button button-quiet small"
              style={{ marginTop: '16px', width: '100%' }}
              onClick={() => onPickRole('citizen')}
            >
              Test as Citizen
            </button>
          </div>
        </div>
      </section>

      <section className="landing-cta-banner">
        <h2>Ready to explore live municipal planning?</h2>
        <p>
          Open the workbench to adjust weights, analyze sensitivity tipping points, simulate missing survey paperwork, or export an audit memorandum.
        </p>
        <button
          type="button"
          className="button button-primary"
          style={{ background: '#ffffff', color: '#11443b' }}
          onClick={() => onNavigate('/workbench')}
        >
          <Sliders size={16} /> Launch Planning Workbench
        </button>
      </section>
    </div>
  )
}
