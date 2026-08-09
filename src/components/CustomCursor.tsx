import { useEffect, useState, useRef } from 'react'

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [trailPosition, setTrailPosition] = useState({ x: -100, y: -100 })
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e
      setPosition({ x, y })
      if (!isVisible) setIsVisible(true)

      const target = e.target as HTMLElement
      const isClickable =
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.classList.contains('gigantic-artwork-card')

      setIsPointer(isClickable)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isVisible])

  // Smooth lerp trailing animation for the outer ring
  useEffect(() => {
    const loop = () => {
      setTrailPosition((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.18,
        y: prev.y + (position.y - prev.y) * 0.18,
      }))
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [position])

  if (!isVisible) return null

  return (
    <>
      {/* Central High-Intensity Mineral Dot */}
      <div
        style={{
          position: 'fixed',
          top: position.y,
          left: position.x,
          width: isPointer ? '10px' : '6px',
          height: isPointer ? '10px' : '6px',
          backgroundColor: isPointer ? '#D4AF37' : '#ffffff',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 999999,
          boxShadow: isPointer ? '0 0 12px #D4AF37, 0 0 24px #2B3BE5' : '0 0 8px rgba(255,255,255,0.8)',
          transition: 'width 0.2s ease, height 0.2s ease, background-color 0.2s ease',
        }}
      />

      {/* Trailing Outer Kinetic Ring with Gold / Cobalt Accent */}
      <div
        style={{
          position: 'fixed',
          top: trailPosition.y,
          left: trailPosition.x,
          width: isPointer ? '54px' : '32px',
          height: isPointer ? '54px' : '32px',
          border: isPointer ? '1.5px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.3)',
          background: isPointer ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 999998,
          backdropFilter: isPointer ? 'blur(2px)' : 'none',
          boxShadow: isPointer ? '0 0 20px rgba(212, 175, 55, 0.25)' : 'none',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, background 0.25s ease',
        }}
      />
    </>
  )
}

