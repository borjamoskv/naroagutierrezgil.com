import { useState, useEffect, useRef } from 'react'
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
    hash: '#obra-marilyn-rocks',
    description: 'Icono inmortal del pop reinterpretado sobre pizarra fósil de Bizkaia. Las capas de mica vegetal crean una luminiscencia dorada que varía con el movimiento del observador.'
  },
  {
    title: 'Amy Rocks',
    medium: 'Óleo y Acrílico sobre Lienzo de Gran Formato',
    year: '2024',
    tag: 'LIENZO & ÓLEO',
    image: '/assets/hq-amy-BRTriASV.webp',
    hash: '#obra-amy-rocks',
    description: 'Retrato de desgarro y alma. Trazo gestual enérgico fusionado con texturas en relieve que capturan la fragilidad y majestad vocal de la artista.'
  },
  {
    title: 'James Rocks',
    medium: 'Pizarra Natural Tallada y Escamas de Mica Iridiscente',
    year: '2025',
    tag: 'MICA VIVA',
    image: '/assets/hq-james-CjsTrO7r.webp',
    hash: '#obra-james-rocks',
    description: 'La elegancia rebelde de James Dean labrada en piedra telúrica. Vetas metálicas que capturan los focos de sala como resplandor de celuloide.'
  },
  {
    title: 'Asúcar (Celia Cruz)',
    medium: 'Mixed Media sobre Pizarra y Resina de Brillo Matérico',
    year: '2025',
    tag: 'DIVINOS POP',
    image: '/assets/celia-cruz-cantinflowers-DO-SRKMB.webp',
    hash: '#obra-asucar-celia-cruz',
    description: 'Explosión cromática de ritmo caribeño. Acabado de resina cristalina de alto espesor y pigmentos vívidos sobre corte de pizarra artesanal.'
  },
  {
    title: 'Camarón de la Isla',
    medium: 'Acrílico e Hiperrealismo sobre Pizarra de Derribo Vasco',
    year: '2024',
    tag: 'ESPEJOS DEL ALMA',
    image: '/assets/camaron-de-la-isla-B5l7qX1h.webp',
    hash: '#obra-camaron-de-la-isla',
    description: 'El duende flamenco hecho materia mineral. Retrato hipnótico tallado en una lámina de tejado de Bizkaia rescatada de una caserío centenario.'
  },
  {
    title: 'Freddie Mercury Tributo',
    medium: 'Pizarra Natural + Mica Mineral + Pan de Oro',
    year: '2024',
    tag: 'PIZARRA & GOLD',
    image: '/assets/freddie-mercury-DWX4yqS6.webp',
    hash: '#obra-freddie-mercury',
    description: 'Homenaje a la fuerza operística y escénica de Freddie Mercury. Hilos de pan de oro de 24k incrustados en la roca natural.'
  }
]

