import { motion } from 'framer-motion'
import { sound } from '../utils/audio'

export function HomeHero() {
  return (
    <section className="hero-immersive" style={{ background: '#000' }}>
      {/* Imagen de fondo fullscreen - Estática y nítida */}
      <div className="hero-immersive__image-wrapper" style={{ opacity: 0.9 }}>
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          src="/assets/marilyn-rocks--qPeLHxE.webp"
          alt="Marilyn Rocks — Naroa Gutiérrez Gil"
          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '40px' }}
        />
      </div>

      {/* Contenido Minimalista - Solo el nombre y entrada */}
      <motion.div 
        className="hero-immersive__content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
        style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'auto' }}
      >
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
          Naroa Gutiérrez Gil
        </p>
        <a href="#/destacada" 
           onClick={() => sound.playTick()}
           style={{
             display: 'inline-block',
             color: '#fff',
             textDecoration: 'none',
             fontFamily: 'var(--font-sans)',
             fontSize: '0.85rem',
             letterSpacing: '0.1em',
             padding: '8px 24px',
             border: '1px solid rgba(255,255,255,0.2)',
             borderRadius: '2px',
             transition: 'background 0.3s'
           }}
           onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
           onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Entrar a la Galería
        </a>
      </motion.div>
    </section>
  )
}
