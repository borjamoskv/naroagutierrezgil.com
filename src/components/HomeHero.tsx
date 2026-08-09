import { useState } from 'react'
import { motion } from 'framer-motion'
import { sound } from '../utils/audio'
import { SlateHeroCanvas } from './SlateHeroCanvas'

export function HomeHero() {
  const [isHoveredCard, setIsHoveredCard] = useState(false)

  return (
    <section 
      className="hero-immersive" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        minHeight: '100vh', 
        overflow: 'hidden', 
        background: 'radial-gradient(circle at 50% 20%, #10081C 0%, #050508 100%)',
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
          <span>⚡ "TODOS SOMOS LO MISMO CON DISTINTAS APARIENCIAS" — NAROA GUTIÉRREZ GIL ⚡ HIPERREALISMO POP ⚡ PIZARRA NATURAL DE TEJADO VASCO & MICA MINERAL ⚡ ENCARGA TU RETRATO ÚNICO ⚡ BILBAO 2026 ⚡</span>
          <span>⚡ "TODOS SOMOS LO MISMO CON DISTINTAS APARIENCIAS" — NAROA GUTIÉRREZ GIL ⚡ HIPERREALISMO POP ⚡ PIZARRA NATURAL DE TEJADO VASCO & MICA MINERAL ⚡ ENCARGA TU RETRATO ÚNICO ⚡ BILBAO 2026 ⚡</span>
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
          margin: '120px auto 40px',
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
            <span className="pop-badge pop-badge--yellow">
              💎 PIZARRA NATURAL & MICA MINERAL
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
              backdropFilter: 'blur(10px)',
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
              <strong style={{ color: '#FFE600' }}>«Todos somos lo mismo con distintas apariencias.»</strong> Naroa Gutiérrez Gil transforma la iconografía pop y los soportes primordiales —pizarra natural de derribos arquitectónicos en Bizkaia y escamas de mica mineral— en máscaras protectoras de la condición humana.
            </p>
          </div>

          {/* 4 Curatorial Series Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
            <a href="#/destacada" onClick={() => sound.playTick()} className="pop-badge pop-badge--cyan" style={{ textDecoration: 'none' }}>
              👑 DIVINOS
            </a>
            <a href="#/destacada" onClick={() => sound.playTick()} className="pop-badge pop-badge--pink" style={{ textDecoration: 'none' }}>
              🌀 VAIVENES
            </a>
            <a href="#/destacada" onClick={() => sound.playTick()} className="pop-badge pop-badge--gold" style={{ textDecoration: 'none' }}>
              🪞 ESPEJOS DEL ALMA
            </a>
            <a href="#/destacada" onClick={() => sound.playTick()} className="pop-badge pop-badge--yellow" style={{ textDecoration: 'none' }}>
              🎨 FACEFOOD
            </a>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
            <a 
              href="#/destacada" 
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
              ⚡ EXPLORAR GALERÍA <span>→</span>
            </a>

            <a 
              href="#/encargos" 
              onClick={() => sound.playTick()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                color: '#00F0FF',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
              }}
            >
              ⚡ ENCARGAR RETRATO ↗
            </a>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            marginTop: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.45)'
          }}>
            <span>• 12K+ SEGUIDORES</span>
            <span>• PIZARRA NATURAL & MICA</span>
            <span>• BILBAO 2026</span>
          </div>
        </motion.div>

        {/* Right Column: High-Fidelity Artwork Showcase */}
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
              borderRadius: '20px', 
              padding: '12px',
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
              window.location.hash = '#obra-marilyn-rocks'
            }}

            title="Ver obra HD"
          >
            <img
              src="/assets/marilyn-new.webp"
              alt="Marilyn Rocks — Naroa Gutiérrez Gil"
              style={{ 
                width: '100%', 
                height: 'auto', 
                maxHeight: '62vh', 
                objectFit: 'contain', 
                borderRadius: '12px',
                display: 'block' 
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}


