import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      <div className="kinetic-marquee-container" style={{ position: 'relative', zIndex: 30, top: '70px' }}>
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
              background: 'rgba(255, 0, 122, 0.06)',
              borderLeft: '4px solid #FF007A',
              padding: '16px 20px',
              borderRadius: '0 12px 12px 0',
              backdropFilter: 'blur(12px)',
              borderTop: '1px solid rgba(255,0,122,0.2)',
              borderRight: '1px solid rgba(255,0,122,0.2)',
              borderBottom: '1px solid rgba(255,0,122,0.2)',
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
              <strong style={{ color: '#FFE600' }}>«Todos somos lo mismo con distintas apariencias.»</strong> Naroa Gutiérrez Gil transforma la iconografía pop y los soportes primordiales —pizarra natural de derribos en Bizkaia y mica mineral— en máscaras emocionales del alma humana.
            </p>
          </div>

          {/* SOTA Material Selector Switches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '480px' }}>
            <span style={{ fontSize: '0.7rem', color: '#00F0FF', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em' }}>
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
                    background: selectedIdx === idx ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255,255,255,0.04)',
                    border: selectedIdx === idx ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.12)',
                    color: selectedIdx === idx ? '#00F0FF' : 'rgba(255,255,255,0.7)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: selectedIdx === idx ? 800 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedIdx === idx ? '0 0 15px rgba(0, 240, 255, 0.3)' : 'none'
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                color: '#000',
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                padding: '16px 36px',
                background: 'linear-gradient(135deg, #FFE600 0%, #FF007A 100%)',
                border: 'none',
                borderRadius: '40px',
                boxShadow: '0 10px 30px rgba(255, 0, 122, 0.4), 0 0 20px rgba(255, 230, 0, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 0, 122, 0.6), 0 0 30px rgba(255, 230, 0, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 0, 122, 0.4), 0 0 20px rgba(255, 230, 0, 0.3)'
              }}
            >
              ⚡ BILDUMA (VER 140 OBRAS) <span>→</span>
            </a>

            <a 
              href="#/commissions" 
              onClick={() => sound.playTick()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                color: '#00F0FF',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '14px 24px',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                borderRadius: '30px',
                background: 'rgba(0, 240, 255, 0.08)'
              }}
            >
              ⚡ ESKAERAK / ENCARGOS ↗
            </a>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '24px', 
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
              boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 80px rgba(255, 0, 122, 0.35)',
              borderColor: 'rgba(255, 0, 122, 0.6)'
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{ 
              position: 'relative', 
              borderRadius: '24px', 
              padding: '14px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
              border: isHoveredCard ? '1px solid #FF007A' : '1px solid rgba(255, 0, 122, 0.3)',
              boxShadow: isHoveredCard ? '0 30px 80px rgba(0,0,0,0.9), 0 0 40px rgba(255, 0, 122, 0.3)' : '0 30px 80px rgba(0,0,0,0.9)',
              backdropFilter: 'blur(16px)',
              maxWidth: '480px',
              width: '100%',
              cursor: 'pointer'
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
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: '60vh', 
                  objectFit: 'contain', 
                  borderRadius: '16px',
                  display: 'block',
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
                <p style={{ margin: '2px 0 0 0', color: '#00F0FF', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{activeItem.medium}</p>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'rgba(255, 230, 0, 0.2)', color: '#FFE600', borderRadius: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {activeItem.year}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}


