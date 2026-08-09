import { motion } from 'framer-motion'
import { sound } from '../utils/audio'
import { SlateHeroCanvas } from './SlateHeroCanvas'

export function HomeHero() {
  return (
    <section 
      className="hero-immersive" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        minHeight: '100vh', 
        overflow: 'hidden', 
        background: '#07070a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 5vw 60px'
      }}
    >
      {/* Interactive 3D Slate Surface background with light ray & gold particles */}
      <SlateHeroCanvas />

      {/* Main Hero Container Grid */}
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 10, 
          width: '100%', 
          maxWidth: '1400px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '60px', 
          alignItems: 'center',
          pointerEvents: 'none'
        }}
      >
        {/* Left Column: Bold Typography & CTAs */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem', 
              letterSpacing: '0.2em', 
              color: '#F59E0B', 
              textTransform: 'uppercase',
              fontWeight: 700,
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              padding: '6px 16px',
              borderRadius: '20px'
            }}>
              ✦ NAROA GUTIÉRREZ GIL — BILBAO
            </span>
          </div>

          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            textShadow: '0 10px 30px rgba(0,0,0,0.9)'
          }}>
            HIPERREALISMO POP<br />
            <span style={{ 
              background: 'linear-gradient(135deg, #F59E0B 0%, #2B3BE5 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>
              & MATERIA LÍTICA
            </span>
          </h1>

          <p style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.6,
            maxWidth: '540px'
          }}>
            Retratos que respiran materia. Pigmentos acrílicos, resina epoxi y pizarra natural de tejado vasco recuperada de derribos arquitectónicos en Bizkaia.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '10px' }}>
            <a 
              href="#/destacada" 
              onClick={() => sound.playOpen()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                color: '#fff',
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #2B3BE5 0%, #F59E0B 100%)',
                border: '1px solid #F59E0B',
                borderRadius: '30px',
                boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 158, 11, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.3)'
              }}
            >
              EXPLORAR OBRAS <span>→</span>
            </a>

            <a 
              href="#/encargos" 
              onClick={() => sound.playTick()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                color: 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '30px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.borderColor = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
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
            whileHover={{ 
              scale: 1.03,
              rotateX: 3,
              rotateY: -3,
              boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 80px rgba(245, 158, 11, 0.25)',
              borderColor: 'rgba(245, 158, 11, 0.6)'
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            style={{ 
              position: 'relative', 
              borderRadius: '20px', 
              padding: '12px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 40px rgba(245, 158, 11, 0.15)',
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


