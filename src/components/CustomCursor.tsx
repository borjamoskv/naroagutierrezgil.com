import React, { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isArtwork, setIsArtwork] = useState(false)
  const [cursorText, setCursorText] = useState('')
  const [particles, setParticles] = useState([])
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  const springConfig = { damping: 25, stiffness: 400 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)

      const target = e.target
      const isClickable = target.closest('a, button, [role="button"], input, textarea, select')
      const isArt = target.closest('.gallery-massive__item, .artwork-clickable')
      
      if (isArt) {
        setIsArtwork(true)
        setCursorText('VER')
        setIsHovering(false)
      } else if (isClickable) {
        setIsHovering(true)
        setIsArtwork(false)
        setCursorText('')
      } else {
        setIsHovering(false)
        setIsArtwork(false)
        setCursorText('')
      }
    }

    const handleMouseDown = () => {
      if (isHovering || isArtwork) {
        // Spawn particles
        const newParticles = Array.from({ length: 8 }).map((_, i) => ({
          id: Date.now() + i,
          x: cursorX.get(),
          y: cursorY.get(),
          angle: (i / 8) * Math.PI * 2,
          velocity: 2 + Math.random() * 3
        }))
        setParticles(prev => [...prev, ...newParticles])
        
        // Cleanup particles after animation
        setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)))
        }, 1000)
      }
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [cursorX, cursorY, isHovering, isArtwork])

  return (
    <>
      <motion.div
        className="custom-cursor"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference'
        }}
      >
        <div style={{
          width: isHovering ? '48px' : isArtwork ? '80px' : '12px',
          height: isHovering ? '48px' : isArtwork ? '80px' : '12px',
          backgroundColor: isArtwork ? 'rgba(255, 255, 255, 0.9)' : '#FFFFFF',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'width 0.3s, height 0.3s, background-color 0.3s',
          border: isArtwork ? '1px solid rgba(0,0,0,0.1)' : 'none'
        }}>
          {cursorText && (
            <span style={{
              color: '#000',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: 'Share Tech Mono, monospace'
            }}>
              {cursorText}
            </span>
          )}
        </div>
      </motion.div>

      {/* Particle Burst */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
          animate={{
            x: p.x + Math.cos(p.angle) * 50 * p.velocity,
            y: p.y + Math.sin(p.angle) * 50 * p.velocity,
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '4px',
            height: '4px',
            backgroundColor: '#F59E0B',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9998,
            boxShadow: '0 0 10px #F59E0B'
          }}
        />
      ))}
    </>
  )
}
