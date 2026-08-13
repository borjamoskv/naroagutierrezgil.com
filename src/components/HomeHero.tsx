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
    }, 5500)
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
        padding: '110px 40px 50px 40px',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Lienzo WebGL Interactivo POP (Pizarra Kintsugi, Magenta & Oro) */}
      <SlateHeroCanvas />

      {/* 2. Capa de Gradiente Orgánico y Viñeta Cinemática */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background:
            'radial-gradient(circle at 50% 40%, transparent 15%, rgba(3, 3, 5, 0.65) 65%, rgba(3, 3, 5, 0.95) 100%), linear-gradient(to bottom, rgba(3,3,5,0.3) 0%, transparent 40%, rgba(3,3,5,0.85) 100%)',
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
        {/* Poética Badges Naroa Spirit */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}
        >
          <span
            className="premium-badge premium-badge--gold"
            style={{
              padding: '8px 20px',
              fontSize: '0.82rem',
              letterSpacing: '0.12em',
              background: 'rgba(255, 212, 0, 0.14)',
              border: '1px solid rgba(255, 215, 0, 0.5)',
              color: '#FFD700',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🌸 RETRATOS CON ALMA, MIMO Y CALMA
          </span>

          <a
            href="https://politena.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playTick()}
            style={{ textDecoration: 'none' }}
          >
            <span
              className="premium-badge"
              style={{
                padding: '8px 20px',
                fontSize: '0.82rem',
                letterSpacing: '0.12em',
                background: 'rgba(255, 20, 147, 0.15)',
                border: '1px solid rgba(255, 20, 147, 0.5)',
                color: '#FF2E93',
                boxShadow: '0 0 20px rgba(255, 20, 147, 0.3)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF1493', boxShadow: '0 0 10px #FF1493' }} />
              EXPOSICIÓN: «DIVINOS VAIVENES» · BILBAO
            </span>
          </a>
        </motion.div>

        {/* Título Principal Tipográfico Monumental POP */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'Outfit, var(--font-heading), sans-serif',
            fontSize: 'clamp(3.5rem, 10vw, 8rem)',
            fontWeight: 900,
            lineHeight: 0.9,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            marginBottom: '24px',
            letterSpacing: '-0.03em',
            textShadow: '0 10px 40px rgba(0,0,0,0.85), 0 0 30px rgba(255,20,147,0.3)'
          }}
        >
          NAROA <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FF2E93 45%, #2B3BE5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '0.78em',
              letterSpacing: '0.04em',
              filter: 'drop-shadow(0 0 25px rgba(255,215,0,0.4))'
            }}
          >
            GUTIÉRREZ GIL
          </span>
        </motion.h1>

        {/* Subtítulo Conceptual Manifiesto Naroa */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          style={{
            fontSize: 'clamp(1.1rem, 2.2vw, 1.45rem)',
            color: 'rgba(255, 255, 255, 0.88)',
            maxWidth: '750px',
            marginBottom: '40px',
            fontWeight: 300,
            lineHeight: 1.6,
            letterSpacing: '0.03em'
          }}
        >
          Hiperrealismo POP sobre <strong style={{ color: '#FFD700', fontWeight: 600 }}>Pizarra de Tejado Vasco</strong>, disolventes de agua de colonia y <strong style={{ color: '#FF2E93', fontWeight: 600 }}>Escamas de Mica Mineral</strong>.<br />
          El retrato co-creativo capturado en materia viva con reverso acústico.
        </motion.p>

        {/* Botones de Acción POP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
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
              padding: '18px 40px',
              fontSize: '1.08rem',
              letterSpacing: '0.12em',
              background: 'linear-gradient(135deg, #FFD700 0%, #FF1493 50%, #2B3BE5 100%)',
              color: '#000',
              fontWeight: 900,
              boxShadow: '0 0 35px rgba(255, 20, 147, 0.5), 0 0 15px rgba(255, 215, 0, 0.4)',
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
              padding: '18px 40px',
              fontSize: '1.08rem',
              letterSpacing: '0.12em',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              color: '#FFF',
              textDecoration: 'none',
              boxShadow: '0 0 20px rgba(255,215,0,0.15)'
            }}
          >
            EXPLORAR GALERÍA
          </a>
        </motion.div>
      </div>

      {/* 4. Carousel Inferior Orgánico de Obras Destacadas */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1200px',
          margin: '30px auto 0 auto',
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
                width: currentSlide === idx ? '36px' : '10px',
                height: '8px',
                borderRadius: '4px',
                background: currentSlide === idx ? '#FFD700' : 'rgba(255, 255, 255, 0.25)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: currentSlide === idx ? '0 0 12px #FFD700' : 'none'
              }}
              aria-label={`Ver obra destacada ${idx + 1}`}
            />
          ))}
        </div>

        {/* Ficha Visual de Obra Activa Naroa Spirit */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            onClick={() => {
              sound.playTick()
              onNavigate?.('gallery')
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: 'rgba(10, 8, 20, 0.82)',
              padding: '14px 22px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 12px 35px rgba(0,0,0,0.65), 0 0 20px rgba(255,20,147,0.2)',
              cursor: 'pointer'
            }}
          >
            <img
              src={featuredArtworks[currentSlide].url}
              alt={featuredArtworks[currentSlide].title}
              style={{
                width: '54px',
                height: '66px',
                objectFit: 'cover',
                borderRadius: '10px',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.74rem', color: '#FFD700', letterSpacing: '0.08em' }}>
                OBRA DESTACADA {currentSlide + 1} / {featuredArtworks.length}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>
                {featuredArtworks[currentSlide].title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                {featuredArtworks[currentSlide].medium} ({featuredArtworks[currentSlide].year})
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
