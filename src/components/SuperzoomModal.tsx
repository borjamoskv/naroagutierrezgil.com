import { useState, useEffect, type MouseEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sound } from '../utils/audio'


interface SuperzoomModalProps {
  imageSrc: string
  title: string
  medium: string
  onClose: () => void
}

export function SuperzoomModal({ imageSrc, title, medium, onClose }: SuperzoomModalProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [loupePos, setLoupePos] = useState({ x: 0, y: 0 })
  const [bgPos, setBgPos] = useState({ x: '0%', y: '0%' })
  
  const zoomLevel = 4.5 // 450% Zoom (Gigapixel feel)
  const loupeSize = 350 // Size of the magnifying glass

  useEffect(() => {
    sound.playOpen()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playTick()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleMouseMove = (e: MouseEvent<HTMLImageElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    
    // Position of cursor relative to image
    const x = e.clientX - left
    const y = e.clientY - top
    
    // Position for the loupe circle center
    setLoupePos({
      x: e.clientX,
      y: e.clientY
    })

    // Percentage of cursor position
    const xPercent = (x / width) * 100
    const yPercent = (y / height) * 100
    
    setBgPos({
      x: `${xPercent}%`,
      y: `${yPercent}%`
    })
  }

  return (
    <AnimatePresence>
      <div
        className="superzoom-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(5, 5, 8, 0.98)',
          backdropFilter: 'blur(32px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          overflow: 'hidden',
          cursor: isHovering ? 'none' : 'default' // Hide default cursor when loupe is active
        }}
        onClick={() => {
          sound.playTick()
          onClose()
        }}
      >
        {/* Glassmorphic Header Bar with Literal Quotes */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px 28px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.05em' }}>
              {title} <span style={{ fontSize: '0.85rem', color: '#D4AF37', fontWeight: 600, letterSpacing: '0.1em' }}>— MACRO INSPECTION</span>
            </h3>
            <p style={{ margin: '4px 0 0 0', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
              {medium}
            </p>
          </div>

          {/* Literal Quotes from Naroa */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px'
          }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontSize: '0.9rem' }}>
              "Cada retrato empieza con una conversación."
            </p>
            <p style={{ margin: 0, color: '#D4AF37', fontWeight: 600, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
              RETRATOS CON ALMA, MIMO Y CALMA
            </p>
          </div>
          
          <button
            onClick={() => {
              sound.playTick()
              onClose()
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 69, 58, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            title="Close"
          >
            ✕
          </button>
        </motion.div>

        {/* Base Image Wrapper */}
        <div 
          style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}
        >
          <motion.img
            src={imageSrc}
            alt={title}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              maxHeight: '85vh',
              maxWidth: '85vw',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 20px 80px rgba(0,0,0,0.9)',
              // Base image gets slight optimization
              imageRendering: 'high-quality'
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
            onClick={(e) => e.stopPropagation()}
          />

          {/* The Loupe (Magnifying Glass) */}
          {isHovering && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                pointerEvents: 'none',
                left: loupePos.x - loupeSize / 2,
                top: loupePos.y - loupeSize / 2,
                width: loupeSize,
                height: loupeSize,
                borderRadius: '50%',
                border: '2px solid rgba(212, 175, 55, 0.8)',
                boxShadow: '0 0 0 4px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)',
                backgroundImage: `url(${imageSrc})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: `${bgPos.x} ${bgPos.y}`,
                // Zoom magnitude
                backgroundSize: `${zoomLevel * 100}%`,
                // SOTA Image Enhancement Filters for the Macro view
                imageRendering: 'high-quality',
                filter: 'contrast(1.15) saturate(1.2) brightness(1.05)',
                zIndex: 10001,
              }}
            >
              {/* Crosshair indicator */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '12px',
                height: '12px',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '50%'
              }}/>
            </motion.div>
          )}
        </div>
      </div>
    </AnimatePresence>
  )
}
