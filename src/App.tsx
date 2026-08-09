import { Suspense, lazy, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ARTWORKS, PORTAL, type Artwork } from './artworks'
import { ArtworkModal } from './components/ArtworkModal'

import { sound } from './utils/audio'

// Componentes estáticos
import { NavigationPill } from './components/NavigationPill'
import { HomeHero } from './components/HomeHero'
import { PremiumFooter } from './components/PremiumFooter'
import { VideogameHUD } from './components/VideogameHUD'

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
  const [currentView, setCurrentView] = useState<'home' | '3d' | 'destacada' | 'encargos' | 'juegos' | 'about' | 'blog'>('destacada')

  const [modalArtwork, setModalArtwork] = useState<Artwork | null>(null)
  const [audioActive, setAudioActive] = useState<boolean>(sound.isEnabled())
  const [isWebGLMounted, setIsWebGLMounted] = useState(false)
  
  // Estados del Videojuego FPS
  const [isStarted, setIsStarted] = useState(false)
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

  // Hash Navigation Handler
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash
      const cleanHash = rawHash.replace(/^#\/?/, '')

      if (cleanHash === 'destacada' || cleanHash === 'galeria' || cleanHash === 'archivo' || cleanHash === 'obra' || cleanHash === 'obras') {
        setCurrentView('destacada')
        setModalArtwork(null)
      } else if (cleanHash === 'encargos' || cleanHash === 'contacto') {
        setCurrentView('encargos')
        setModalArtwork(null)
      } else if (cleanHash === 'juegos') {
        setCurrentView('juegos')
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
          setCurrentView('destacada')
        } else if (cleanHash === '') {
          setCurrentView('destacada')
        } else {
          setCurrentView('destacada')
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
    }
  }, [modalArtwork])

  const handleCloseModal = () => {
    setModalArtwork(null)
    setCurrentView('destacada')
    window.location.hash = '#/destacada'
  }

  const handleInspect = (index: number) => {
    sound.playOpen()
    setModalArtwork(ARTWORKS[index])
    setCurrentView('destacada')
    if (document.pointerLockElement) {
      document.exitPointerLock()
    }
  }

  const toggleAudio = () => {
    const newState = sound.toggleSound()
    setAudioActive(newState)
  }

  const isSceneActive = currentView === '3d' || currentView === 'destacada'

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

        {currentView === 'destacada' && (
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

        {currentView === 'encargos' && (
          <div className="view-container" style={{ pointerEvents: 'auto' }}>
            <Suspense fallback={<Loader />}>
              <CommissionCalculator />
            </Suspense>
          </div>
        )}

        {currentView === 'juegos' && (
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
    </>
  )
}
