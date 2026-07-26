import { Suspense, lazy, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ARTWORKS, PORTAL, type Artwork } from './artworks'
import { ArtworkModal } from './components/ArtworkModal'
import { sound } from './utils/audio'

// La escena WebGL (three.js + postprocesado) carga en un chunk aparte
const Scene = lazy(() => import('./components/Scene'))

function Loader() {
  return (
    <div className="loader">
      <div className="spinner"></div>
      <div className="loader-text">MATERIALIZANDO LIENZO...</div>
    </div>
  )
}

export default function App() {
  const [current, setCurrent] = useState(0)
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const [modalArtwork, setModalArtwork] = useState<Artwork | null>(null)
  const [audioActive, setAudioActive] = useState<boolean>(sound.isEnabled())

  const artwork = ARTWORKS[current]

  const handleNext = () => {
    sound.playTick()
    const next = (current + 1) % ARTWORKS.length
    setTargetIndex(next)
  }

  const handlePrev = () => {
    sound.playTick()
    const prev = (current - 1 + ARTWORKS.length) % ARTWORKS.length
    setTargetIndex(prev)
  }

  const handleSelectDot = (index: number) => {
    sound.playTick()
    setTargetIndex(index)
  }

  const handleInspect = (index: number) => {
    sound.playOpen()
    setModalArtwork(ARTWORKS[index])
  }

  const toggleAudio = () => {
    const newState = sound.toggleSound()
    setAudioActive(newState)
  }

  return (
    <>
      <div className="ui-layer">
        <motion.header
          className="header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
        >
          <a href={PORTAL} className="logo" onClick={() => sound.playTick()}>
            <span className="logo-dot"></span>
            A O R A N / NAROA
          </a>
          <nav className="nav">
            <a href="#/" className="active">EXPOSICIÓN 3D</a>
            <a href={`${PORTAL}/sobre-mi/`} target="_blank" rel="noopener noreferrer" onClick={() => sound.playTick()}>
              MANIFIESTO
            </a>
            <a href={`${PORTAL}/encargos/`} target="_blank" rel="noopener noreferrer" onClick={() => sound.playTick()}>
              CONTACTO
            </a>
            <button
              className={`audio-btn ${audioActive ? 'active' : ''}`}
              onClick={toggleAudio}
              title={audioActive ? 'Desactivar audio' : 'Activar audio'}
            >
              <span className="audio-equalizer">
                <span className="eq-bar bar-1"></span>
                <span className="eq-bar bar-2"></span>
                <span className="eq-bar bar-3"></span>
              </span>
              <span className="audio-label">FX {audioActive ? 'ON' : 'OFF'}</span>
            </button>
          </nav>
        </motion.header>

        <div className="ui-middle">
          <motion.div
            className="headline"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1>GALERÍA 3D</h1>
            <p>
              Obra viva de Naroa Gutiérrez Gil — retratos que respiran en el espacio. Gira, explora e inspecciona cada lienzo.
            </p>
            <div className="nav-controls-hint">
              <span className="kbd-tag">←</span>
              <span className="kbd-tag">→</span>
              <span className="hint-text">ARRASTRAR · TECLAS · SCROLL</span>
            </div>
          </motion.div>
        </div>

        {/* Caption inferior interactivo con flechas de navegación */}
        <div className="artwork-caption-wrapper" role="region" aria-label="Navegación de obras">
          <button className="caption-arrow" onClick={handlePrev} title="Obra anterior" aria-label="Obra anterior">
            ‹
          </button>

          <div className="artwork-caption">
            <div
              className="artwork-clickable"
              onClick={() => handleInspect(current)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleInspect(current) }}
              aria-label={`Inspeccionar ${artwork.title}`}
            >
              <span className="artwork-index">
                {String(current + 1).padStart(2, '0')} / {String(ARTWORKS.length).padStart(2, '0')}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={artwork.id}
                  className="artwork-title"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  {artwork.title}
                </motion.span>
              </AnimatePresence>
              <span className="artwork-medium-badge">{artwork.year}</span>
              <button
                className="artwork-cta-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleInspect(current)
                }}
                aria-label={`Detalles de ${artwork.title}`}
              >
                INSPECCIONAR +
              </button>
            </div>
          </div>

          <button className="caption-arrow" onClick={handleNext} title="Siguiente obra" aria-label="Siguiente obra">
            ›
          </button>
        </div>

        {/* Carrusel de indicadores circulares de selector directo */}
        <div className="gallery-dots-bar" role="tablist" aria-label="Selector directo de obras">
          {ARTWORKS.map((item, idx) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={idx === current}
              aria-label={`Seleccionar obra ${idx + 1}: ${item.title}`}
              className={`dot-item ${idx === current ? 'active' : ''}`}
              onClick={() => handleSelectDot(idx)}
              onMouseEnter={() => sound.playHover()}
              title={`${item.title} (${idx + 1}/${ARTWORKS.length})`}
            />
          ))}
        </div>

        <footer className="footer">
          <div>
            <a href={PORTAL} target="_blank" rel="noopener noreferrer">
              PORTAL OFICIAL: naroagutierrezgil.com
            </a>
          </div>
          <div className="coordinates">KOBETAMENDI // 43.2630° N, 2.9350° W</div>
        </footer>
      </div>

      <div className="scroll-hint" aria-hidden="true">
        <span />
      </div>

      <Suspense fallback={<Loader />}>
        <Scene
          onCurrentChange={setCurrent}
          onInspectArtwork={handleInspect}
          targetIndex={targetIndex}
        />
      </Suspense>

      {/* Modal de inspección detallada */}
      <ArtworkModal
        artwork={modalArtwork}
        currentIndex={modalArtwork ? ARTWORKS.findIndex((a) => a.id === modalArtwork.id) : 0}
        onClose={() => setModalArtwork(null)}
        onNavigate={(idx) => {
          setModalArtwork(ARTWORKS[idx])
          setTargetIndex(idx)
        }}
      />
    </>
  )
}
