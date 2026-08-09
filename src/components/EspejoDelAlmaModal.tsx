import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sound } from '../utils/audio'

interface EspejoDelAlmaModalProps {
  isOpen: boolean
  onClose: () => void
}

export const EspejoDelAlmaModal: React.FC<EspejoDelAlmaModalProps> = ({ isOpen, onClose }) => {
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
          backgroundColor: '#040407',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '30px'
        }}
      >
        {/* Mica sparkle particle background overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at center, rgba(255, 0, 122, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Modal Window Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '780px',
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundColor: '#0A0A12',
            border: '2px solid #FF007A',
            boxShadow: '0 0 50px rgba(255, 0, 122, 0.4), 0 0 30px rgba(0, 240, 255, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '36px 30px',
            textAlign: 'center'
          }}
        >
          {/* Header */}
          <span className="pop-badge pop-badge--pink pop-glow-pulse" style={{ marginBottom: '16px' }}>
            🪞 MODO ESPEJO DEL ALMA // MANIFIESTO REAL
          </span>

          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.1
          }}>
            «TODOS SOMOS LO MISMO CON <span className="text-pop-gradient">DISTINTAS APARIENCIAS</span>»
          </h2>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.75)',
            marginTop: '12px',
            maxWidth: '600px'
          }}>
            La obra de Naroa no retrata estatuas distantes; convierte el rostro en un soporte sagrado sobre pizarra natural y mica mineral.
          </p>

          {/* Procedural Reflection Canvas (Zero Permissions Required) */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '520px',
            height: '320px',
            marginTop: '24px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 230, 0, 0.4)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.9)',
            backgroundColor: '#050508',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 50% 40%, rgba(255,0,122,0.2) 0%, rgba(0,240,255,0.1) 50%, #050508 100%)',
              filter: 'blur(20px)',
              animation: 'popPulse 4s infinite ease-in-out'
            }} />

            <span style={{ fontSize: '3.5rem', zIndex: 2, marginBottom: '12px' }}>🪞</span>
            
            <p style={{
              zIndex: 2,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: '#FFE600',
              fontWeight: 700,
              margin: 0,
              letterSpacing: '0.1em'
            }}>
              [ REFLEJO LÍTICO DE LA CONDICIÓN HUMANA ]
            </p>

            <p style={{
              zIndex: 2,
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.65)',
              marginTop: '8px',
              maxWidth: '380px'
            }}>
              «Cada retrato en pizarra guarda tu propia mirada. La materia mineral refleja lo imperecedero del alma.»
            </p>

            {/* Slate texture overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              border: '2px solid rgba(255,255,255,0.1)',
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)'
            }} />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '28px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 30px',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, #FF007A 0%, #FFE600 100%)',
                border: 'none',
                color: '#000',
                fontFamily: 'var(--font-sans)',
                fontWeight: 900,
                fontSize: '0.9rem',
                cursor: 'pointer',
                letterSpacing: '0.08em'
              }}
            >
              VOLVER A LA GALERÍA ➔
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
