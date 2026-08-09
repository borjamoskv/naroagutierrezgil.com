import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

export function NavigationPill({ currentView, audioActive, toggleAudio, onOpenTerminal, onOpenEspejo }: NavigationPillProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
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
            background: 'rgba(8, 8, 14, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '100px',
            border: '1px solid rgba(255, 0, 122, 0.3)',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 0, 122, 0.15)',
            gap: '20px'
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

          {/* Desktop Navigation links */}
          <ul className="nav-desktop-links" style={{ display: 'flex', gap: '14px', listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>
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
                      color: isActive ? '#FFE600' : 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
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

          {/* Desktop Utilities */}
          <div className="nav-desktop-utils" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={toggleAudio}
              onMouseEnter={() => sound.playHover()}
              title={audioActive ? 'Silenciar BSO: Boards of Burgos' : 'Activar BSO: Boards of Burgos'}
              style={{
                background: audioActive ? 'rgba(255, 0, 122, 0.2)' : 'rgba(255,255,255,0.05)',
                border: audioActive ? '1px solid #FF007A' : '1px solid rgba(255,255,255,0.15)',
                color: audioActive ? '#FF007A' : 'rgba(255,255,255,0.5)',
                borderRadius: '20px',
                padding: '4px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
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
                  letterSpacing: '0.08em'
                }}
              >
                ⌘K
              </button>
            )}

            {onOpenEspejo && (
              <button
                onClick={() => { sound.playMicaShimmer(); onOpenEspejo() }}
                onMouseEnter={() => sound.playHover()}
                title="Abrir Manifiesto Especular & Palíndromos (AORAN ↔ NAROA)"
                style={{
                  background: 'rgba(255, 0, 122, 0.18)',
                  border: '1px solid #FF007A',
                  color: '#FFE600',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🪞 AORAN
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="nav-mobile-toggle"
            onClick={() => { sound.playTick(); setMobileMenuOpen(!mobileMenuOpen) }}
            style={{
              background: 'rgba(255, 0, 122, 0.2)',
              border: '1px solid #FF007A',
              color: '#fff',
              borderRadius: '20px',
              padding: '6px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'none'
            }}
          >
            {mobileMenuOpen ? '✕ CERRAR' : '☰ MENÚ'}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '80px',
              left: '16px',
              right: '16px',
              background: 'rgba(8, 8, 14, 0.95)',
              backdropFilter: 'blur(30px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 0, 122, 0.4)',
              padding: '24px',
              zIndex: 9998,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 0, 122, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#00F0FF', letterSpacing: '0.15em', fontWeight: 700 }}>
              ✦ NAVEGACIÓN PRINCIPAL
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {NAV_ITEMS.map(item => (
                <a
                  key={item.key}
                  href={item.hash}
                  onClick={() => { sound.playTick(); setMobileMenuOpen(false) }}
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    padding: '10px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button
                onClick={toggleAudio}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: audioActive ? 'rgba(255, 0, 122, 0.2)' : 'rgba(255,255,255,0.1)',
                  border: '1px solid #FF007A',
                  color: '#FF007A',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {audioActive ? '🎵 AUDIO ON' : '🔇 AUDIO OFF'}
              </button>

              {onOpenTerminal && (
                <button
                  onClick={() => { sound.playOpen(); setMobileMenuOpen(false); onOpenTerminal() }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    background: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid #00F0FF',
                    color: '#00F0FF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⌘K CLI TERMINAL
                </button>
              )}

              {onOpenEspejo && (
                <button
                  onClick={() => { sound.playMicaShimmer(); setMobileMenuOpen(false); onOpenEspejo() }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    background: 'rgba(255, 230, 0, 0.15)',
                    border: '1px solid #FFE600',
                    color: '#FFE600',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🪞 MANIFIESTO AORAN
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


