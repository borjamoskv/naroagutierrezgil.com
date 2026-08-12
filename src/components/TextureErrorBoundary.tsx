import { Component, type ReactNode } from 'react'

interface TextureErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  label?: string
}

interface TextureErrorBoundaryState {
  hasError: boolean
}

export class TextureErrorBoundary extends Component<TextureErrorBoundaryProps, TextureErrorBoundaryState> {
  state: TextureErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): TextureErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.warn(`[TextureErrorBoundary] Recurso 3D no disponible${this.props.label ? `: ${this.props.label}` : ''}`, error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}
