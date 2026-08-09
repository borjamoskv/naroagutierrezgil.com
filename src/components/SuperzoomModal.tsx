import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sound } from '../utils/audio'

interface SuperzoomModalProps {
  imageSrc: string
  title: string
  medium: string
  onClose: () => void
}

export function SuperzoomModal({ imageSrc, title, medium, onClose }: SuperzoomModalProps) {
  const [scale, setScale] = useState(1.8)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    sound.playOpen()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClose()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleZoomIn = () => {
    sound.playTick()
    setScale((prev) => Math.min(prev + 0.6, 5.0))
  }

  const handleZoomOut = () => {
    sound.playTick()
    setScale((prev) => {
      const next = Math.max(prev - 0.6, 1.0)
      if (next === 1.0) setPosition({ x: 0, y: 0 })
      return next
    })
  }

  const handleReset = () => {
    sound.playTick()
    setScale(1.8)
    setPosition({ x: 0, y: 0 })
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.003
    setScale((prev) => {
      const newScale = Math.min(Math.max(prev + delta, 1.0), 5.0)
      if (newScale === 1.0) setPosition({ x: 0, y: 0 })
      return newScale
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1.0) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <AnimatePresence>
      <div
        className="superzoom-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(5, 5, 8, 0.95)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          overflow: 'hidden',
        }}
        onClick={() => {
          sound.playClose()
          onClose()
        }}
      >
        {/* Glassmorphic Header Bar */}
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
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '12px 24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              {title} <span style={{ fontSize: '0.85rem', color: '#D4AF37', fontWeight: 500 }}>— SUPERZOOM HD 4K</span>
            </h3>
            <p style={{ margin: '2px 0 0 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              {medium} · Arrastra para mover o usa la rueda para ampliar textura
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: '#D4AF37',
                background: 'rgba(214, 175, 55, 0.12)',
                border: '1px solid rgba(214, 175, 55, 0.3)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontWeight: 'bold',
              }}
            >
              {Math.round(scale * 100)}% ZOOM
            </div>

            <button
              onClick={handleZoomOut}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Alejar (-)"
            >
              −
            </button>

            <button
              onClick={handleZoomIn}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Acercar (+)"
            >
              +
            </button>

            <button
              onClick={handleReset}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
              }}
              title="Restablecer zoom"
            >
              RESET
            </button>

            <button
              onClick={() => {
                sound.playClose()
                onClose()
              }}
              style={{
                background: 'rgba(255, 69, 58, 0.2)',
                border: '1px solid rgba(255, 69, 58, 0.4)',
                color: '#ff453a',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '8px',
              }}
              title="Cerrar Superzoom (ESC)"
            >
              ✕
            </button>
          </div>
        </motion.div>

        {/* Zoom & Pan Image Canvas */}
        <div
          style={{
            width: '90vw',
            height: '85vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
          onClick={(e) => e.stopPropagation()}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <motion.img
            ref={imageRef}
            src={imageSrc}
            alt={title}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: scale, opacity: 1, x: position.x, y: position.y }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{
              maxHeight: '85vh',
              maxWidth: '85vw',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.2))',
            }}
          />
        </div>
      </div>
    </AnimatePresence>
  )
}
