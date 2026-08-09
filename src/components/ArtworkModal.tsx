import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ARTWORKS, type Artwork } from '../artworks'
import { sound } from '../utils/audio'
import { SplatViewerModal } from './SplatViewerModal'
import { SuperzoomModal } from './SuperzoomModal'

interface ArtworkModalProps {
  artwork: Artwork | null
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function ArtworkModal({ artwork, currentIndex, onClose, onNavigate }: ArtworkModalProps) {
  const touchStartX = useRef<number | null>(null)
  const [showSplat, setShowSplat] = useState(false)
  const [showSuperzoom, setShowSuperzoom] = useState(false)

  useEffect(() => {
    if (artwork) {
      sound.playOpen()
      setShowSplat(false)
      setShowSuperzoom(false)
    }
  }, [artwork])

  // Teclado en el modal: ESC para cerrar, flechas para cambiar de obra
  useEffect(() => {
    if (!artwork) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        const next = (currentIndex + 1) % ARTWORKS.length
        onNavigate(next)
      } else if (e.key === 'ArrowLeft') {
        const prev = (currentIndex - 1 + ARTWORKS.length) % ARTWORKS.length
        onNavigate(prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [artwork, currentIndex, onClose, onNavigate])

  if (!artwork) return null

  const handleNext = () => {
    const next = (currentIndex + 1) % ARTWORKS.length
    onNavigate(next)
  }

  const handlePrev = () => {
    const prev = (currentIndex - 1 + ARTWORKS.length) % ARTWORKS.length
    onNavigate(prev)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diffX = touchStartX.current - touchEndX
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
    touchStartX.current = null
  }

  const handleShare = async () => {
    sound.playTick()
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${artwork.title} — Naroa Gutiérrez Gil`,
          text: artwork.description,
          url: window.location.href,
        })
      } catch {
        // Share cancelled or unavailable
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('¡Enlace copiado al portapapeles!')
    }
  }

  return (
    <AnimatePresence>
      <div
        className="modal-backdrop"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-artwork-title"
      >
        <motion.div
          className="modal-content"
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal" autoFocus>
            ✕
          </button>
          <div className="modal-body" style={{ background: '#07070A', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.12)', overflow: 'hidden', boxShadow: '0 30px 90px rgba(0,0,0,0.95)' }}>
            {/* Left Image Section */}
            <div
              className="modal-image-wrapper"
              style={{
                cursor: 'zoom-in',
                position: 'relative',
                overflow: 'hidden',
                background: '#030305',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)'
              }}
              onClick={() => {
                sound.playTick()
                setShowSuperzoom(true)
              }}
              title="Haz clic para activar el Visor Macro Gigapixel"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={artwork.id}
                  src={artwork.url}
                  alt={artwork.title}
                  className="modal-image"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    maxHeight: '78vh',
                    width: '100%',
                    objectFit: 'contain',
                    imageRendering: 'high-quality',
                    filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.8))'
                  }}
                />
              </AnimatePresence>

              {/* Click for Macro Loupe Hint Badge */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(5, 5, 8, 0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(212, 175, 55, 0.5)',
                borderRadius: '30px',
                padding: '6px 16px',
                fontSize: '0.72rem',
                color: '#D4AF37',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                pointerEvents: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
              }}>
                🔍 LUPA MACRO GIGAPIXEL
              </div>
            </div>

            {/* Right Info Section */}
            <div className="modal-info" style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Index & Year Badges */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '4px 12px',
                    background: 'rgba(255, 0, 122, 0.15)',
                    border: '1px solid rgba(255, 0, 122, 0.4)',
                    borderRadius: '20px',
                    color: '#FF007A',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    letterSpacing: '0.08em'
                  }}>
                    {currentIndex + 1} / {ARTWORKS.length}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '4px 12px',
                    background: 'rgba(214, 175, 55, 0.15)',
                    border: '1px solid rgba(214, 175, 55, 0.4)',
                    borderRadius: '20px',
                    color: '#D4AF37',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    letterSpacing: '0.08em'
                  }}>
                    {artwork.year}
                  </span>
                </div>

                <h2 id="modal-artwork-title" className="modal-title" style={{
                  margin: '0 0 8px 0',
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: '#fff',
                  letterSpacing: '-0.02em',
                  fontFamily: 'var(--font-heading)'
                }}>
                  {artwork.title}
                </h2>

                <div className="modal-medium" style={{
                  color: '#00F0FF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  marginBottom: '18px'
                }}>
                  {artwork.medium}
                </div>

                <p className="modal-description" style={{
                  fontSize: '0.92rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 1.65,
                  margin: '0 0 20px 0'
                }}>
                  {artwork.description}
                </p>

                {/* Curatorial Reflection Quote */}
                <div style={{
                  marginBottom: '24px',
                  padding: '14px 18px',
                  background: 'rgba(255, 0, 122, 0.06)',
                  borderLeft: '3px solid #FF007A',
                  borderRadius: '0 12px 12px 0',
                  fontSize: '0.82rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontStyle: 'italic',
                  lineHeight: 1.5
                }}>
                  «Cada retrato empieza con una conversación. Retratos con alma, mimo y calma.»
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTick()
                      setShowSuperzoom(true)
                    }}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                      color: '#00F0FF',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    🔍 LUPA MACRO 4K
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    title="Compartir enlace de la obra"
                  >
                    COMPARTIR ⎘
                  </button>
                </div>

                {artwork.splatUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTick()
                      setShowSplat(true)
                    }}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(112, 0, 255, 0.2) 100%)',
                      border: '1px solid #00F0FF',
                      color: '#00F0FF',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)'
                    }}
                  >
                    ✨ EXPLORAR 3D GAUSSIAN SPLAT 360°
                  </button>
                )}

                {/* Primary Commission CTA */}
                <a
                  href="#/encargos"
                  onClick={() => {
                    sound.playOpen()
                    onClose()
                  }}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #FF007A 0%, #FFE600 100%)',
                    color: '#000',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    textDecoration: 'none',
                    boxShadow: '0 0 30px rgba(255, 0, 122, 0.45)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                >
                  ⚡ ENCARGAR EN ESTE ESTILO
                </a>

                {/* Navigation Next/Prev */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <button
                    onClick={handlePrev}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.6)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.08em'
                    }}
                  >
                    ← ANTERIOR
                  </button>
                  <button
                    onClick={handleNext}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.6)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.08em'
                    }}
                  >
                    SIGUIENTE →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {showSplat && artwork.splatUrl && (
        <SplatViewerModal
          splatUrl={artwork.splatUrl}
          title={artwork.title}
          onClose={() => setShowSplat(false)}
        />
      )}

      {showSuperzoom && (
        <SuperzoomModal
          imageSrc={artwork.url}
          title={artwork.title}
          medium={artwork.medium}
          onClose={() => setShowSuperzoom(false)}
        />
      )}
    </AnimatePresence>
  )
}

