import React, { useEffect, useState, useRef } from 'react'

interface DustParticle {
  id: number
  x: number
  y: number
  size: number
  vx: number
  vy: number
  color: string
  opacity: number
}

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [hoverType, setHoverType] = useState<'link' | 'artwork' | '3d' | null>(null)
  const [cursorText, setCursorText] = useState<string>('EXPLORAR')
  const [isActive, setIsActive] = useState(false)
  const [particles, setParticles] = useState<DustParticle[]>([])
  
  const requestRef = useRef<number | undefined>(undefined)
  const mousePos = useRef({ x: -100, y: -100 })
  const prevMousePos = useRef({ x: -100, y: -100 })
  const particleId = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const POP_COLORS = ['#FF007A', '#FFE600', '#00F0FF', '#FFD700', '#FFFFFF']

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      if (!isActive) setIsActive(true)

      // Calculate speed for slate chalk dust particle generation
      const dx = mousePos.current.x - prevMousePos.current.x
      const dy = mousePos.current.y - prevMousePos.current.y
      const speed = Math.sqrt(dx * dx + dy * dy)

      if (speed > 4 && Math.random() > 0.4) {
        particleId.current += 1
        const newParticle: DustParticle = {
          id: particleId.current,
          x: e.clientX + (Math.random() * 12 - 6),
          y: e.clientY + (Math.random() * 12 - 6),
          size: Math.random() * 4 + 2,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 + 0.5,
          color: POP_COLORS[Math.floor(Math.random() * POP_COLORS.length)],
          opacity: 0.85
        }
        setParticles(prev => [...prev.slice(-25), newParticle])
      }

      prevMousePos.current = { x: e.clientX, y: e.clientY }
    }

    const updateCursor = () => {
      setPosition(prev => {
        const dx = mousePos.current.x - prev.x
        const dy = mousePos.current.y - prev.y
        return {
          x: prev.x + dx * 0.28,
          y: prev.y + dy * 0.28
        }
      })

      // Decay particles
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            opacity: p.opacity - 0.035
          }))
          .filter(p => p.opacity > 0)
      )

      requestRef.current = requestAnimationFrame(updateCursor)
    }

    const onMouseOver = (e: MouseEvent) => {
      let el = e.target as HTMLElement | null
      let type: 'link' | 'artwork' | '3d' | null = null
      let text = 'EXPLORAR'

      while (el && el !== document.body) {
        if (el.classList.contains('kinetic-card') || el.classList.contains('artwork-item') || el.classList.contains('gallery-massive__item')) {
          type = 'artwork'
          text = 'VER MICA ✦'
          break
        }
        if (el.tagName.toLowerCase() === 'canvas' || el.classList.contains('hero-immersive')) {
          type = '3d'
          text = 'INSPECT 💎'
          break
        }
        if (el.tagName.toLowerCase() === 'a' || el.tagName.toLowerCase() === 'button' || el.classList.contains('pop-badge')) {
          type = 'link'
          text = 'CLICK ⚡'
          break
        }
        el = el.parentElement
      }

      setHoverType(type)
      setCursorText(text)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseover', onMouseOver, { passive: true })

    requestRef.current = requestAnimationFrame(updateCursor)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <>
      {/* Rastro de Polvo de Pizarra / Mica Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity: p.opacity,
              boxShadow: `0 0 8px ${p.color}`,
              transform: 'translate(-50%, -50%)',
              transition: 'opacity 0.1s linear'
            }}
          />
        ))}
      </div>

      {/* Main Kinetic Cursor Ring & Badge */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'width 0.3s ease, height 0.3s ease'
        }}
      >
        <div style={{
          width: hoverType === 'artwork' ? '64px' : hoverType === 'link' ? '48px' : '28px',
          height: hoverType === 'artwork' ? '64px' : hoverType === 'link' ? '48px' : '28px',
          borderRadius: '50%',
          border: hoverType ? '2px solid #FF007A' : '1.5px solid rgba(0, 240, 255, 0.7)',
          backgroundColor: hoverType === 'artwork' ? 'rgba(255, 0, 122, 0.2)' : 'rgba(0, 240, 255, 0.05)',
          boxShadow: hoverType 
            ? '0 0 20px rgba(255, 0, 122, 0.6), 0 0 10px rgba(255, 230, 0, 0.5)' 
            : '0 0 10px rgba(0, 240, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {hoverType && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              fontWeight: 900,
              color: '#FFE600',
              letterSpacing: '0.08em',
              textShadow: '0 0 5px #000'
            }}>
              {cursorText}
            </span>
          )}
        </div>
      </div>
    </>
  )
}

