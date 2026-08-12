import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ArtworkModal({ artwork, onClose, onNext, onPrev, onOpenSuperzoom, onOpenSplat }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onNext, onPrev])

  if (!artwork) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(5, 5, 8, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            background: 'rgba(14, 14, 20, 0.9)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '24px',
            maxWidth: '1100px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 40px rgba(245, 158, 11, 0.1)',
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Imagen */}
          <div style={{
            flex: '1.2',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            minHeight: '300px'
          }}>
            <img 
              src={artwork.src} 
              alt={artwork.title} 
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            {/* Overlay de zoom/splat actions en la imagen */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              display: 'flex',
              gap: '12px'
            }}>
              <button 
                className="premium-btn premium-btn--primary"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                onClick={() => onOpenSuperzoom(artwork)}
              >
                🔍 Superzoom
              </button>
              <button 
                className="premium-btn"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                onClick={() => onOpenSplat(artwork)}
              >
                🧊 Splat 3D
              </button>
            </div>
          </div>

          {/* Info */}
          <div style={{
            flex: '1',
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflowY: 'auto'
          }}>
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFF',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '1.2rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'
                e.currentTarget.style.borderColor = '#F59E0B'
                e.currentTarget.style.transform = 'rotate(90deg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.transform = 'rotate(0deg)'
              }}
            >
              ✕
            </button>

            <span className="premium-badge premium-badge--gold" style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
              {artwork.year}
            </span>
            
            <h2 style={{
              fontSize: '3rem',
              margin: '0 0 8px 0',
              color: '#FFFFFF',
              fontFamily: 'Outfit, sans-serif',
              lineHeight: '1.1'
            }}>
              {artwork.title}
            </h2>
            
            <p style={{
              fontFamily: 'Share Tech Mono, monospace',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem',
              marginBottom: '24px',
              letterSpacing: '0.1em'
            }}>
              {artwork.medium}
            </p>

            <p style={{
              fontSize: '1.05rem',
              lineHeight: '1.7',
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '40px'
            }}>
              {artwork.description}
            </p>

            <div style={{
              marginTop: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '24px'
            }}>
              <button onClick={onPrev} className="premium-btn" style={{ padding: '8px 16px' }}>
                ‹ Anterior
              </button>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', color: 'rgba(255,255,255,0.4)' }}>
                {artwork.id}/{artwork.total}
              </div>
              <button onClick={onNext} className="premium-btn" style={{ padding: '8px 16px' }}>
                Siguiente ›
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
