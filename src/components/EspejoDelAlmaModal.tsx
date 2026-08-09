import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sound } from '../utils/audio'

interface EspejoDelAlmaModalProps {
  isOpen: boolean
  onClose: () => void
}

export const EspejoDelAlmaModal: React.FC<EspejoDelAlmaModalProps> = ({ isOpen, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false)

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
          backgroundColor: 'rgba(4, 4, 7, 0.95)',
          backdropFilter: 'blur(16px)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          overflowY: 'auto'
        }}
      >
        {/* Mica particle background overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at center, rgba(255, 0, 122, 0.18) 0%, rgba(0, 240, 255, 0.08) 50%, transparent 80%)',
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
            maxWidth: '860px',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '24px',
            backgroundColor: '#0A0A14',
            border: '2px solid #FF007A',
            boxShadow: '0 0 60px rgba(255, 0, 122, 0.4), 0 0 40px rgba(0, 240, 255, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 32px',
            textAlign: 'center'
          }}
        >
          {/* Header */}
          <span className="pop-badge pop-badge--pink pop-glow-pulse" style={{ marginBottom: '14px' }}>
            🪞 A NAROA LA ORAN // PALÍNDROMOS & MANIFIESTO ESPECULAR
          </span>

          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.15
          }}>
            A NAROA <span className="text-pop-gradient">LA ORAN</span>
          </h2>

          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: '#FFE600',
            marginTop: '8px',
            letterSpacing: '0.08em'
          }}>
            [ LA FIRMA ESPECULAR & LA SIMETRÍA MATÉRICA EN BILBAO ]
          </p>

          {/* Interactive 3D Specular Flip Card (NAROA ↔ AORAN) */}
          <div
            onClick={() => {
              sound.playHeartbeat(0.1)
              setIsFlipped(!isFlipped)
            }}
            style={{
              perspective: '1000px',
              width: '100%',
              maxWidth: '480px',
              height: '140px',
              margin: '24px 0',
              cursor: 'pointer'
            }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                borderRadius: '20px',
                border: '1.5px solid rgba(255, 0, 122, 0.6)',
                background: 'linear-gradient(135deg, rgba(255,0,122,0.15) 0%, rgba(0,240,255,0.15) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}
            >
              {/* Front Face: NAROA */}
              <div style={{
                position: 'absolute',
                backfaceVisibility: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '0.2em' }}>
                  N A R O A
                </span>
                <span style={{ fontSize: '0.72rem', color: '#00F0FF', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ( HAZ CLIC PARA INVERTIR EN EL ESPEJO 🔄 )
                </span>
              </div>

              {/* Back Face: AORAN */}
              <div style={{
                position: 'absolute',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#FFE600', letterSpacing: '0.2em' }}>
                  A O R A N
                </span>
                <span style={{ fontSize: '0.72rem', color: '#FF007A', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  [ FIRMA ESPECULAR & ALTER-EGO LÍTICO ]
                </span>
              </div>
            </motion.div>
          </div>

          {/* Breakdown Grid of Palindromes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            width: '100%',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px' }}>
              <div style={{ fontSize: '0.7rem', color: '#FF007A', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>01 · FIRMA ESPECULAR</div>
              <h4 style={{ margin: '4px 0', color: '#FFE600', fontSize: '1.1rem' }}>AORAN ↔ NAROA</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                Inversión exacta letra a letra. Naroa firma las obras en el reverso de la piedra de pizarra con <em>AORAN</em> como su espejo oculto.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px' }}>
              <div style={{ fontSize: '0.7rem', color: '#00F0FF', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>02 · MANIFIESTO REAL</div>
              <h4 style={{ margin: '4px 0', color: '#fff', fontSize: '1.1rem' }}>S O M O S</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                «Todos <strong>SOMOS</strong> lo mismo con distintas apariencias». La piedra de derribo vasco iguala la esencia de iconos y seres anónimos.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px' }}>
              <div style={{ fontSize: '0.7rem', color: '#FFE600', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>03 · LA MIRADA</div>
              <h4 style={{ margin: '4px 0', color: '#00F0FF', fontSize: '1.1rem' }}>R E C O N O C E R</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                «Contemplar el cuadro es <strong>RECONOCER</strong> en el lienzo hiperrealista lo imperecedero de nuestra propia memoria.»
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px' }}>
              <div style={{ fontSize: '0.7rem', color: '#FF007A', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>04 · SIMETRÍA LÍTICA</div>
              <h4 style={{ margin: '4px 0', color: '#FF007A', fontSize: '1.1rem' }}>OJO & RADAR</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                El <strong>OJO</strong> donde incrusta las escamas de mica mineral y el <strong>RADAR</strong> pop con el que rastrea la iconografía contemporánea.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '14px 36px',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, #FF007A 0%, #FFE600 100%)',
                border: 'none',
                color: '#000',
                fontFamily: 'var(--font-sans)',
                fontWeight: 900,
                fontSize: '0.9rem',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                boxShadow: '0 0 20px rgba(255,0,122,0.4)'
              }}
            >
              CERRAR ESPEJO ➔
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
