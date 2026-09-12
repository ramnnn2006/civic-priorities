import { ArrowLeft, Scale, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react'

interface PageProps {
  onNavigate: (path: string) => void
}

export function TermsPage({ onNavigate }: PageProps) {
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
        <p className="eyebrow"><span /> Rules and guidelines</p>
        <h1 style={{ fontSize: '38px', margin: '8px 0 16px', color: '#103631' }}>
          Terms of Service and Model Rules
        </h1>
        <p style={{ color: '#54726b', fontSize: '16px', lineHeight: 1.6 }}>
          CivicPriorities is a tool designed to help local governments and communities discuss budget priorities openly. Here are the core rules for how it works.
        </p>
      </div>

      <div className="terms-grid" style={{ display: 'grid', gap: '20px', marginBottom: '36px' }}>
        <article className="panel" style={{ background: '#ffffff' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14463e', marginBottom: '8px' }}>
            <Scale size={18} color="#188574" /> Recommendations only, not automated spending
          </h3>
          <p style={{ color: '#4d6963', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Rankings and priority scores from this engine are starting points for human discussion. This software is never allowed to disburse municipal money or approve contracts on its own.
          </p>
        </article>

        <article className="panel" style={{ background: '#ffffff' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14463e', marginBottom: '8px' }}>
            <AlertOctagon size={18} color="#188574" /> Missing paperwork pauses the ranking
          </h3>
          <p style={{ color: '#4d6963', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            If baseline survey data or project estimates are missing, the system pauses that candidate instead of guessing or giving it a zero. An incomplete record means planners need to gather better information first.
          </p>
        </article>

        <article className="panel" style={{ background: '#ffffff' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14463e', marginBottom: '8px' }}>
            <CheckCircle2 size={18} color="#188574" /> Official sign-off requires verified reviewers
          </h3>
          <p style={{ color: '#4d6963', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Anyone can test requests and leave public comments, but formal endorsement requires a verified planner or auditor login. The system tracks sequential revisions to prevent two people from overwriting each other.
          </p>
        </article>

        <article className="panel" style={{ background: '#ffffff' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14463e', marginBottom: '8px' }}>
            <ShieldAlert size={18} color="#188574" /> Review every extracted request
          </h3>
          <p style={{ color: '#4d6963', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Whether request categories come from Google Gemini or local rule sets, the tool always highlights the exact words you typed. Please check that quote before confirming it into the active planning list.
          </p>
        </article>
      </div>

      <div style={{ borderTop: '1px solid #d5e4dc', paddingTop: '20px', color: '#688680', fontSize: '13px' }}>
        Licensed under Apache 2.0 / MIT. Built for transparent civic planning and community discussion.
      </div>
    </div>
  )
}
