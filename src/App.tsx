import { Suspense, lazy, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ARTWORKS, type Artwork } from './artworks'
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
import { TextureErrorBoundary } from './components/TextureErrorBoundary'


// Vistas con Lazy Loading (Ultrathink Code-Splitting)
const Scene = lazy(() => import('./components/Scene'))
const GalleryGrid = lazy(() => import('./components/GalleryGrid').then(module => ({ default: module.GalleryGrid })))
const CommissionCalculator = lazy(() => import('./components/CommissionCalculator').then(module => ({ default: module.CommissionCalculator })))
const GamesHub = lazy(() => import('./components/GamesHub').then(module => ({ default: module.GamesHub })))
const BlogSection = lazy(() => import('./components/BlogSection').then(module => ({ default: module.BlogSection })))
const AboutSection = lazy(() => import('./components/AboutSection').then(module => ({ default: module.AboutSection })))

const toSlug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function Loader() {
  return (
    <div className="loader">
      <div className="spinner"></div>
      <div className="loader-text">MATERIALIZANDO...</div>
    </div>
  )
}

const getInitialView = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase()
    const hash = window.location.hash.toLowerCase()
    if (host.includes('naroa.online') || hash.includes('3d') || hash.includes('juegos') || hash.includes('game') || hash.includes('play')) {
      return '3d'
    }
  }
  return 'home'
}

export default function App() {
  const [currentView, setCurrentView] = useState<string>(getInitialView)

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


  // Inicializar Lenis (Smooth Scrolling) SOTA — desactivado si el usuario prefiere movimiento reducido
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
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
            <NavigationPill
              currentView={currentView}
              audioActive={audioActive}
              toggleAudio={toggleAudio}
              onOpenTerminal={() => setIsTerminalOpen(true)}
              onOpenEspejo={() => setIsEspejoOpen(true)}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              style={{ width: '100%' }}
            >
              <HomeHero />
              <PremiumFooter />
            </motion.div>
          )}

          {currentView === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="view-container"
              style={{ pointerEvents: 'auto' }}
            >
              <Suspense fallback={<Loader />}>
                <GalleryGrid onInspect={handleInspect} />
              </Suspense>
              <PremiumFooter />
            </motion.div>
          )}

          {currentView === '3d' && (
            <motion.div
              key="3d"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <VideogameHUD 
                isStarted={isStarted} 
                onStart={() => setIsStarted(true)} 
                interactionPrompt={interactionPrompt} 
                playerPos={playerPos}
                playerRotation={playerRotation}
              />
            </motion.div>
          )}

          {currentView === 'commissions' && (
            <motion.div
              key="commissions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="view-container"
              style={{ pointerEvents: 'auto' }}
            >
              <Suspense fallback={<Loader />}>
                <CommissionCalculator />
              </Suspense>
              <PremiumFooter />
            </motion.div>
          )}

          {currentView === 'pop-lab' && (
            <motion.div
              key="pop-lab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="view-container"
              style={{ pointerEvents: 'auto' }}
            >
              <Suspense fallback={<Loader />}>
                <GamesHub />
              </Suspense>
              <PremiumFooter />
            </motion.div>
          )}

          {currentView === 'blog' && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="view-container"
              style={{ pointerEvents: 'auto' }}
            >
              <Suspense fallback={<Loader />}>
                <BlogSection />
              </Suspense>
              <PremiumFooter />
            </motion.div>
          )}

          {currentView === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="view-container"
              style={{ pointerEvents: 'auto' }}
            >
              <Suspense fallback={<Loader />}>
                <AboutSection />
              </Suspense>
              <PremiumFooter />
            </motion.div>
          )}
        </AnimatePresence>

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
            <TextureErrorBoundary label="Scene" fallback={null}>
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
            </TextureErrorBoundary>
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
