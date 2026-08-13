import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface NavigationPillProps {
  currentView: string
  audioActive?: boolean
  toggleAudio?: () => void
  onOpenTerminal?: () => void
  onOpenEspejo?: () => void
}

export function NavigationPill({
  currentView,
  audioActive = false,
  toggleAudio,
  onOpenTerminal,
  onOpenEspejo
}: NavigationPillProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'home', label: 'Inicio', hash: '#home' },
    { id: 'gallery', label: 'Colección', hash: '#gallery' },
    { id: '3d', label: 'Sala 3D', hash: '#3d' },
    { id: 'commissions', label: 'Encargos', hash: '#commissions' },
    { id: 'blog', label: 'Bitácora', hash: '#blog' },
    { id: 'about', label: 'Sobre Mí', hash: '#sobre-mi' }
  ]

  const handleNavigate = (hash: string) => {
    window.location.hash = hash
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: scrolled ? 'rgba(7, 7, 9, 0.92)' : 'rgba(14, 14, 18, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '100px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
        transition: 'all 0.3s ease'
      }}>
        <button
          onClick={() => handleNavigate('#home')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginRight: '4px'
          }}
          title="Naroa Gutiérrez Gil — Artista Visual"
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F59E0B, #FFD700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: 900,
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.1rem'
          }}>
            N
          </div>
        </button>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
          {navItems.map(item => {
            const isActive = currentView === item.id || (currentView === 'destacada' && item.id === 'gallery')
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.hash)}
                style={{
                  background: isActive ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '8px 16px',
                  color: isActive ? '#F59E0B' : 'rgba(255,255,255,0.75)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Outfit, sans-serif',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />

        {toggleAudio && (
          <button
            onClick={toggleAudio}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: audioActive ? '#F59E0B' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s ease'
            }}
            title={audioActive ? 'Silenciar Audio' : 'Activar Ambient Audio'}
          >
            {audioActive ? '🔊' : '🔇'}
          </button>
        )}

        {onOpenEspejo && (
          <button
            onClick={onOpenEspejo}
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#F59E0B',
              transition: 'all 0.2s ease'
            }}
            title="Espejo del Alma — Test Interactivo"
          >
            🪞
          </button>
        )}

        {onOpenTerminal && (
          <button
            onClick={onOpenTerminal}
            style={{
              background: 'rgba(43, 59, 229, 0.15)',
              border: '1px solid rgba(43, 59, 229, 0.3)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#8D97FF',
              transition: 'all 0.2s ease'
            }}
            title="Terminal Curatorial (Cmd+K)"
          >
            ⌨️
          </button>
        )}
      </div>
    </motion.div>
  )
}
