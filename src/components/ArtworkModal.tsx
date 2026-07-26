import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ARTWORKS, type Artwork } from '../artworks'
import { sound } from '../utils/audio'

interface ArtworkModalProps {
  artwork: Artwork | null
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function ArtworkModal({ artwork, currentIndex, onClose, onNavigate }: ArtworkModalProps) {
  useEffect(() => {
    if (artwork) {
      sound.playOpen()
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

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="modal-content"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
            ✕
          </button>

          <div className="modal-body">
            <div className="modal-image-wrapper">
              <AnimatePresence mode="wait">
                <motion.img
                  key={artwork.id}
                  src={artwork.url}
                  alt={artwork.title}
                  className="modal-image"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
              </AnimatePresence>
            </div>

            <div className="modal-info">
              <div className="modal-badge">
                <span className="modal-index">
                  {String(currentIndex + 1).padStart(2, '0')} / {String(ARTWORKS.length).padStart(2, '0')}
                </span>
                <span className="modal-year">{artwork.year}</span>
              </div>

              <h2 className="modal-title">{artwork.title}</h2>
              <div className="modal-medium">{artwork.medium}</div>

              <p className="modal-description">{artwork.description}</p>

              <div className="modal-actions">
                <a
                  href={artwork.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-cta"
                  onClick={() => sound.playTick()}
                >
                  ABRIR EN PORTAL OFICIAL ↗
                </a>
              </div>

              <div className="modal-nav">
                <button onClick={handlePrev} className="modal-nav-btn" title="Obra anterior">
                  ← ANTERIOR
                </button>
                <button onClick={handleNext} className="modal-nav-btn" title="Siguiente obra">
                  SIGUIENTE →
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
