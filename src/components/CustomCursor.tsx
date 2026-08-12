import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface DustParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [hoverType, setHoverType] = useState<'link' | 'artwork' | null>(null)
  const [particles, setParticles] = useState<DustParticle[]>([])
  
  const requestRef = useRef<number | undefined>(undefined)
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const cursorXSpring = useSpring(mouseX, springConfig)
  const cursorYSpring = useSpring(mouseY, springConfig)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)

      const target = e.target as HTMLElement
      if (target.closest('a, button, [role="button"]')) {
        setHoverType('link')
      } else if (target.closest('.gallery-massive__item, .artwork-clickable, .hero-immersive__image-wrapper')) {
        setHoverType('artwork')
      } else {
        setHoverType(null)
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      // Spawn gold dust particles on click
      const newParticles: DustParticle[] = []
      for (let i = 0; i < 12; i++) {
        newParticles.push({
          id: Date.now() + i,
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 1,
          color: Math.random() > 0.5 ? '#F59E0B' : '#FFD700'
        })
      }
      setParticles(prev => [...prev, ...newParticles])
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [mouseX, mouseY])

  // Particle animation loop
  useEffect(() => {
    const updateParticles = () => {
      setParticles(prev => {
        if (prev.length === 0) return prev
        return prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2, // gravity
            life: p.life - 0.02
          }))
          .filter(p => p.life > 0)
      })
      requestRef.current = requestAnimationFrame(updateParticles)
    }
    requestRef.current = requestAnimationFrame(updateParticles)
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [])

  return (
    <>
      <motion.div
        ref={cursorRef}
        className="custom-cursor"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%'
        }}
      >
        <div
          className={`custom-cursor-inner ${hoverType ? `hovering-${hoverType}` : ''}`}
          style={{
            width: hoverType === 'artwork' ? '80px' : hoverType === 'link' ? '48px' : '24px',
            height: hoverType === 'artwork' ? '80px' : hoverType === 'link' ? '48px' : '24px',
            borderRadius: '50%',
            background: hoverType === 'artwork' ? 'rgba(43, 59, 229, 0.15)' : hoverType === 'link' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.1)',
            border: `2px solid ${hoverType === 'artwork' ? 'var(--cobalt)' : hoverType === 'link' ? 'var(--gold)' : 'rgba(255,255,255,0.5)'}`,
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: hoverType 
              ? 'drop-shadow(0 0 12px rgba(43, 59, 229, 0.4))' 
              : 'none'
          }}
        >
          {hoverType === 'artwork' && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'var(--cobalt-soft)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              VER
            </span>
          )}
          {hoverType === 'link' && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'var(--gold-hi)',
              letterSpacing: '0.1em'
            }}>
              →
            </span>
          )}
        </div>
      </motion.div>

      {/* Gold Dust Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: p.x,
            top: p.y,
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: p.color,
            opacity: p.life,
            pointerEvents: 'none',
            zIndex: 9998,
            boxShadow: `0 0 8px ${p.color}`
          }}
        />
      ))}
    </>
  )
}
