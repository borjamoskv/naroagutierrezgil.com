'use client'
import { useEffect, useState, useRef } from 'react'

export default function HeroFluid() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 })
  const targetPos = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    // Initial center position so it doesn't pop in from 0,0
    const initialX = window.innerWidth / 2
    const initialY = window.innerHeight / 2
    setPos({ x: initialX, y: initialY })
    targetPos.current = { x: initialX, y: initialY }

    const handleMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMove)
    
    let animationFrameId: number
    const loop = () => {
      setPos(prev => {
        const dx = targetPos.current.x - prev.x
        const dy = targetPos.current.y - prev.y
        // Only trigger state updates if we actually need to animate to save CPU
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
          animationFrameId = requestAnimationFrame(loop)
          return prev
        }
        return {
          x: prev.x + dx * 0.03,
          y: prev.y + dy * 0.03
        }
      })
      animationFrameId = requestAnimationFrame(loop)
    }
    loop()
    
    return () => {
      window.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 mix-blend-screen z-0">
      <div 
        className="absolute w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] will-change-transform"
        style={{
          transform: `translate3d(${pos.x - 300}px, ${pos.y - 300}px, 0)`
        }}
      />
      <div 
        className="absolute w-[900px] h-[900px] bg-[#141416]/70 rounded-full blur-[120px] will-change-transform"
        style={{
          transform: `translate3d(${pos.x * 0.8 - 450}px, ${pos.y * 0.8 - 450}px, 0)`
        }}
      />
    </div>
  )
}
