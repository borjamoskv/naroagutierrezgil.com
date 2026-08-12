import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sound } from '../utils/audio'

interface SecretEasterEggModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SecretEasterEggModal: React.FC<SecretEasterEggModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      sound.playMicaShimmer()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 5, 10, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 10000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px'
        }}
      >
        <motion.div
          initial={{ scale: 0.88, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.88, y: 30 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '650px',
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundColor: '#07070D',
            border: '2px solid var(--gold)',
            boxShadow: '0 0 50px rgba(245, 158, 11, 0.4), 0 0 30px rgba(43, 59, 229, 0.3)',
            padding: '36px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Neon Easter Egg Badge */}
          <span className="pop-badge pop-badge--yellow pop-glow-pulse" style={{ marginBottom: '16px' }}>
            ⚡ SECRET EASTER EGG UNLOCKED // CAPA SOTA
          </span>

          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.15
          }}>
            REVERSO ACÚSTICO & <span className="text-pop-gradient">PAISAJES SONOROS</span>
          </h2>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.85)',
            marginTop: '16px',
            lineHeight: 1.6,
            maxWidth: '520px'
          }}>
            Has descubierto el reverso sagrado del lienzo. Detrás de cada pizarra habita la música electrónica y la alquimia sonora concebida por <strong style={{ color: 'var(--gold-hi)' }}>Borja Moskv</strong> en simbiosis con <strong style={{ color: 'var(--gold)' }}>Naroa Gutiérrez Gil</strong>.
          </p>

          <div style={{
            margin: '20px 0',
            padding: '16px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(43, 59, 229, 0.08)',
            border: '1px solid rgba(43, 59, 229, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.8rem' }}>🎵</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--cobalt-soft)', fontWeight: 700 }}>
                DISCOGRAFÍA & PROYECTOS SONOROS
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: '#fff', fontWeight: 800 }}>
                Borja Moskv Soundscapes & Electronic Reworks
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
            <a
              href="https://borjamoskv.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playOpen()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 32px',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, #2B3BE5 0%, #F59E0B 100%)',
                border: 'none',
                color: '#000',
                fontFamily: 'var(--font-sans)',
                fontWeight: 900,
                fontSize: '0.92rem',
                textDecoration: 'none',
                letterSpacing: '0.08em',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
              }}
            >
              🌐 EXPLORAR BORJAMOSKV.COM ↗
            </a>

            <button
              onClick={onClose}
              style={{
                padding: '14px 28px',
                borderRadius: '30px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                letterSpacing: '0.08em'
              }}
            >
              [ CERRAR ✕ ]
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
