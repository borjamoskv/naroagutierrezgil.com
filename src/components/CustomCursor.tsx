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

    const POP_COLORS = ['var(--cobalt)', 'var(--gold-hi)', 'var(--cobalt-soft)', '#FFD700', '#FFFFFF']

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

      {/* Artist Paintbrush Cursor */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          transition: 'transform 0.05s linear'
        }}
      >
        {/* Paintbrush SVG Icon angled at -35 deg */}
        <div style={{
          transform: hoverType ? 'rotate(-20deg) scale(1.15)' : 'rotate(-35deg) scale(1)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          filter: hoverType 
            ? 'drop-shadow(0 0 12px rgba(43, 59, 229, 0.8)) drop-shadow(0 0 20px rgba(245, 158, 11, 0.6))'
            : 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.7))'
        }}>
          <svg width="42" height="42" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Wooden Handle */}
            <path d="M4 28L12 20L10 18L2 26C1.5 26.5 1.5 27.5 2 28C2.5 28.5 3.5 28.5 4 28Z" fill="url(#woodenHandle)" />
            {/* Silver Ferrule */}
            <path d="M10 18L12 20L17 15L15 13L10 18Z" fill="url(#silverFerrule)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            {/* Dark Hair Bristles */}
            <path d="M15 13L17 15L23 9C25 7 28 5 28 5C28 5 26 8 24 10L18 16L15 13Z" fill="#1C1824" />
            {/* Glowing Acrylic Paint Tip (Magenta / Gold / Cyan) */}
            <path d="M22 8C24 6 28 5 28 5C28 5 27 9 25 11L22 8Z" fill="url(#paintTip)" />
            
            <defs>
              <linearGradient id="woodenHandle" x1="2" y1="28" x2="12" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B4513" />
                <stop offset="0.5" stopColor="#D2691E" />
                <stop offset="1" stopColor="#5C2E0B" />
              </linearGradient>
              <linearGradient id="silverFerrule" x1="10" y1="18" x2="17" y2="13" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E0E0E0" />
                <stop offset="0.5" stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#9E9E9E" />
              </linearGradient>
              <linearGradient id="paintTip" x1="22" y1="8" x2="28" y2="5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2B3BE5" />
                <stop offset="0.6" stopColor="#FFD700" />
                <stop offset="1" stopColor="#8D97FF" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Hover Action Badge Next to Brush */}
        {hoverType && (
          <div style={{
            marginLeft: '28px',
            marginTop: '-10px',
            padding: '4px 10px',
            background: 'rgba(5, 5, 8, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(43, 59, 229, 0.6)',
            borderRadius: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 900,
            color: 'var(--gold-hi)',
            letterSpacing: '0.08em',
            boxShadow: '0 0 15px rgba(43, 59, 229, 0.4)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            🖌️ {cursorText}
          </div>
        )}
      </div>
    </>
  )
}
