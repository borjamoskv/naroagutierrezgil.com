import { motion } from 'framer-motion'
import { sound } from '../utils/audio'

interface NavigationPillProps {
  currentView: 'home' | '3d' | 'destacada' | 'encargos' | 'juegos' | 'about' | 'blog'
  audioActive: boolean
  toggleAudio: () => void
}

export function NavigationPill({ currentView, audioActive, toggleAudio }: NavigationPillProps) {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 40px',
        background: 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <a 
          href="#/" 
          onClick={() => { sound.playTick(); window.location.hash = '#/'; }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            fontWeight: 400,
            color: '#fff',
            textDecoration: 'none',
            letterSpacing: '0.1em'
          }}
        >
          NAROA.
        </a>
        <ul style={{
          display: 'flex',
          gap: '24px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          letterSpacing: '0.05em'
        }}>
          <li><a href="#/destacada" style={{ color: currentView === 'destacada' ? '#fff' : 'rgba(255,255,255,0.4)', textDecoration: 'none' }} onClick={() => sound.playTick()}>OBRA</a></li>
          <li><a href="#/3d" style={{ color: currentView === '3d' ? '#fff' : 'rgba(255,255,255,0.4)', textDecoration: 'none' }} onClick={() => sound.playTick()}>3D</a></li>
          <li><a href="#/sobre-mi" style={{ color: currentView === 'about' ? '#fff' : 'rgba(255,255,255,0.4)', textDecoration: 'none' }} onClick={() => sound.playTick()}>SOBRE MÍ</a></li>
          <li><a href="#/blog" style={{ color: currentView === 'blog' ? '#fff' : 'rgba(255,255,255,0.4)', textDecoration: 'none' }} onClick={() => sound.playTick()}>BLOG</a></li>
          <li><a href="#/encargos" style={{ color: currentView === 'encargos' ? '#fff' : 'rgba(255,255,255,0.4)', textDecoration: 'none' }} onClick={() => sound.playTick()}>CONTACTO</a></li>
        </ul>
      </div>
      
      <button
        onClick={toggleAudio}
        title={audioActive ? 'Silenciar — Reproduciendo: Boards Of Burgos (Borja Moskv)' : 'Activar sonido — Boards Of Burgos'}
        style={{
          background: 'none',
          border: 'none',
          color: audioActive ? '#D4AF37' : 'rgba(255,255,255,0.3)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          cursor: 'pointer',
          letterSpacing: '0.1em',
          transition: 'color 0.3s ease'
        }}
      >
        [ {audioActive ? 'AUDIO ON' : 'AUDIO OFF'} ]
      </button>
    </motion.nav>
  )
}
