import { ArrowLeft, Compass, Search, Home } from 'lucide-react'

interface PageProps {
  onNavigate: (path: string) => void
}

export function NotFoundPage({ onNavigate }: PageProps) {
  return (
    <div className="shell page-container" style={{ padding: '60px 0 100px', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fff0eb', color: '#b24c32', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
        <Compass size={38} />
      </div>

      <p className="eyebrow" style={{ justifyContent: 'center' }}><span /> HTTP 404: Route Not Shortlisted</p>
      <h1 style={{ fontSize: '42px', margin: '8px 0 14px', color: '#133a34' }}>
        Page or Planning Run Not Found
      </h1>
      <p style={{ color: '#59756f', fontSize: '16px', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 28px' }}>
        The URL or jurisdiction parameter you requested does not correspond to an active planning workbench, verified policy document, or stored audit record.
      </p>

      <div className="panel" style={{ background: '#ffffff', textAlign: 'left', marginBottom: '28px', border: '1px solid #d4e5dc' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: '13.5px', color: '#184740', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={15} color="#188574" /> Suggested Municipal Navigation
        </h4>
        <ul style={{ margin: 0, paddingLeft: '18px', color: '#486862', fontSize: '13px', lineHeight: 1.7 }}>
          <li>Return to the main interactive <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('/') }} style={{ color: '#177a6a', fontWeight: 600 }}>Planning Workbench</a>.</li>
          <li>Review public <a href="/privacy" onClick={(e) => { e.preventDefault(); onNavigate('/privacy') }} style={{ color: '#177a6a', fontWeight: 600 }}>Data Privacy & Ephemeral Intake Policies</a>.</li>
          <li>Examine <a href="/terms" onClick={(e) => { e.preventDefault(); onNavigate('/terms') }} style={{ color: '#177a6a', fontWeight: 600 }}>Algorithmic Governance & Terms of Service</a>.</li>
        </ul>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button type="button" className="button button-primary" onClick={() => onNavigate('/')}>
          <Home size={16} /> Return to Home Workbench
        </button>
        <button type="button" className="button button-quiet" onClick={() => window.history.back()}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  )
}
