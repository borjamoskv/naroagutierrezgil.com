import { motion } from 'framer-motion'
import { sound } from '../utils/audio'

interface NavigationPillProps {
  currentView: string
  audioActive: boolean
  toggleAudio: () => void
  onOpenTerminal?: () => void
  onOpenEspejo?: () => void
}

const NAV_ITEMS = [
  { key: 'destacada', label: 'OBRA / BILDUMA', hash: '#/destacada' },
  { key: '3d', label: 'SALA 3D', hash: '#/3d' },
  { key: 'encargos', label: 'ENCARGOS ⚡', hash: '#/encargos' },
  { key: 'about', label: 'SOBRE NAROA', hash: '#/sobre-mi' },
  { key: 'blog', label: 'DIARIO POP', hash: '#/blog' },
] as const

export function NavigationPill({ currentView, audioActive, toggleAudio, onOpenTerminal }: NavigationPillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="nav-pill"
      style={{
        position: 'fixed',
        top: '20px',
        left: 0,
        right: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      <div 
        className="nav-pill__inner"
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          padding: '10px 24px',
          background: 'rgba(8, 8, 14, 0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '100px',
          border: '1px solid rgba(255, 0, 122, 0.3)',
          boxShadow: '0 10px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 0, 122, 0.15)',
          gap: '24px'
        }}
      >
        {/* Logo Brand */}
        <a
          href="#/"
          onMouseEnter={() => sound.playHover()}
          onClick={() => { sound.playOpen(); window.location.hash = '#/' }}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#fff',
            textDecoration: 'none',
            letterSpacing: '0.15em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          NAROA<span style={{ color: '#FF007A' }}>.</span>
        </a>

        {/* Navigation links */}
        <ul style={{ display: 'flex', gap: '18px', listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>
          {NAV_ITEMS.map(item => {
            const isActive = currentView === item.key || 
              (item.key === 'destacada' && (currentView === 'gallery' || currentView === 'destacada')) ||
              (item.key === 'encargos' && (currentView === 'commissions' || currentView === 'encargos')) ||
              (item.key === 'about' && (currentView === 'about' || currentView === 'sobre-mi'))

            return (
              <li key={item.key}>
                <a
                  href={item.hash}
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playTick()}
                  style={{
                    color: isActive ? '#FFE600' : 'rgba(255,255,255,0.65)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.73rem',
                    fontWeight: isActive ? 800 : 500,
                    letterSpacing: '0.08em',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: isActive ? 'rgba(255, 230, 0, 0.12)' : 'transparent'
                  }}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill-active"
                      style={{
                        position: 'absolute',
                        bottom: -2,
                        left: '12px',
                        right: '12px',
                        height: '2px',
                        background: 'linear-gradient(90deg, #FF007A 0%, #FFE600 50%, #00F0FF 100%)',
                        boxShadow: '0 0 10px #FF007A'
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </a>
              </li>
            )
          })}
        </ul>

        {/* Audio Toggle button */}
        <button
          onClick={toggleAudio}
          onMouseEnter={() => sound.playHover()}
          title={audioActive ? 'Silenciar BSO: Boards of Burgos (Borja Moskv)' : 'Activar BSO: Boards of Burgos (Borja Moskv)'}
          style={{
            background: audioActive ? 'rgba(255, 0, 122, 0.2)' : 'rgba(255,255,255,0.05)',
            border: audioActive ? '1px solid #FF007A' : '1px solid rgba(255,255,255,0.15)',
            color: audioActive ? '#FF007A' : 'rgba(255,255,255,0.4)',
            borderRadius: '20px',
            padding: '4px 10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: audioActive ? '#FF007A' : 'gray',
            boxShadow: audioActive ? '0 0 8px #FF007A' : 'none'
          }} />
          {audioActive ? 'AUDIO ON' : 'AUDIO OFF'}
        </button>

        {/* CLI Terminal Shortcut Button */}
        {onOpenTerminal && (
          <button
            onClick={() => { sound.playOpen(); onOpenTerminal() }}
            onMouseEnter={() => sound.playHover()}
            title="Abrir Curatorial Terminal CLI (⌘K)"
            style={{
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              color: '#00F0FF',
              borderRadius: '20px',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.3s ease'
            }}
          >
            <span>⌘K</span>
            <span style={{ opacity: 0.7 }}>CLI</span>
          </button>
        )}

        {/* Automatic Locale Selector Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(0, 240, 255, 0.08)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          borderRadius: '20px',
          padding: '2px 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: '#00F0FF'
        }}>
          <span style={{ opacity: 0.6, fontSize: '0.6rem' }}>🌐</span>
          <button
            onClick={() => { sound.playTick(); localStorage.setItem('naroa_lang', 'eu'); window.location.reload() }}
            style={{ background: 'none', border: 'none', color: '#FFE600', fontWeight: 800, cursor: 'pointer', padding: '2px' }}
            title="Euskara (Autodetektatua)"
          >
            EU
          </button>
          <span style={{ opacity: 0.3 }}>|</span>
          <button
            onClick={() => { sound.playTick(); localStorage.setItem('naroa_lang', 'es'); window.location.reload() }}
            style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', padding: '2px' }}
            title="Castellano"
          >
            ES
          </button>
          <span style={{ opacity: 0.3 }}>|</span>
          <button
            onClick={() => { sound.playTick(); localStorage.setItem('naroa_lang', 'en'); window.location.reload() }}
            style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', padding: '2px' }}
            title="English"
          >
            EN
          </button>
        </div>
      </div>
    </motion.div>
  )
}

