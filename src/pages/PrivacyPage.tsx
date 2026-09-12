import { ShieldCheck, ArrowLeft, Lock, Eye, Database, FileCheck } from 'lucide-react'

interface PageProps {
  onNavigate: (path: string) => void
}

export function PrivacyPage({ onNavigate }: PageProps) {
  return (
    <div className="shell page-container" style={{ padding: '40px 0 80px', maxWidth: '840px', margin: '0 auto' }}>
      <button 
        type="button" 
        onClick={() => onNavigate('/')} 
        className="button button-quiet small"
        style={{ marginBottom: '24px' }}
      >
        <ArrowLeft size={16} /> Back to Planning Workbench
      </button>

      <div className="page-header" style={{ marginBottom: '32px' }}>
        <p className="eyebrow"><span /> Data Governance & Safeguards</p>
        <h1 style={{ fontSize: '38px', margin: '8px 0 16px', color: '#103631' }}>
          Privacy Policy & Civic Data Standards
        </h1>
        <p style={{ color: '#54726b', fontSize: '16px', lineHeight: 1.6 }}>
          CivicPriorities operates under strict Digital Public Goods (DPG) data ethics. We transform multilingual public input into transparent planning indicators without creating surveillance vectors.
        </p>
      </div>

      <div className="policy-card-grid" style={{ display: 'grid', gap: '20px', marginBottom: '36px' }}>
        <article className="panel" style={{ background: '#ffffff' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14463e', marginBottom: '8px' }}>
            <Lock size={18} color="#188574" /> 1. Ephemeral Client Processing
          </h3>
          <p style={{ color: '#4d6963', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Session data, draft intake requests, and policy sensitivity sliders are processed within temporary memory allocations. We do not store persistent cross-site tracking cookies, device fingerprints, or advertising identifiers.
          </p>
        </article>

        <article className="panel" style={{ background: '#ffffff' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14463e', marginBottom: '8px' }}>
            <Eye size={18} color="#188574" /> 2. Audio & Speech Privacy
          </h3>
          <p style={{ color: '#4d6963', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Voice recordings captured through the microphone tool use standard browser Web Speech APIs. Raw audio files are never persisted on CivicPriorities servers or shared with commercial voice data brokers.
          </p>
        </article>

        <article className="panel" style={{ background: '#ffffff' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14463e', marginBottom: '8px' }}>
            <Database size={18} color="#188574" /> 3. Non-Discrimination & Silent Areas
          </h3>
          <p style={{ color: '#4d6963', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Under statutory planning equity guidelines, areas with lower digital literacy or smartphone density must not be penalized. Municipal planners are ethically mandated to supplement digital submissions with verified offline survey data.
          </p>
        </article>

        <article className="panel" style={{ background: '#ffffff' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14463e', marginBottom: '8px' }}>
            <FileCheck size={18} color="#188574" /> 4. Cryptographic Audit Hashes
          </h3>
          <p style={{ color: '#4d6963', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            When a planning recommendation is exported, an immutable SHA-256 evidence hash is generated from aggregate metrics (counts, population denominators, and policy weights). Individual submitter identities are segregated to protect citizen privacy.
          </p>
        </article>
      </div>

      <div style={{ background: '#eaf4ef', border: '1px solid #cce2d7', borderRadius: '12px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <ShieldCheck size={24} color="#178371" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#113e37', display: 'block', marginBottom: '4px' }}>Open Source Verification</strong>
          <span style={{ color: '#44665f', fontSize: '13.5px', lineHeight: 1.5 }}>
            All algorithms, server endpoints, and data contracts are public and auditable at{' '}
            <a href="https://github.com/ramnnn2006/civic-priorities" target="_blank" rel="noreferrer" style={{ color: '#146e5f', fontWeight: 600 }}>
              github.com/ramnnn2006/civic-priorities
            </a>.
          </span>
        </div>
      </div>
    </div>
  )
}
