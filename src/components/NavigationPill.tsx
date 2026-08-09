import { motion } from 'framer-motion'
import { sound } from '../utils/audio'

interface NavigationPillProps {
  currentView: 'home' | '3d' | 'destacada' | 'encargos' | 'juegos' | 'about' | 'blog'
  audioActive: boolean
  toggleAudio: () => void
}

const NAV_ITEMS = [
  { key: 'destacada', label: 'Obra', hash: '#/destacada' },
  { key: '3d', label: '3D', hash: '#/3d' },
  { key: 'about', label: 'Naroa', hash: '#/sobre-mi' },
  { key: 'encargos', label: 'Contacto', hash: '#/encargos' },
] as const

export function NavigationPill({ currentView, audioActive, toggleAudio }: NavigationPillProps) {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.3 }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 28px',
        background: 'transparent',
      }}
    >
      {/* Logo */}
      <a
        href="#/"
        onMouseEnter={() => sound.playHover()}
        onClick={() => { sound.playOpen(); window.location.hash = '#/' }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '1.15rem',
          fontWeight: 700,
          color: '#fff',
          textDecoration: 'none',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          transition: 'color 0.3s ease',
        }}
      >
        Naroa <span style={{ color: '#D4AF37' }}>.</span>
      </a>

      {/* Navigation links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = currentView === item.key
          return (
            <a
              key={item.key}
              href={item.hash}
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playTick()}
              style={{
                color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.3s ease',
                position: 'relative',
                paddingBottom: '4px',
              }}
            >
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="nav-underline"
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, #D4AF37 0%, #2B3BE5 100%)',
                    borderRadius: '1px'
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </a>
          )
        })}

        {/* Audio toggle — minimal */}
        <button
          onClick={toggleAudio}
          onMouseEnter={() => sound.playHover()}
          title={audioActive ? 'Silenciar' : 'Activar sonido'}
          style={{
            background: audioActive ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
            border: audioActive ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.15)',
            color: audioActive ? '#D4AF37' : 'rgba(255,255,255,0.4)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            cursor: 'pointer',
            letterSpacing: '0.1em',
            transition: 'all 0.3s ease',
            padding: '4px 10px',
            borderRadius: '14px'
          }}
        >
          {audioActive ? 'AUDIO ON 🔊' : 'AUDIO OFF 🔇'}
        </button>
      </div>
    </motion.nav>
  )
}
