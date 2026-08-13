import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ARTWORKS } from '../artworks'
import { SlateHeroCanvas } from './SlateHeroCanvas'
import { sound } from '../utils/audio'

interface HomeHeroProps {
  onNavigate?: (view: string) => void
}

export function HomeHero({ onNavigate }: HomeHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const featuredArtworks = ARTWORKS.slice(0, 6)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArtworks.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [featuredArtworks.length])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#030305',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '120px 40px 60px 40px',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Lienzo WebGL Interactivo de Pizarra y Kintsugi (Fondo Dinámico Awwwards) */}
      <SlateHeroCanvas />

      {/* 2. Capa de Gradiente y Viñeta Cinemática */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background:
            'radial-gradient(circle at 50% 40%, transparent 20%, rgba(3, 3, 5, 0.7) 70%, rgba(3, 3, 5, 0.95) 100%), linear-gradient(to bottom, rgba(3,3,5,0.4) 0%, transparent 40%, rgba(3,3,5,0.85) 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* 3. Hero Header & Headline Central */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Badge Exposiciones 2026 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <a
            href="https://politena.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playTick()}
            style={{ textDecoration: 'none' }}
          >
            <span
              className="premium-badge premium-badge--gold"
              style={{
                marginBottom: '28px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                fontSize: '0.82rem',
                letterSpacing: '0.12em',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
                cursor: 'pointer'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 10px #F59E0B' }} />
              EXPOSICIÓN EN CURSO: «DIVINOS VAIVENES» · POLITENA ESPACIO (BILBAO)
            </span>
          </a>
        </motion.div>

        {/* Título Principal Tipográfico Monumental */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'Outfit, var(--font-heading), sans-serif',
            fontSize: 'clamp(3.2rem, 9.5vw, 7.5rem)',
            fontWeight: 900,
            lineHeight: 0.92,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            marginBottom: '24px',
            letterSpacing: '-0.03em',
            textShadow: '0 10px 40px rgba(0,0,0,0.8)'
          }}
        >
          NAROA <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #D4AF37 50%, #2B3BE5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '0.78em',
              letterSpacing: '0.04em'
            }}
          >
            GUTIÉRREZ GIL
          </span>
        </motion.h1>

        {/* Subtítulo Conceptual y Manifiesto Lítico */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
            color: 'rgba(255, 255, 255, 0.82)',
            maxWidth: '720px',
            marginBottom: '40px',
            fontWeight: 300,
            lineHeight: 1.6,
            letterSpacing: '0.03em'
          }}
        >
          Hiperrealismo POP sobre <strong style={{ color: '#D4AF37', fontWeight: 600 }}>Pizarra de Tejado Vasco</strong> y <strong style={{ color: '#8D97FF', fontWeight: 600 }}>Escamas de Mica Mineral</strong>.<br />
          El retrato co-creativo capturado como materia navegable e inmersión acústica.
        </motion.p>

        {/* Botones de Acción Primaria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <a
            href="#3d"
            onClick={() => {
              sound.playSplatActivate()
              onNavigate?.('3d')
            }}
            className="premium-btn premium-btn--primary"
            style={{
              padding: '18px 36px',
              fontSize: '1.05rem',
              letterSpacing: '0.1em',
              background: 'linear-gradient(135deg, #2B3BE5 0%, #F59E0B 100%)',
              color: '#000',
              fontWeight: 900,
              boxShadow: '0 0 30px rgba(43, 59, 229, 0.5)',
              textDecoration: 'none'
            }}
          >
            ⚡ ESPACIO 3D INMERSIVO
          </a>

          <a
            href="#/gallery"
            onClick={() => {
              sound.playTick()
              onNavigate?.('gallery')
            }}
            className="premium-btn"
            style={{
              padding: '18px 36px',
              fontSize: '1.05rem',
              letterSpacing: '0.1em',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFF',
              textDecoration: 'none'
            }}
          >
            VER GALERÍA COMPLETA
          </a>
        </motion.div>
      </div>

      {/* 4. Carousel Inferior de Obras Destacadas */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1200px',
          margin: '40px auto 0 auto',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        {/* Controles de Diapositiva */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {featuredArtworks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playTick()
                setCurrentSlide(idx)
              }}
              style={{
                width: currentSlide === idx ? '32px' : '10px',
                height: '8px',
                borderRadius: '4px',
                background: currentSlide === idx ? '#D4AF37' : 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              aria-label={`Ver obra destacada ${idx + 1}`}
            />
          ))}
        </div>

        {/* Ficha Visual de Obra Activa */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: 'rgba(5, 5, 12, 0.75)',
              padding: '12px 20px',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            <img
              src={featuredArtworks[currentSlide].url}
              alt={featuredArtworks[currentSlide].title}
              style={{
                width: '50px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.72rem', color: '#D4AF37', letterSpacing: '0.08em' }}>
                OBRA DESTACADA {currentSlide + 1} / {featuredArtworks.length}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFF' }}>
                {featuredArtworks[currentSlide].title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                {featuredArtworks[currentSlide].medium} ({featuredArtworks[currentSlide].year})
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
