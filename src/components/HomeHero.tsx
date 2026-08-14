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

      {/* 3. Hero Header & Headline Central — MENOS LETRAS, MÁS ARTE */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Poética Badge Sutil */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '16px' }}
        >
          <span
            className="premium-badge premium-badge--gold"
            style={{
              padding: '6px 16px',
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              background: 'rgba(255, 215, 0, 0.12)',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              color: '#FFD700',
              backdropFilter: 'blur(10px)'
            }}
          >
            NAROA GUTIÉRREZ GIL · RETRATOS CON ALMA Y MATERIA
          </span>
        </motion.div>

        {/* Muestra Visual Gigante de la Obra Destacada */}
        <motion.div
          key={`hero-art-${currentSlide}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => {
            sound.playTick()
            onNavigate?.('gallery')
          }}
          style={{
            position: 'relative',
            maxWidth: '900px',
            width: '90vw',
            maxHeight: '62vh',
            borderRadius: '24px',
            overflow: 'hidden',
            cursor: 'pointer',
            border: '1px solid rgba(255, 215, 0, 0.4)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.9), 0 0 40px rgba(255,20,147,0.3)',
            marginBottom: '24px'
          }}
        >
          <img
            src={featuredArtworks[currentSlide].url}
            alt={featuredArtworks[currentSlide].title}
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '62vh',
              objectFit: 'cover',
              filter: 'contrast(1.05) saturate(1.1)',
              display: 'block'
            }}
          />

          {/* Sutil Pie de Foto Flotante sobre la Obra */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px 30px',
              background: 'linear-gradient(to top, rgba(3,3,5,0.92) 0%, transparent 100%)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFF', letterSpacing: '-0.02em' }}>
                {featuredArtworks[currentSlide].title}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#FFD700', fontFamily: 'Share Tech Mono, monospace' }}>
                {featuredArtworks[currentSlide].medium} ({featuredArtworks[currentSlide].year})
              </div>
            </div>

            <span
              style={{
                fontSize: '0.78rem',
                color: '#FFF',
                background: 'rgba(255,20,147,0.3)',
                border: '1px solid #FF1493',
                padding: '6px 14px',
                borderRadius: '16px',
                fontFamily: 'Share Tech Mono, monospace'
              }}
            >
              VER OBRA COMPLETA →
            </span>
          </div>
        </motion.div>

        {/* Botones de Acción Primarios */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <a
            href="#3d"
            onClick={() => {
              sound.playSplatActivate()
              onNavigate?.('3d')
            }}
            className="premium-btn premium-btn--primary"
            style={{
              padding: '16px 36px',
              fontSize: '1rem',
              letterSpacing: '0.1em',
              background: 'linear-gradient(135deg, #FFD700 0%, #FF1493 50%, #2B3BE5 100%)',
              color: '#000',
              fontWeight: 900,
              boxShadow: '0 0 30px rgba(255, 20, 147, 0.4)',
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
              padding: '16px 36px',
              fontSize: '1rem',
              letterSpacing: '0.1em',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              color: '#FFF',
              textDecoration: 'none'
            }}
          >
            VER GALERÍA
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
