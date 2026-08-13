import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ARTWORKS } from '../artworks'

interface HomeHeroProps {
  onNavigate?: (view: string) => void
}

export function HomeHero({ onNavigate }: HomeHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const featuredArtworks = ARTWORKS.slice(0, 5)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArtworks.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [featuredArtworks.length])

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#050508',
      pointerEvents: 'auto'
    }}>
      {/* Background Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1
          }}
        >
          <img 
            src={featuredArtworks[currentSlide].url} 
            alt={featuredArtworks[currentSlide].title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.4) saturate(1.2)'
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 0%, rgba(5,5,8,0.8) 100%)'
          }} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="premium-badge premium-badge--gold" style={{ marginBottom: '24px' }}>
            Artista Visual · Bilbao
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(3rem, 10vw, 8rem)',
            fontWeight: 900,
            lineHeight: 0.9,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            marginBottom: '24px',
            letterSpacing: '-0.03em'
          }}
        >
          Naroa<br />
          <span style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #FFD700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '0.6em',
            letterSpacing: '0.05em'
          }}>
            Gutiérrez Gil
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '600px',
            marginBottom: '40px',
            fontWeight: 300,
            letterSpacing: '0.05em'
          }}
        >
          Hiperrealismo POP sobre pizarra natural y mica mineral.<br />
          El alma capturada en piedra milenaria.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button 
            onClick={() => onNavigate?.('gallery')}
            className="premium-btn premium-btn--primary"
            style={{ padding: '16px 32px', fontSize: '1rem' }}
          >
            Explorar Colección
          </button>
          <button 
            onClick={() => onNavigate?.('commissions')}
            className="premium-btn"
            style={{ padding: '16px 32px', fontSize: '1rem' }}
          >
            Encargar Retrato
          </button>
        </motion.div>
      </div>

      {/* Featured Artwork Info */}
      <motion.div
        key={`info-${currentSlide}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          textAlign: 'right',
          zIndex: 10
        }}
      >
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.8rem', color: '#F59E0B', marginBottom: '4px' }}>
          OBRA DESTACADA
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFF' }}>
          {featuredArtworks[currentSlide].title}
        </div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
          {featuredArtworks[currentSlide].medium}
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.8rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>Scroll</span>
        <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)' }} />
      </motion.div>
    </div>
  )
}
