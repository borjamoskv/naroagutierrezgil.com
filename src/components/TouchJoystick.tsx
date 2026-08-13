import { useState, useRef, useEffect } from 'react'

interface TouchJoystickProps {
  onMove: (dir: { x: number; y: number }) => void
  onEnd: () => void
}

export function TouchJoystick({ onMove, onEnd }: TouchJoystickProps) {
  const [active, setActive] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const baseRef = useRef<HTMLDivElement>(null)
  const touchIdRef = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return
    const touch = e.changedTouches[0]
    touchIdRef.current = touch.identifier
    setActive(true)
    updateJoystick(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!active || touchIdRef.current === null) return
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY)
        break
      }
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchIdRef.current === null) return
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null
        setActive(false)
        setPosition({ x: 0, y: 0 })
        onEnd()
        break
      }
    }
  }

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!baseRef.current) return
    const rect = baseRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = clientX - centerX
    const dy = clientY - centerY
    const maxRadius = rect.width / 2

    const dist = Math.hypot(dx, dy)
    const angle = Math.atan2(dy, dx)
    const clampedDist = Math.min(dist, maxRadius)

    const posX = Math.cos(angle) * clampedDist
    const posY = Math.sin(angle) * clampedDist

    setPosition({ x: posX, y: posY })

    // Normalizar dirección entre -1 y 1
    onMove({
      x: posX / maxRadius,
      y: posY / maxRadius,
    })
  }

  useEffect(() => {
    const onMoveWindow = (e: TouchEvent) => handleTouchMove(e)
    const onEndWindow = (e: TouchEvent) => handleTouchEnd(e)

    window.addEventListener('touchmove', onMoveWindow, { passive: false })
    window.addEventListener('touchend', onEndWindow)
    window.addEventListener('touchcancel', onEndWindow)

    return () => {
      window.removeEventListener('touchmove', onMoveWindow)
      window.removeEventListener('touchend', onEndWindow)
      window.removeEventListener('touchcancel', onEndWindow)
    }
  }, [active])

  return (
    <div
      ref={baseRef}
      onTouchStart={handleTouchStart}
      style={{
        position: 'fixed',
        bottom: '40px',
        left: '40px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'rgba(5, 5, 12, 0.4)',
        border: '2px solid rgba(212, 175, 55, 0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        boxShadow: '0 0 20px rgba(43, 59, 229, 0.25)',
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #D4AF37 0%, #2B3BE5 100%)',
          boxShadow: '0 0 15px #D4AF37',
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: active ? 'none' : 'transform 0.15s ease-out',
        }}
      />
    </div>
  )
}
