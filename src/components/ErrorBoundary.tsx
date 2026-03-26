'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Error capturado:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-bg p-4">
          <div className="max-w-md w-full bg-surface rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text-base mb-2">Algo salió mal</h2>
            <p className="text-text-muted mb-4">
              {this.state.error?.message || 'Ha ocurrido un error inesperado'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-black font-semibold rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-bg p-4">
          <div className="max-w-md w-full bg-surface rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-text-base mb-2">Error crítico</h2>
            <p className="text-text-muted mb-4">{error.message}</p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-black font-semibold rounded-lg"
            >
              Recargar página
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}