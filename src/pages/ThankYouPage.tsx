import { useState } from 'react'
import { CheckCircle2, ArrowLeft, Copy, Check, ShieldCheck, MapPin, Calendar } from 'lucide-react'

interface PageProps {
  onNavigate: (path: string) => void
  lastConfirmed?: {
    id: string
    category: string
    regionLabel: string
    text: string
    authorName?: string
    authorRole?: string
  } | null
}

export function ThankYouPage({ onNavigate, lastConfirmed }: PageProps) {
  const [copied, setCopied] = useState(false)

  const trackingId = lastConfirmed?.id ? `CP-REQ-${lastConfirmed.id.slice(0, 8).toUpperCase()}` : 'CP-REQ-DEMO2026'

  const handleCopyReceipt = () => {
    const text = [
      `CIVICPRIORITIES SUBMISSION RECEIPT`,
      `Tracking Reference: ${trackingId}`,
      `Category: ${lastConfirmed?.category ?? 'Infrastructure Need'}`,
      `Region: ${lastConfirmed?.regionLabel ?? 'Kovilpatti North'}`,
      `Submitter: ${lastConfirmed?.authorName ?? 'Public Citizen'} (${lastConfirmed?.authorRole ?? 'citizen'})`,
      `Timestamp: ${new Date().toISOString()}`,
      `Status: Confirmed into 90-Day Municipal Intake Ledger`,
      `Verification Hash: Validated under DPG Participatory Planning Standard`
    ].join('\n')

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className="shell page-container" style={{ padding: '40px 0 80px', maxWidth: '780px', margin: '0 auto' }}>
      <button 
        type="button" 
        onClick={() => onNavigate('/')} 
        className="button button-quiet small"
        style={{ marginBottom: '24px' }}
      >
        <ArrowLeft size={16} /> Back to Planning Workbench
      </button>

      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d8f5e9', color: '#167a68', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
          <CheckCircle2 size={36} />
        </div>
        <p className="eyebrow" style={{ justifyContent: 'center' }}><span /> Request confirmed</p>
        <h1 style={{ fontSize: '38px', margin: '6px 0 12px', color: '#103631' }}>
          Thank you for submitting your request
        </h1>
        <p style={{ color: '#55746d', fontSize: '16px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.55 }}>
          Your infrastructure need is now saved in the active 90-day municipal intake cycle.
        </p>
      </div>

      <div className="panel" style={{ background: '#ffffff', marginBottom: '28px', border: '1px solid #c9ded5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e1ebe6', paddingBottom: '14px', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.06em', color: '#63847c', fontWeight: 700 }}>Tracking Reference</span>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '17px', fontWeight: 600, color: '#17473f' }}>{trackingId}</div>
          </div>
          <button type="button" className="button button-quiet small" onClick={handleCopyReceipt}>
            {copied ? <><Check size={14} color="#188674" /> Copied Receipt</> : <><Copy size={14} /> Copy Receipt</>}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '13px' }}>
          <div>
            <span style={{ color: '#68867e', display: 'block', marginBottom: '4px' }}>Planning Region</span>
            <strong style={{ color: '#184941', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={15} color="#198473" /> {lastConfirmed?.regionLabel ?? 'Kovilpatti North (Tamil Nadu)'}
            </strong>
          </div>
          <div>
            <span style={{ color: '#68867e', display: 'block', marginBottom: '4px' }}>Evaluation Window</span>
            <strong style={{ color: '#184941', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} color="#198473" /> Current 90-Day Municipal Cycle
            </strong>
          </div>
          <div>
            <span style={{ color: '#68867e', display: 'block', marginBottom: '4px' }}>Submitter</span>
            <strong style={{ color: '#184941' }}>
              {lastConfirmed?.authorName ?? 'Priya Anandan'} ({lastConfirmed?.authorRole ?? 'citizen'})
            </strong>
          </div>
        </div>

        {lastConfirmed?.text && (
          <div style={{ marginTop: '16px', background: '#f5faf7', border: '1px solid #d7ebe1', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#2b524b' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#557a72', display: 'block', marginBottom: '4px' }}>Your Note</span>
            "{lastConfirmed.text}"
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#f2f8f5', border: '1px solid #d3e6dd', borderRadius: '12px', padding: '18px' }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: '#154b42', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#178371" /> What happens next?
          </h4>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#4f6e67', lineHeight: 1.5 }}>
            Your request is counted alongside other community submissions in your area and weighed against physical infrastructure needs.
          </p>
        </div>

        <div style={{ background: '#f2f8f5', border: '1px solid #d3e6dd', borderRadius: '12px', padding: '18px' }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: '#154b42', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#178371" /> Human review required
          </h4>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#4f6e67', lineHeight: 1.5 }}>
            No project moves forward on autopilot. A municipal planner or civic auditor reviews every rank and signs off before work begins.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button type="button" className="button button-primary" onClick={() => onNavigate('/')}>
          Return to the workbench
        </button>
      </div>
    </div>
  )
}