export function HomeHero() {
  const [selectedIdx, setSelectedIdx] = useState<number>(() => {
    return Math.floor(Math.random() * HERO_FEATURED.length)
  })
  const [isHoveredCard, setIsHoveredCard] = useState(false)
  const [isAutoplay, setIsAutoplay] = useState(true)

  // 3D Tilt & Glare Coordinates
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 })

  const activeItem = HERO_FEATURED[selectedIdx]

  // Rotación automática cada 9 segundos
  useEffect(() => {
    if (isHoveredCard || !isAutoplay) return
    const interval = setInterval(() => {
      setSelectedIdx(prev => (prev + 1) % HERO_FEATURED.length)
    }, 9000)
    return () => clearInterval(interval)
  }, [isHoveredCard, isAutoplay])

  const handleNext = () => {
    sound.playTick()
    setSelectedIdx(prev => (prev + 1) % HERO_FEATURED.length)
  }

  const handlePrev = () => {
    sound.playTick()
    setSelectedIdx(prev => (prev - 1 + HERO_FEATURED.length) % HERO_FEATURED.length)
  }

  const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -12
    const rotateY = ((x - centerX) / centerX) * 12

    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100

    setTilt({ rotateX, rotateY })
    setGlarePos({ x: glareX, y: glareY, opacity: 0.35 })
  }

  const handleMouseLeaveCard = () => {
    setIsHoveredCard(false)
    setTilt({ rotateX: 0, rotateY: 0 })
    setGlarePos(prev => ({ ...prev, opacity: 0 }))
  }

  return (
    <section 
      className="hero-immersive" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        minHeight: '100vh', 
        overflow: 'hidden', 
        background: 'radial-gradient(circle at 50% 20%, #0d0b1a 0%, #040407 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0 50px 0'
      }}
    >
      {/* ⚡ High-Speed Kinetic POP Marquee Ticker */}
      <div className="kinetic-marquee-container" style={{ position: 'relative', zIndex: 30, top: '70px' }}>
        <div className="kinetic-marquee-track">
          <span>⚡ "TODOS SOMOS LO MISMO CON DISTINTAS APARIENCIAS" — NAROA GUTIÉRREZ GIL ⚡ HIPERREALISMO POP ⚡ PIZARRA NATURAL DE TEJADO VASCO & MICA MINERAL ⚡ KINTSUGI DE ORO ⚡ BILBAO 2026 ⚡ BILDUMA ⚡ ESKAERAK ⚡ POP GUNEA ⚡</span>
          <span>⚡ "TODOS SOMOS LO MISMO CON DISTINTAS APARIENCIAS" — NAROA GUTIÉRREZ GIL ⚡ HIPERREALISMO POP ⚡ PIZARRA NATURAL DE TEJADO VASCO & MICA MINERAL ⚡ KINTSUGI DE ORO ⚡ BILBAO 2026 ⚡ BILDUMA ⚡ ESKAERAK ⚡ POP GUNEA ⚡</span>
        </div>
      </div>

      {/* Interactive 3D Slate Surface background with WebGL Kintsugi Shader */}
      <SlateHeroCanvas />

      {/* Main Hero Container Grid */}
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 10, 
          width: '100%', 
          maxWidth: '1400px', 
          margin: '135px auto 30px',
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
          {/* Eyebrow Pop Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <span className="pop-badge pop-badge--pink pop-glow-pulse" onMouseEnter={() => sound.playHover()}>
              ⚡ HIPERREALISMO POP · BILBAO
            </span>
            <span className="pop-badge pop-badge--gold" onMouseEnter={() => sound.playMicaShimmer()}>
              💎 MICA MINERAL & PIZARRA DE BIZKAIA
            </span>
            <span 
              className="pop-badge" 
              style={{ background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00F0FF', color: '#00F0FF' }}
              onMouseEnter={() => sound.playHover()}
            >
              ✨ KINTSUGI DORADO
            </span>
          </div>

          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(2.6rem, 5.8vw, 4.8rem)',
            fontWeight: 900,
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
            color: '#ffffff',
            textShadow: '0 10px 40px rgba(0,0,0,0.9)'
          }}>
            RETRATOS QUE SON<br />
            <span className="text-pop-gradient" style={{ display: 'inline-block' }}>
              ESPEJOS EMOCIONALES
            </span>
          </h1>

          {/* Curatorial Manifesto Highlight */}
          <div 
            style={{
              background: 'rgba(255, 0, 122, 0.07)',
              borderLeft: '4px solid #FF007A',
              padding: '18px 22px',
              borderRadius: '0 16px 16px 0',
              backdropFilter: 'blur(16px)',
              borderTop: '1px solid rgba(255,0,122,0.25)',
              borderRight: '1px solid rgba(255,0,122,0.25)',
              borderBottom: '1px solid rgba(255,0,122,0.25)',
              maxWidth: '580px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,0,122,0.1)'
            }}
          >
            <p style={{
              margin: 0,
              fontFamily: 'var(--font-sans)',
              fontSize: '1.02rem',
              color: 'rgba(255,255,255,0.96)',
              lineHeight: 1.65,
              fontWeight: 500
            }}>
              <strong style={{ color: '#FFE600' }}>«Todos somos lo mismo con distintas apariencias.»</strong> Naroa Gutiérrez Gil transforma la iconografía pop y los soportes primordiales —pizarra natural de derribos en Bizkaia y mica mineral— en máscaras emocionales del alma humana.
            </p>
          </div>

          {/* SOTA Material Selector Switches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#00F0FF', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em' }}>
                ✦ SELECCIONAR OBRA DE DESTACADOS ({selectedIdx + 1}/{HERO_FEATURED.length}):
              </span>
              <button 
                onClick={() => {
                  sound.playTick()
                  setIsAutoplay(!isAutoplay)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isAutoplay ? '#FFE600' : 'rgba(255,255,255,0.4)',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                {isAutoplay ? '▶ ROTACIÓN AUTO' : '⏸ PAUSADO'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {HERO_FEATURED.map((item, idx) => (
                <button
                  key={item.title}
                  onClick={() => {
                    sound.playTick()
                    setSelectedIdx(idx)
                  }}
                  onMouseEnter={() => sound.playHover()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    background: selectedIdx === idx ? 'rgba(0, 240, 255, 0.22)' : 'rgba(255,255,255,0.04)',
                    border: selectedIdx === idx ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.12)',
                    color: selectedIdx === idx ? '#00F0FF' : 'rgba(255,255,255,0.7)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: selectedIdx === idx ? 800 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: selectedIdx === idx ? '0 0 18px rgba(0, 240, 255, 0.35)' : 'none'
                  }}
                >
                  {item.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '6px' }}>
            <a 
              href="#/gallery" 
              onClick={() => sound.playOpen()}
              onMouseEnter={(e) => {
                sound.playMicaShimmer()
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 0, 122, 0.6), 0 0 30px rgba(255, 230, 0, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 0, 122, 0.4), 0 0 20px rgba(255, 230, 0, 0.3)'
              }}
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
            >
              ⚡ BILDUMA (VER 140 OBRAS) <span>→</span>
            </a>

            <a 
              href="#/commissions" 
              onClick={() => sound.playTick()}
              onMouseEnter={() => sound.playHover()}
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
                background: 'rgba(0, 240, 255, 0.08)',
                transition: 'all 0.3s ease'
              }}
            >
              ⚡ ESKAERAK / ENCARGOS ↗
            </a>

            <a 
              href="#3d" 
              onClick={() => sound.playSplatActivate()}
              onMouseEnter={() => sound.playHover()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                color: '#FFE600',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '14px 24px',
                border: '1px solid rgba(255, 230, 0, 0.4)',
                borderRadius: '30px',
                background: 'rgba(255, 230, 0, 0.08)',
                transition: 'all 0.3s ease'
              }}
            >
              🎮 SALA VIRTUAL 3D ↗
            </a>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            marginTop: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.5)'
          }}>
            <span>• 140 OBRAS CATALOGADAS</span>
            <span>• PIZARRA NATURAL & MICA</span>
            <span>• BILBAO 2026</span>
          </div>
        </motion.div>

        {/* Right Column: High-Fidelity Artwork Showcase with 3D Tilt Glare Card */}
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
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative',
            pointerEvents: 'auto',
            perspective: '1200px'
          }}
        >
          <div
            ref={cardRef}
            onMouseEnter={() => {
              setIsHoveredCard(true)
              sound.playMicaShimmer()
            }}
            onMouseMove={handleMouseMoveCard}
            onMouseLeave={handleMouseLeaveCard}
            style={{ 
              position: 'relative', 
              borderRadius: '24px', 
              padding: '16px',
              background: '#FFFFFF',
              border: isHoveredCard ? '2px solid #FF007A' : '1px solid rgba(255, 0, 122, 0.4)',
              boxShadow: isHoveredCard 
                ? '0 35px 100px rgba(0,0,0,0.95), 0 0 60px rgba(255, 0, 122, 0.5), 0 0 30px rgba(255, 230, 0, 0.4)' 
                : '0 25px 70px rgba(0,0,0,0.9)',
              maxWidth: '480px',
              width: '100%',
              cursor: 'pointer',
              overflow: 'hidden',
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transition: isHoveredCard ? 'transform 0.08s ease-out, border 0.3s, box-shadow 0.3s' : 'transform 0.5s ease, border 0.3s, box-shadow 0.3s'
            }}
            onClick={() => {
              sound.playOpen()
              window.location.hash = activeItem.hash
            }}
            title="Haz clic para inspeccionar la obra en la Galería"
          >
            {/* Interactive Dynamic Glare Overlay */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 10,
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 230, 0, 0.2) 35%, transparent 70%)`,
                opacity: glarePos.opacity,
                transition: 'opacity 0.2s ease'
              }}
            />

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
                  maxHeight: '56vh', 
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
              background: 'rgba(5, 5, 8, 0.88)',
              backdropFilter: 'blur(14px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 15
            }}>
              <div>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>{activeItem.title}</h4>
                <p style={{ margin: '2px 0 0 0', color: '#00F0FF', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{activeItem.medium}</p>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'rgba(255, 230, 0, 0.22)', color: '#FFE600', borderRadius: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {activeItem.year}
              </span>
            </div>
          </div>

          {/* Carousel Arrows & Dot Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '18px', pointerEvents: 'auto' }}>
            <button
              onClick={handlePrev}
              onMouseEnter={() => sound.playHover()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
              title="Obra anterior"
            >
              ←
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {HERO_FEATURED.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    sound.playTick()
                    setSelectedIdx(i)
                  }}
                  style={{
                    width: selectedIdx === i ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: selectedIdx === i ? '#00F0FF' : 'rgba(255,255,255,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: selectedIdx === i ? '0 0 10px #00F0FF' : 'none'
                  }}
                  title={`Ir a obra ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              onMouseEnter={() => sound.playHover()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
              title="Obra siguiente"
            >
              →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll-Driven Feature Showcase Section: Materiales Vivos */}
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
          margin: '35px auto 0',
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
            whileHover={{ y: -6, borderColor: '#FF007A' }}
            onMouseEnter={() => sound.playSlateRasp()}
            style={{
              background: 'rgba(10, 10, 15, 0.75)',
              border: '1px solid rgba(255, 0, 122, 0.3)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>🪨</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF007A', fontWeight: 800, letterSpacing: '0.1em' }}>
              PIZARRA VINTAGE DE BIZKAIA
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '8px 0' }}>Piedra de Derribo Vasco</h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, margin: 0 }}>
              Extraída de tejados centenarios desmontados en Bizkaia. Sellada con resina epoxi de alto brillo, la pizarra ofrece millones de años de historia sobre los que florece el retrato pop.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, borderColor: '#FFE600' }}
            onMouseEnter={() => sound.playMicaShimmer()}
            style={{
              background: 'rgba(10, 10, 15, 0.75)',
              border: '1px solid rgba(255, 230, 0, 0.3)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>💎</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FFE600', fontWeight: 800, letterSpacing: '0.1em' }}>
              DESTELLOS DE LUZ REAL
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '8px 0' }}>Mica Mineral & Pan de Oro</h3>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, margin: 0 }}>
              Escamas minerales de mica aplicadas en relieve matérico que centellean y mutan de color según el ángulo de luz natural o los focos de la sala.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, borderColor: '#00F0FF' }}
            onMouseEnter={() => sound.playHover()}
            style={{
              background: 'rgba(10, 10, 15, 0.75)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>✨</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#00F0FF', fontWeight: 800, letterSpacing: '0.1em' }}>
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
  )
}



