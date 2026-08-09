import { Suspense, lazy, useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ARTWORKS, PORTAL, type Artwork } from './artworks'
import { ArtworkModal } from './components/ArtworkModal'


import { sound } from './utils/audio'

// Componentes estáticos
import Lenis from 'lenis'
import { CustomCursor } from './components/CustomCursor'
import { NavigationPill } from './components/NavigationPill'
import { HomeHero } from './components/HomeHero'
import { PremiumFooter } from './components/PremiumFooter'
import { VideogameHUD } from './components/VideogameHUD'
import { CuratorialTerminal } from './components/CuratorialTerminal'
import { EspejoDelAlmaModal } from './components/EspejoDelAlmaModal'
import { SecretEasterEggModal } from './components/SecretEasterEggModal'
import { TelemetryPixel } from './components/TelemetryPixel'


// Vistas con Lazy Loading (Ultrathink Code-Splitting)
const Scene = lazy(() => import('./components/Scene'))
const GalleryGrid = lazy(() => import('./components/GalleryGrid').then(module => ({ default: module.GalleryGrid })))
const CommissionCalculator = lazy(() => import('./components/CommissionCalculator').then(module => ({ default: module.CommissionCalculator })))
const GamesHub = lazy(() => import('./components/GamesHub').then(module => ({ default: module.GamesHub })))
const BlogSection = lazy(() => import('./components/BlogSection').then(module => ({ default: module.BlogSection })))

