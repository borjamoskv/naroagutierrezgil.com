import React, { Component } from 'react'

export class TextureErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Texture Loading Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
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
          <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '16px' }}>⚠️ Error de Carga</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
            No se pudieron cargar las texturas 3D. Por favor, recarga la página.
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
