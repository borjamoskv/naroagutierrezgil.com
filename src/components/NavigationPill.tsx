import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function NavigationPill({ currentView, setView, onOpenTerminal }) {
  const [scrolled, setScrolled] = useState(false)
  const [audioActive, setAudioActive] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'home', label: 'Inicio' },
    { id: 'gallery', label: 'Colección' },
    { id: 'sala', label: 'Sala 3D' },
    { id: 'encargos', label: 'Encargos' },
    { id: 'blog', label: 'Bitácora' },
    { id: 'about', label: 'Sobre Mí' }
  ]

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
        background: scrolled ? 'rgba(10, 10, 14, 0.85)' : 'rgba(20, 20, 26, 0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '100px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        transition: 'all 0.3s ease'
      }}>
        <button
          onClick={() => setView('home')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginRight: '8px'
          }}
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
            fontSize: '1.2rem'
          }}>
            N
          </div>
        </button>

        <div style={{ display: 'flex', gap: '4px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{
                background: currentView === item.id ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                border: 'none',
                borderRadius: '50px',
                padding: '8px 16px',
                color: currentView === item.id ? '#F59E0B' : 'rgba(255,255,255,0.7)',
                fontSize: '0.85rem',
                fontWeight: currentView === item.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Outfit, sans-serif'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

        <button
          onClick={() => setAudioActive(!audioActive)}
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
          title="Audio FX"
        >
          {audioActive ? '🔊' : '🔇'}
        </button>

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
          title="Terminal Curatorial"
        >
          ⌨️
        </button>
      </div>
    </motion.div>
  )
}
