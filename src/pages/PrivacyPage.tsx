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
        <p className="eyebrow"><span /> Privacy and data</p>
        <h1 style={{ fontSize: '38px', margin: '8px 0 16px', color: '#103631' }}>
          How we handle your information
        </h1>
        <p style={{ color: '#54726b', fontSize: '16px', lineHeight: 1.6 }}>
          We built CivicPriorities to help communities decide what infrastructure needs attention first, not to collect personal data or track anyone. Here is how information moves through this tool.
        </p>
      </div>

      <div className="policy-card-grid" style={{ display: 'grid', gap: '20px', marginBottom: '36px' }}>
        <article className="panel" style={{ background: '#ffffff' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14463e', marginBottom: '8px' }}>
            <Lock size={18} color="#188574" /> Everything stays in your browser session
          </h3>
          <p style={{ color: '#4d6963', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            When you enter requests or adjust policy sliders, those calculations happen right on your device. We do not place tracking cookies, read your device history, or share data with ad networks.
          </p>
        </article>

        <article className="panel" style={{ background: '#ffffff' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14463e', marginBottom: '8px' }}>
            <Eye size={18} color="#188574" /> Voice recordings are not stored
          </h3>
          <p style={{ color: '#4d6963', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            If you use the microphone, your browser converts speech to text locally using its standard speech features. We never save your raw voice recordings or upload them to third-party audio collectors.
          </p>
        </article>

        <article className="panel" style={{ background: '#ffffff' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14463e', marginBottom: '8px' }}>
            <Database size={18} color="#188574" /> Neighborhoods with less internet access are never penalized
          </h3>
          <p style={{ color: '#4d6963', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Not everyone has a smartphone or reliable reception. A neighborhood with fewer online requests might still need urgent water or road repairs. Planners are required to supplement digital submissions with real on-the-ground surveys.
          </p>
        </article>

        <article className="panel" style={{ background: '#ffffff' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14463e', marginBottom: '8px' }}>
            <FileCheck size={18} color="#188574" /> Audit records protect identities
          </h3>
          <p style={{ color: '#4d6963', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            When a formal plan is exported, the verification hash only covers aggregate numbers such as totals, population counts, and policy weights. Personal names and contact details stay separate.
          </p>
        </article>
      </div>

      <div style={{ background: '#eaf4ef', border: '1px solid #cce2d7', borderRadius: '12px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <ShieldCheck size={24} color="#178371" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <span style={{ color: '#113e37', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Open source code</span>
          <span style={{ color: '#44665f', fontSize: '13.5px', lineHeight: 1.5 }}>
            All the scoring formulas, server endpoints, and data contracts are public and viewable at{' '}
            <a href="https://github.com/ramnnn2006/civic-priorities" target="_blank" rel="noreferrer" style={{ color: '#146e5f', fontWeight: 600 }}>
              github.com/ramnnn2006/civic-priorities
            </a>.
          </span>
        </div>
      </div>
    </div>
  )
}
