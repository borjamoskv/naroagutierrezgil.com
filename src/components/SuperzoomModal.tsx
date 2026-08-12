import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function SuperzoomModal({ isOpen, onClose, artwork }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(2)
  const containerRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setZoom(2)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  if (!artwork) return null

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height
    setPosition({ x, y })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            backgroundColor: '#000',
            overflow: 'hidden'
          }}
        >
          <div 
            ref={containerRef}
            style={{ width: '100%', height: '100%', overflow: 'hidden', cursor: 'none' }}
            onMouseMove={handleMouseMove}
            onWheel={(e) => setZoom(Math.min(Math.max(1, zoom - e.deltaY * 0.01), 10))}
          >
            <img 
              src={artwork.src} 
              alt={artwork.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `scale(${zoom})`,
                transformOrigin: `${position.x * 100}% ${position.y * 100}%`,
                transition: 'transform 0.1s ease-out'
              }}
            />
          </div>

          {/* UI Overlay */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10
          }}>
            <button 
              onClick={onClose}
              className="premium-btn"
              style={{ padding: '8px 16px' }}
            >
              Cerrar
            </button>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            color: '#FFF',
            fontFamily: 'Share Tech Mono, monospace',
            background: 'rgba(0,0,0,0.6)',
            padding: '8px 16px',
            borderRadius: '20px',
            pointerEvents: 'none'
          }}>
            Zoom: {zoom.toFixed(1)}x
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