const toSlug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function Loader() {
  return (
    <div className="loader">
      <div className="spinner"></div>
      <div className="loader-text">MATERIALIZANDO...</div>
    </div>
  )
}

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home')

  const [modalArtwork, setModalArtwork] = useState<Artwork | null>(null)
  const [audioActive, setAudioActive] = useState<boolean>(sound.isEnabled())
  const [isWebGLMounted, setIsWebGLMounted] = useState(false)
  
  // ⚡ Capa Sota WOW Modals State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [isEspejoOpen, setIsEspejoOpen] = useState(false)
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false)
  const typedBufferRef = useRef('')

  // Estados del Videojuego FPS
  const [isStarted, setIsStarted] = useState(false)


  // Inicializar Lenis (Smooth Scrolling) SOTA
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null)
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 })
  const [playerRotation, setPlayerRotation] = useState(0)

  // Desactivar isStarted si salimos de la vista 3D
  useEffect(() => {
    if (currentView !== '3d') {
      setIsStarted(false)
    }
  }, [currentView])

  // Deferred WebGL Mounting: 
  useEffect(() => {
    const timer = setTimeout(() => setIsWebGLMounted(true), 800)
    return () => clearTimeout(timer)
  }, [])

  // ⚡ Capa Sota Global Key Listeners: Cmd+K, Secret Naroa/Borja Typing, Spacebar ASMR
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs/textareas
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return
      }

      // 1. Cmd+K / Ctrl+K Curatorial Terminal
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        sound.playTick()
        setIsTerminalOpen(prev => !prev)
        return
      }

      // 2. Spacebar Studio ASMR Audio Hold
      if (e.code === 'Space' && !e.repeat && !isStarted) {
        sound.startStudioASMR()
      }

      // 3. Secret Typing Buffer Listener for "naroa", "borja", "moskv"
      if (e.key.length === 1) {
        typedBufferRef.current = (typedBufferRef.current + e.key.toLowerCase()).slice(-12)
        if (
          typedBufferRef.current.includes('naroa') || 
          typedBufferRef.current.includes('borja') || 
          typedBufferRef.current.includes('moskv')
        ) {
          setIsEasterEggOpen(true)
          typedBufferRef.current = ''
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        sound.stopStudioASMR()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isStarted])

  // Auto-request Fullscreen on initial user interaction
  useEffect(() => {
    const handleInitialInteraction = () => {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {})
      }
    }

    window.addEventListener('pointerdown', handleInitialInteraction, { once: true })
    window.addEventListener('click', handleInitialInteraction, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleInitialInteraction)
      window.removeEventListener('click', handleInitialInteraction)
    }
  }, [])


  // Hash Navigation Handler
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash
      const cleanHash = rawHash.replace(/^#\/?/, '')

      if (cleanHash === 'gallery' || cleanHash === 'destacada' || cleanHash === 'galeria' || cleanHash === 'archivo' || cleanHash === 'obra' || cleanHash === 'obras') {
        setCurrentView('gallery')
        setModalArtwork(null)
      } else if (cleanHash === 'home' || cleanHash === 'inicio' || cleanHash === '') {
        setCurrentView('home')
        setModalArtwork(null)
      } else if (cleanHash === 'commissions' || cleanHash === 'encargos' || cleanHash === 'contacto') {
        setCurrentView('commissions')
        setModalArtwork(null)
      } else if (cleanHash === 'pop-lab' || cleanHash === 'juegos') {
        setCurrentView('pop-lab')
        setModalArtwork(null)
      } else if (cleanHash === 'blog') {
        setCurrentView('blog')
        setModalArtwork(null)
      } else if (cleanHash === 'sobre-mi' || cleanHash === 'about') {
        setCurrentView('about')
        setModalArtwork(null)
      } else if (cleanHash === '3d') {
        setCurrentView('3d')
        setModalArtwork(null)
      } else if (cleanHash.startsWith('obra-') || cleanHash.startsWith('obra/')) {
        const slug = cleanHash.replace(/^obra[-/]/, '')
        const match = ARTWORKS.find(a => a.slug === slug || toSlug(a.title) === slug)
        if (match) {
          setModalArtwork(match)
          setCurrentView('destacada')
        }
      } else {
        const match = ARTWORKS.find(a => a.slug === cleanHash || toSlug(a.title) === cleanHash)
        if (match) {
          setModalArtwork(match)
          setCurrentView('gallery')
        } else {
          setCurrentView('home')
        }
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (modalArtwork) {
      const slug = modalArtwork.slug || toSlug(modalArtwork.title)
      window.location.hash = `obra-${slug}`
      document.title = `${modalArtwork.title} (${modalArtwork.year}) — Naroa Gutiérrez Gil | Arte en Bilbao`
    } else {
      switch (currentView) {
        case 'gallery':
          document.title = 'The Gallery — Naroa Gutiérrez Gil | Fine Art'
          break
        case '3d':
          document.title = '3D Room — Naroa Gutiérrez Gil'
          break
        case 'about':
          document.title = 'Sobre Naroa Gutiérrez Gil — Manifiesto & Biografía'
          break
        case 'commissions':
          document.title = 'Private Commissions — Naroa Gutiérrez Gil'
          break
        case 'blog':
          document.title = 'Blog & Noticias — Naroa Gutiérrez Gil'
          break
        case 'pop-lab':
          document.title = 'The POP Lab — Naroa Gutiérrez Gil'
          break
        default:
          document.title = 'Naroa Gutiérrez Gil — Artista Visual | Hiperrealismo POP'
      }
    }
  }, [modalArtwork, currentView])

  const handleCloseModal = () => {
    setModalArtwork(null)
    setCurrentView('gallery')
    window.location.hash = '#/gallery'
  }

  const handleInspect = (index: number) => {
    sound.playOpen()
    setModalArtwork(ARTWORKS[index])
    setCurrentView('gallery')
    if (document.pointerLockElement) {
      document.exitPointerLock()
    }
  }

  const toggleAudio = () => {
    const newState = sound.toggleSound()
    setAudioActive(newState)
  }

  const isSceneActive = currentView === '3d' || currentView === 'gallery'

  // Escuchar cuando el usuario presiona ESC para salir del PointerLock
  useEffect(() => {
    const handlePointerLockChange = () => {
      if (!document.pointerLockElement) {
        setIsStarted(false)
      }
    }
    document.addEventListener('pointerlockchange', handlePointerLockChange)
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange)
  }, [])

  return (
    <>
      <CustomCursor />
      {/* Background SoundCloud Player: Boards Of Burgos (Borja Moskv) */}
      {audioActive && (
        <iframe
          id="soundcloud-bg-player"
          width="1"
          height="1"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src="https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F1927936712&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"
          style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none', zIndex: -1 }}
        />
      )}

      <div className="ui-layer" style={{ pointerEvents: 'none' }}>
        
        {/* Mostrar Navbar SIEMPRE que NO hayamos iniciado el modo FPS inmersivo */}
        {!isStarted && (
          <div style={{ pointerEvents: 'auto', width: '100%', zIndex: 50 }}>
            <NavigationPill currentView={currentView} audioActive={audioActive} toggleAudio={toggleAudio} />
          </div>
        )}

        {currentView === 'home' && <HomeHero />}

        {currentView === 'gallery' && (
          <div className="view-container" style={{ pointerEvents: 'auto' }}>
            <Suspense fallback={<Loader />}>
              <GalleryGrid onInspect={handleInspect} />
            </Suspense>
          </div>
        )}

        {currentView === '3d' && (
          <VideogameHUD 
            isStarted={isStarted} 
            onStart={() => setIsStarted(true)} 
            interactionPrompt={interactionPrompt} 
            playerPos={playerPos}
            playerRotation={playerRotation}
          />
        )}

        {currentView === 'commissions' && (
          <div className="view-container" style={{ pointerEvents: 'auto' }}>
            <Suspense fallback={<Loader />}>
              <CommissionCalculator />
            </Suspense>
          </div>
        )}

        {currentView === 'pop-lab' && (
          <div className="view-container" style={{ pointerEvents: 'auto' }}>
            <Suspense fallback={<Loader />}>
              <GamesHub />
            </Suspense>
          </div>
        )}

        {currentView === 'blog' && (
          <div className="view-container" style={{ pointerEvents: 'auto' }}>
            <Suspense fallback={<Loader />}>
              <BlogSection />
            </Suspense>
          </div>
        )}

        {currentView === 'about' && (
          <div className="view-container about-view" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '100px', pointerEvents: 'auto' }}>
            <div className="premium-card about-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', alignItems: 'center' }}>
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                src="/assets/naroa-portrait-DW8XfHYG.jpg"
                alt="Naroa Gutiérrez Gil"
                style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
              />
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="premium-badge premium-badge--gold">MANIFIESTO ARTÍSTICO</span>
                <h1 className="premium-title" style={{ fontSize: '2.8rem', marginTop: '1rem', lineHeight: '1.1' }}>
                  A O R A N / <span className="highlight-gold">N A R O A</span>
                </h1>
                <p className="premium-subtitle" style={{ color: '#D4AF37', fontWeight: 500, letterSpacing: '0.1em', marginTop: '0.5rem' }}>
                  A NAROA LA ORAN A
                </p>
                <p className="premium-subtitle" style={{ fontSize: '1.05rem', margin: '1.5rem 0 2rem' }}>
                  Artista visual en Bilbao especializada en hiperrealismo POP sobre pizarra natural y mica mineral.
                  Con más de 12.000 seguidores en su comunidad artística oficial. Cada piedra que uso tiene millones de años.
                  Cada retrato que pinto tiene la edad de quien lo mira.
                </p>
                <div className="about-links" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <a href="https://www.facebook.com/naroa.artista.plastica" target="_blank" rel="noopener noreferrer" className="premium-btn premium-btn--primary">
                    📘 FACEBOOK ARTISTA (12K+ SEGUIDORES) ↗
                  </a>
                  <a href={PORTAL} target="_blank" rel="noopener noreferrer" className="premium-btn">
                    🌐 PORTAL OFICIAL: NAROAGUTIERREZGIL.COM ↗
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {!isStarted && (
          <div style={{ pointerEvents: 'auto', width: '100%', marginTop: 'auto' }}>
            <PremiumFooter />
          </div>
        )}
      </div>

      {/* Escena 3D - FPS Game Engine */}
      {isWebGLMounted && (
        <Suspense fallback={null}>
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            zIndex: 1,
            opacity: isSceneActive ? 1 : 0, 
            pointerEvents: isSceneActive ? 'auto' : 'none',
            transition: 'opacity 0.5s ease-in-out'
          }}>
            <Scene
              onInspectArtwork={handleInspect}
              active={isSceneActive}
              setInteractionPrompt={setInteractionPrompt}
              isStarted={isStarted}
              onPlayerMove={(pos, rot) => {
                setPlayerPos(pos)
                setPlayerRotation(rot)
              }}
            />
          </div>
        </Suspense>
      )}

      <ArtworkModal
        artwork={modalArtwork}
        currentIndex={modalArtwork ? ARTWORKS.findIndex((a) => a.id === modalArtwork.id) : 0}
        onClose={handleCloseModal}
        onNavigate={(idx) => {
          setModalArtwork(ARTWORKS[idx])
        }}
      />

      {/* ⚡ Capa Sota WOW Modals */}
      <CuratorialTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />

      <EspejoDelAlmaModal
        isOpen={isEspejoOpen}
        onClose={() => setIsEspejoOpen(false)}
      />

      <SecretEasterEggModal
        isOpen={isEasterEggOpen}
        onClose={() => setIsEasterEggOpen(false)}
      />

      {/* 👁️ Oculto Pixel de Telemetría */}
      <TelemetryPixel
        currentView={currentView}
        activeArtworkSlug={modalArtwork?.slug}
      />
    </>
  )
}


