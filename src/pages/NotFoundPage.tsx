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

      <p className="eyebrow" style={{ justifyContent: 'center' }}><span /> 404 error</p>
      <h1 style={{ fontSize: '42px', margin: '8px 0 14px', color: '#133a34' }}>
        We could not find that page
      </h1>
      <p style={{ color: '#59756f', fontSize: '16px', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 28px' }}>
        The link you followed does not match any active planning page, policy document, or saved audit record.
      </p>

      <div className="panel" style={{ background: '#ffffff', textAlign: 'left', marginBottom: '28px', border: '1px solid #d4e5dc' }}>
        <h4 style={{ margin: '0 0 8px', fontSize: '13.5px', color: '#184740', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={15} color="#188574" /> Here are a few helpful places to start
        </h4>
        <ul style={{ margin: 0, paddingLeft: '18px', color: '#486862', fontSize: '13px', lineHeight: 1.7 }}>
          <li>Go to the main <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('/') }} style={{ color: '#177a6a', fontWeight: 600 }}>Planning Workbench</a>.</li>
          <li>Read our <a href="/privacy" onClick={(e) => { e.preventDefault(); onNavigate('/privacy') }} style={{ color: '#177a6a', fontWeight: 600 }}>Privacy Policy</a>.</li>
          <li>Check our <a href="/terms" onClick={(e) => { e.preventDefault(); onNavigate('/terms') }} style={{ color: '#177a6a', fontWeight: 600 }}>Terms of Service and Model Rules</a>.</li>
        </ul>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button type="button" className="button button-primary" onClick={() => onNavigate('/')}>
          <Home size={16} /> Return to the workbench
        </button>
        <button type="button" className="button button-quiet" onClick={() => window.history.back()}>
          <ArrowLeft size={16} /> Go back
        </button>
      </div>
    </div>
  )
}
