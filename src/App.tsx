import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TextureErrorBoundary } from './components/TextureErrorBoundary'
import { Gallery } from './components/Gallery'
import { NavigationPill } from './components/NavigationPill'
import { ArtworkModal } from './components/ArtworkModal'
import { AboutSection } from './components/AboutSection'
import { HomeHero } from './components/HomeHero'
import { BlogSection } from './components/BlogSection'
import { GalleryGrid } from './components/GalleryGrid'
import { CommissionCalculator } from './components/CommissionCalculator'
import { CustomCursor } from './components/CustomCursor'
import { GamesHub } from './components/GamesHub'
import { PremiumFooter } from './components/PremiumFooter'
import { SecretEasterEggModal } from './components/SecretEasterEggModal'
import { SplatViewerModal } from './components/SplatViewerModal'
import { SuperzoomModal } from './components/SuperzoomModal'
import { EspejoDelAlmaModal } from './components/EspejoDelAlmaModal'
import { CuratorialTerminal } from './components/CuratorialTerminal'
import { artworks } from './data/artworks'
import { audioFX } from './utils/AudioFX'

function App() {
  const [loading, setLoading] = useState(true)
  const [activeArtwork, setActiveArtwork] = useState(null)
  const [activeArtworkIndex, setActiveArtworkIndex] = useState(null)
  const [view, setView] = useState('home')
  const [isWebGLMounted, setIsWebGLMounted] = useState(false)
  
  // ⚡ Capa Sota WOW Modals State
  const [splatOpen, setSplatOpen] = useState(false)
  const [superzoomOpen, setSuperzoomOpen] = useState(false)
  const [easterEggOpen, setEasterEggOpen] = useState(false)
  const [espejoOpen, setEspejoOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)

  const navigate = useCallback((newView) => {
    if (view === newView) return
    audioFX.playClick()
    setView(newView)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view])

  const scrollToGallery = useCallback(() => {
    navigate('gallery')
  }, [navigate])

  useEffect(() => {
    const handleHash = () => {
      const raw = window.location.hash.replace(/^#/, '').replace(/^\//, '').toLowerCase()
      const seg = (raw || 'home').split('?')[0].split('/')[0] || 'home'
      const hashMap = {
        'home': 'home', 'obra': 'obra', 'destacada': 'obra',
        'galeria': 'gallery', 'gallery': 'gallery',
        'sala3d': 'sala', 'sala': 'sala', 'studio': 'sala',
        'blog': 'blog', 'bitacora': 'blog', 'journal': 'blog',
        'sobre-mi': 'about', 'about': 'about', 'bio': 'about',
        'juegos': 'games', 'games': 'games',
        'encargos': 'encargos', 'commission': 'encargos', 'retratos': 'encargos', 'calculadora': 'encargos'
      }
      const newView = hashMap[seg] || 'home'
      if (view !== newView) {
        setView(newView)
      }
    }
    
    window.addEventListener('hashchange', handleHash)
    handleHash() // init on load
    return () => window.removeEventListener('hashchange', handleHash)
  }, [view])

  // ⚡ Superzoom state for external trigger
  const [externalZoomArtwork, setExternalZoomArtwork] = useState(null)
  
  useEffect(() => {
    const handleOpenSuperzoom = (e) => {
      if (e.detail && e.detail.artwork) {
        setExternalZoomArtwork(e.detail.artwork)
        setSuperzoomOpen(true)
      }
    }
    window.addEventListener('open-superzoom', handleOpenSuperzoom)
    return () => window.removeEventListener('open-superzoom', handleOpenSuperzoom)
  }, [])

  useEffect(() => {
    document.title = view === 'sala' 
      ? 'Sala 3D — Naroa Gutiérrez Gil' 
      : 'Naroa Gutiérrez Gil — Hiperrealismo POP'
    
    // Audio Context Resume on first interaction
    const resumeAudio = () => {
      audioFX.unlock()
    }
    window.addEventListener('click', resumeAudio, { once: true })
    window.addEventListener('touchstart', resumeAudio, { once: true })
    return () => {
      window.removeEventListener('click', resumeAudio)
      window.removeEventListener('touchstart', resumeAudio)
    }
  }, [view])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== 'sala' || activeArtwork) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (activeArtworkIndex === null) setActiveArtworkIndex(0)
        else setActiveArtworkIndex((activeArtworkIndex + 1) % artworks.length)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (activeArtworkIndex === null) setActiveArtworkIndex(artworks.length - 1)
        else setActiveArtworkIndex((activeArtworkIndex - 1 + artworks.length) % artworks.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, activeArtwork, activeArtworkIndex])

  const openArtwork = (index) => {
    audioFX.playWhoosh()
    setActiveArtwork(artworks[index])
    setActiveArtworkIndex(index)
  }

  const closeArtwork = () => {
    audioFX.playClick()
    setActiveArtwork(null)
  }

  const nextArtwork = useCallback(() => {
    if (activeArtworkIndex === null) return
    const nextIdx = (activeArtworkIndex + 1) % artworks.length
    setActiveArtwork(artworks[nextIdx])
    setActiveArtworkIndex(nextIdx)
  }, [activeArtworkIndex])

  const prevArtwork = useCallback(() => {
    if (activeArtworkIndex === null) return
    const prevIdx = (activeArtworkIndex - 1 + artworks.length) % artworks.length
    setActiveArtwork(artworks[prevIdx])
    setActiveArtworkIndex(prevIdx)
  }, [activeArtworkIndex])

  return (
    <>
      <CustomCursor />
      <NavigationPill 
        currentView={view} 
        setView={navigate} 
        onOpenTerminal={() => setTerminalOpen(true)}
      />

      {/* Lienzo 3D: permanece montado siempre para no destruir el contexto WebGL */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, opacity: view === 'sala' ? 1 : 0, pointerEvents: view === 'sala' ? 'auto' : 'none', transition: 'opacity 0.5s ease' }}>
        <TextureErrorBoundary>
          <Gallery 
            setLoading={setLoading}
            setActiveArtworkIndex={openArtwork}
            activeArtworkIndex={activeArtworkIndex}
            isMounted={isWebGLMounted}
            setIsMounted={setIsWebGLMounted}
          />
        </TextureErrorBoundary>
      </div>

      {loading && view === 'sala' && (
        <div className="loader">
          <div className="spinner"></div>
          <div className="loader-text">Cargando Sala 3D...</div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.main
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ position: 'relative', zIndex: 10, width: '100%', minHeight: '100vh', background: view === 'sala' ? 'transparent' : 'rgba(5,5,8,0.4)', pointerEvents: 'none' }}
        >
          {view === 'home' && <HomeHero onNavigate={navigate} />}
          {view === 'gallery' && <GalleryGrid onOpenArtwork={openArtwork} />}
          {view === 'obra' && <GalleryGrid onOpenArtwork={openArtwork} />}
          {view === 'blog' && <BlogSection />}
          {view === 'about' && <AboutSection onNavigate={navigate} />}
          {view === 'encargos' && <CommissionCalculator />}
          {view === 'games' && <GamesHub onNavigate={navigate} />}
        </motion.main>
      </AnimatePresence>

      {view === 'sala' && (
        <div className="artwork-caption-wrapper" style={{ pointerEvents: 'auto' }}>
          <button className="caption-arrow" onClick={() => openArtwork((activeArtworkIndex === null ? artworks.length - 1 : (activeArtworkIndex - 1 + artworks.length) % artworks.length))} aria-label="Anterior obra">
            ‹
          </button>
          <div className="artwork-caption">
            <div className="artwork-clickable" onClick={() => openArtwork(activeArtworkIndex === null ? 0 : activeArtworkIndex)}>
              <span className="artwork-index">{((activeArtworkIndex === null ? 0 : activeArtworkIndex) + 1).toString().padStart(2, '0')} / {artworks.length.toString().padStart(2, '0')}</span>
              <span className="artwork-title">{activeArtworkIndex === null ? 'Selecciona Obra' : artworks[activeArtworkIndex].title}</span>
            </div>
            <button className="artwork-cta-btn" onClick={() => setSplatOpen(true)}>
              Splat 3D
            </button>
          </div>
          <button className="caption-arrow" onClick={() => openArtwork(activeArtworkIndex === null ? 0 : (activeArtworkIndex + 1) % artworks.length)} aria-label="Siguiente obra">
            ›
          </button>
        </div>
      )}

      {view === 'sala' && (
        <div className="gallery-dots-bar" style={{ pointerEvents: 'auto' }}>
          {artworks.map((art, idx) => (
            <button
              key={art.id}
              className={`dot-item ${activeArtworkIndex === idx ? 'active' : ''}`}
              onClick={() => openArtwork(idx)}
              aria-label={`Ir a la obra ${art.title}`}
            />
          ))}
        </div>
      )}

      {view === 'sala' && <div className="scroll-hint"><span></span></div>}

      {/* Modal Principal */}
      <AnimatePresence>
        {activeArtwork && (
          <ArtworkModal 
            artwork={activeArtwork} 
            onClose={closeArtwork} 
            onNext={nextArtwork}
            onPrev={prevArtwork}
            onOpenSuperzoom={(art) => {
              setExternalZoomArtwork(art)
              setSuperzoomOpen(true)
              setActiveArtwork(null)
            }}
            onOpenSplat={(art) => {
              setSplatOpen(true)
              setActiveArtwork(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Modales Sota WOW */}
      <SplatViewerModal 
        isOpen={splatOpen} 
        onClose={() => setSplatOpen(false)} 
        artwork={activeArtwork || artworks[activeArtworkIndex || 0]} 
      />
      <SuperzoomModal 
        isOpen={superzoomOpen} 
        onClose={() => {
          setSuperzoomOpen(false)
          setExternalZoomArtwork(null)
        }} 
        artwork={externalZoomArtwork || activeArtwork} 
      />
      <SecretEasterEggModal isOpen={easterEggOpen} onClose={() => setEasterEggOpen(false)} />
      <EspejoDelAlmaModal isOpen={espejoOpen} onClose={() => setEspejoOpen(false)} />
      <CuratorialTerminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />

      <PremiumFooter onOpenEasterEgg={() => setEasterEggOpen(true)} onOpenEspejo={() => setEspejoOpen(true)} />

      {/* Botón flotante WhatsApp (integrado desde master 2026-08-12) */}
      <a
        className="whatsapp-float"
        href="https://wa.me/34644430834?text=Hola%20Naroa%2C%20me%20gustar%C3%ADa%20hablar%20sobre%20un%20posible%20encargo."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        title="Escríbeme por WhatsApp"
      >
        <span aria-hidden="true">💬</span>
      </a>
    </>
  )
}

export default App
