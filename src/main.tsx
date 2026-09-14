import { Component, type ReactNode, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('CivicPriorities runtime error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          background: '#fbf8f3',
          color: '#163532',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Something went wrong loading the page</h1>
          <p style={{ maxWidth: '520px', color: '#56756e', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
            An unexpected error occurred during rendering. You can try refreshing or resetting your browser session.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 18px',
                background: '#167e6b',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                localStorage.clear()
                window.location.href = '/'
              }}
              style={{
                padding: '10px 18px',
                background: '#fff',
                color: '#163532',
                border: '1px solid #c9bdae',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Clear Session Cache
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)

