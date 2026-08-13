import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
<<<<<<< HEAD
import { ARTWORKS } from '../artworks'
import { SlateHeroCanvas } from './SlateHeroCanvas'
import { sound } from '../utils/audio'

interface HomeHeroProps {
  onNavigate?: (view: string) => void
}

export function HomeHero({ onNavigate }: HomeHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const featuredArtworks = ARTWORKS.slice(0, 6)
=======
import { sound } from '../utils/audio'
import { SlateHeroCanvas } from './SlateHeroCanvas'

const HERO_FEATURED = [
  {
    title: 'Marilyn Rocks',
    medium: 'Acrílico y Posca sobre Pizarra Natural de Bizkaia y Mica Mineral',
    year: '2025',
    tag: 'PIZARRA & MICA',
    image: '/assets/marilyn-rocks--qPeLHxE.webp',
    hash: '#obra-marilyn-rocks'
  },
  {
    title: 'Amy Rocks',
    medium: 'Óleo y Acrílico sobre Lienzo de Gran Formato',
    year: '2024',
    tag: 'LIENZO & ÓLEO',
    image: '/assets/hq-amy-BRTriASV.webp',
    hash: '#obra-amy-rocks'
  },
  {
    title: 'James Rocks',
    medium: 'Pizarra Natural Tallada y Escamas de Mica Iridiscente',
    year: '2025',
    tag: 'MICA VIVA',
    image: '/assets/hq-james-CjsTrO7r.webp',
    hash: '#obra-james-rocks'
  },
  {
    title: 'Asúcar (Celia Cruz)',
    medium: 'Mixed Media sobre Pizarra y Resina de Brillo Matérico',
    year: '2025',
    tag: 'DIVINOS POP',
    image: '/assets/celia-cruz-cantinflowers-DO-SRKMB.webp',
    hash: '#obra-asucar-celia-cruz'
  },
  {
    title: 'Camarón de la Isla',
    medium: 'Acrílico e Hiperrealismo sobre Pizarra de Derribo Vasco',
    year: '2024',
    tag: 'ESPEJOS DEL ALMA',
    image: '/assets/camaron-de-la-isla-B5l7qX1h.webp',
    hash: '#obra-camaron-de-la-isla'
  },
  {
    title: 'Freddie Mercury Tributo',
    medium: 'Pizarra Natural + Mica Mineral + Pan de Oro',
    year: '2024',
    tag: 'PIZARRA & GOLD',
    image: '/assets/freddie-mercury-DWX4yqS6.webp',
    hash: '#obra-freddie-mercury'
  }
]
>>>>>>> 62bbc4c3a127513cf434ac2303bb49841caf3450

export function HomeHero() {
  // Selección aleatoria única por sesión de usuario / recarga
  const [selectedIdx, setSelectedIdx] = useState<number>(() => {
    return Math.floor(Math.random() * HERO_FEATURED.length)
  })
  const [isHoveredCard, setIsHoveredCard] = useState(false)
  const activeItem = HERO_FEATURED[selectedIdx]

  // Rotación automática sutil cada 10 segundos si el usuario no interactúa
  useEffect(() => {
    if (isHoveredCard) return
    const interval = setInterval(() => {
<<<<<<< HEAD
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
=======
      setSelectedIdx(prev => (prev + 1) % HERO_FEATURED.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [isHoveredCard])

  return (
    <section 
      className="hero-immersive" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        minHeight: '100vh', 
        overflow: 'hidden', 
        background: 'radial-gradient(circle at 50% 20%, #120A21 0%, #050508 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0 40px 0'
      }}
    >
      {/* ⚡ High-Speed Kinetic POP Marquee Ticker */}
      <div className="kinetic-marquee-container" style={{ zIndex: 30 }}>
        <div className="kinetic-marquee-track">
          <span>⚡ "TODOS SOMOS LO MISMO CON DISTINTAS APARIENCIAS" — NAROA GUTIÉRREZ GIL ⚡ HIPERREALISMO POP ⚡ PIZARRA NATURAL DE TEJADO VASCO & MICA MINERAL ⚡ BILBAO 2026 ⚡ BILDUMA ⚡ ESKAERAK ⚡ POP GUNEA ⚡</span>
          <span>⚡ "TODOS SOMOS LO MISMO CON DISTINTAS APARIENCIAS" — NAROA GUTIÉRREZ GIL ⚡ HIPERREALISMO POP ⚡ PIZARRA NATURAL DE TEJADO VASCO & MICA MINERAL ⚡ BILBAO 2026 ⚡ BILDUMA ⚡ ESKAERAK ⚡ POP GUNEA ⚡</span>
        </div>
      </div>

      {/* Interactive 3D Slate Surface background with light rays & mica particles */}
      <SlateHeroCanvas />

      {/* Main Hero Container Grid */}
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 10, 
          width: '100%', 
          maxWidth: '1400px', 
          margin: '130px auto 40px',
          padding: '0 5vw',
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '50px', 
          alignItems: 'center',
          pointerEvents: 'none'
        }}
      >
        {/* Left Column: Bold Typography, Curatorial Badges & CTAs */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            gap: '24px', 
            pointerEvents: 'auto' 
          }}
        >
          {/* Eyebrow Pop Badge */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <span className="pop-badge pop-badge--pink pop-glow-pulse">
              ⚡ HIPERREALISMO POP · BILBAO
            </span>
            <span className="pop-badge pop-badge--gold">
              💎 MICA MINERAL & PIZARRA DE BIZKAIA
            </span>
          </div>

          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
            fontWeight: 900,
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
            color: '#ffffff',
            textShadow: '0 10px 40px rgba(0,0,0,0.9)'
          }}>
            RETRATOS QUE SON<br />
            <span className="text-pop-gradient">
              ESPEJOS EMOCIONALES
            </span>
          </h1>

          {/* Curatorial Manifesto Highlight */}
          <div 
            style={{
              background: 'rgba(43, 59, 229, 0.06)',
              borderLeft: '4px solid var(--cobalt)',
              padding: '16px 20px',
              borderRadius: '0 12px 12px 0',
              backdropFilter: 'blur(12px)',
              borderTop: '1px solid rgba(43, 59, 229,0.2)',
              borderRight: '1px solid rgba(43, 59, 229,0.2)',
              borderBottom: '1px solid rgba(43, 59, 229,0.2)',
              maxWidth: '560px'
            }}
          >
            <p style={{
              margin: 0,
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.95)',
              lineHeight: 1.65,
              fontWeight: 500
            }}>
              <strong style={{ color: 'var(--gold-hi)' }}>«Todos somos lo mismo con distintas apariencias.»</strong> Naroa Gutiérrez Gil transforma la iconografía pop y los soportes primordiales —pizarra natural de derribos en Bizkaia y mica mineral— en máscaras emocionales del alma humana.
            </p>
          </div>

          {/* SOTA Material Selector Switches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '480px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--cobalt-soft)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em' }}>
              ✦ SELECCIONAR SOPORTE Y TÉCNICA MATÉRICA:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {HERO_FEATURED.map((item, idx) => (
                <button
                  key={item.title}
                  onClick={() => {
                    sound.playTick()
                    setSelectedIdx(idx)
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    background: selectedIdx === idx ? 'rgba(141, 151, 255, 0.2)' : 'rgba(255,255,255,0.04)',
                    border: selectedIdx === idx ? '1px solid var(--cobalt-soft)' : '1px solid rgba(255,255,255,0.12)',
                    color: selectedIdx === idx ? 'var(--cobalt-soft)' : 'rgba(255,255,255,0.7)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: selectedIdx === idx ? 800 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedIdx === idx ? '0 0 15px rgba(141, 151, 255, 0.3)' : 'none'
                  }}
                >
                  {item.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
            <a
              href="#/gallery"
              onClick={() => sound.playOpen()}
              className="hero-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                padding: '16px 36px',
                background: 'linear-gradient(135deg, #2B3BE5 0%, #F59E0B 100%)',
                border: 'none',
                borderRadius: '40px',
                boxShadow: '0 10px 30px rgba(245, 158, 11, 0.35), 0 0 20px rgba(43, 59, 229, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 158, 11, 0.5), 0 0 30px rgba(43, 59, 229, 0.45)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.35), 0 0 20px rgba(43, 59, 229, 0.3)'
              }}
            >
              ⚡ BILDUMA (VER 140 OBRAS) <span>→</span>
            </a>

            <a
              href="#/commissions"
              onClick={() => sound.playTick()}
              className="hero-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--cobalt-soft)',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '14px 24px',
                border: '1px solid var(--cobalt-soft)',
                borderRadius: '30px',
                background: 'rgba(43, 59, 229, 0.08)'
              }}
            >
              ⚡ ESKAERAK / ENCARGOS ↗
            </a>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px 20px',
            marginTop: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.45)'
          }}>
            <span>• 140 OBRAS CATALOGADAS</span>
            <span>• PIZARRA NATURAL & MICA</span>
            <span>• BILBAO 2026</span>
          </div>
        </motion.div>

        {/* Right Column: High-Fidelity Artwork Showcase with Dynamic Switching */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{ 
            opacity: { duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative',
            pointerEvents: 'auto',
            perspective: '1200px'
          }}
        >
          <motion.div 
            onMouseEnter={() => setIsHoveredCard(true)}
            onMouseLeave={() => setIsHoveredCard(false)}
            whileHover={{ 
              scale: 1.03,
              rotateX: 3,
              rotateY: -3,
              boxShadow: '0 40px 100px rgba(0,0,0,0.95), 0 0 80px rgba(245, 158, 11, 0.4)',
              borderColor: 'var(--gold)'
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{ 
              position: 'relative', 
              borderRadius: '24px', 
              padding: '16px',
              background: '#FFFFFF',
              border: isHoveredCard ? '2px solid var(--gold)' : '1px solid var(--line)',
              boxShadow: isHoveredCard ? '0 30px 90px rgba(0,0,0,0.95), 0 0 50px rgba(245, 158, 11, 0.3)' : '0 25px 70px rgba(0,0,0,0.9)',
              maxWidth: '480px',
              width: '100%',
              cursor: 'pointer',
              overflow: 'hidden'
            }}
            onClick={() => {
              sound.playOpen()
              window.location.hash = activeItem.hash
            }}
            title="Haz clic para inspeccionar en la Galería"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeItem.title}
                src={activeItem.image}
                alt={`${activeItem.title} — Naroa Gutiérrez Gil`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="hero-featured-img"
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  display: 'block',
                  background: '#FFFFFF',
                  imageRendering: 'high-quality' as any
                }}
              />
            </AnimatePresence>

            {/* Dynamic Overlay Info Pill */}
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              right: '24px',
              padding: '14px 18px',
              background: 'rgba(5, 5, 8, 0.85)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>{activeItem.title}</h4>
                <p style={{ margin: '2px 0 0 0', color: 'var(--cobalt-soft)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{activeItem.medium}</p>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--gold-hi)', borderRadius: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {activeItem.year}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll-Driven Feature Showcase Section 1: Materiales Vivos */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1300px',
          margin: '40px auto 0',
          padding: '0 5vw',
          pointerEvents: 'auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="pop-badge pop-badge--yellow">✦ MATERIA & LUZ</span>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#fff', margin: '12px 0 0 0' }}>
            LA PIEDRA ANCESTRAL QUE GUARECE EL RETRATO
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <motion.div
            whileHover={{ y: -6, borderColor: 'var(--gold)' }}
            style={{
              background: 'rgba(10, 10, 15, 0.7)',
              border: '1px solid rgba(43, 59, 229, 0.3)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>🪨</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 800, letterSpacing: '0.1em' }}>
              PIZARRA VINTAGE DE BIZKAIA
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '8px 0' }}>Piedra de Derribo Vasco</h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, margin: 0 }}>
              Extraída de tejados centenarios desmontados en Bizkaia. Sellada con resina epoxi de alto brillo, la pizarra ofrece millones de años de historia sobre los que florece el retrato pop.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, borderColor: 'var(--gold-hi)' }}
            style={{
              background: 'rgba(10, 10, 15, 0.7)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>💎</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gold-hi)', fontWeight: 800, letterSpacing: '0.1em' }}>
              DESTELLOS DE LUZ REAL
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '8px 0' }}>Mica Mineral & Pan de Oro</h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, margin: 0 }}>
              Escamas minerales de mica aplicadas en relieve matérico que centelean y mutan de color según el ángulo de luz natural o los focos de la sala.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, borderColor: 'var(--cobalt-soft)' }}
            style={{
              background: 'rgba(10, 10, 15, 0.7)',
              border: '1px solid rgba(141, 151, 255, 0.3)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>✨</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--cobalt-soft)', fontWeight: 800, letterSpacing: '0.1em' }}>
              CICATRIZ DORADA
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '8px 0' }}>Técnica «Cantinflowers»</h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, margin: 0 }}>
              Kintsugi accidental descubierto al reaccionar el acrílico con cola vinílica. Las grietas se raspan y se rellenan con pigmento dorado como símbolo de sanación emocional.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
>>>>>>> 62bbc4c3a127513cf434ac2303bb49841caf3450
  )
}
