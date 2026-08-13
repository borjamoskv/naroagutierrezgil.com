import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children?: ReactNode
  label?: string
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class TextureErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Texture Loading Error:', error, errorInfo)
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback
      }
      return (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          color: '#FFF',
          zIndex: 50
        }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '16px' }}>⚠️ Error de Carga 3D</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
            No se pudieron cargar las texturas. Por favor, recarga la página.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#F59E0B',
              border: 'none',
              borderRadius: '30px',
              color: '#000',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Recargar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
