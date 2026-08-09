import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sound } from '../utils/audio'

interface EspejoDelAlmaModalProps {
  isOpen: boolean
  onClose: () => void
}

export const EspejoDelAlmaModal: React.FC<EspejoDelAlmaModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [permissionError, setPermissionError] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    sound.playMicaShimmer()

    // Request native camera access for real-time local canvas texture reflection
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
            setCameraActive(true)
          }
        })
        .catch(() => {
          setPermissionError(true)
        })
    } else {
      setPermissionError(true)
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
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

          {/* Video / Reflection Canvas */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '520px',
            height: '340px',
            marginTop: '24px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 230, 0, 0.4)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.9)',
            backgroundColor: '#050508'
          }}>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror flip
                filter: 'contrast(1.4) grayscale(0.7) sepia(0.2) brightness(0.9)',
                display: cameraActive ? 'block' : 'none'
              }}
            />

            {!cameraActive && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                background: 'radial-gradient(circle at center, rgba(255,0,122,0.12) 0%, #07070D 100%)'
              }}>
                <span style={{ fontSize: '3rem', marginBottom: '10px' }}>🪞</span>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#FFE600', margin: 0 }}>
                  {permissionError 
                    ? '[REFLEJO SIMULADO PROCESADO LOCALMENTE EN NAVEGADOR]' 
                    : 'INICIALIZANDO REFLEJO LÍTICO...'}
                </p>
              </div>
            )}

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
