'use client'
import { useEffect, useState } from 'react'

export default function HeroFluid() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 })
  const [targetPos, setTargetPos] = useState({ x: -1000, y: -1000 })

  useEffect(() => {
    // Initial center position so it doesn't pop in from 0,0
    setPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setTargetPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const handleMove = (e: MouseEvent) => {
      setTargetPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMove)
    
    let animationFrameId: number;
    const loop = () => {
      setPos(prev => ({
        x: prev.x + (targetPos.x - prev.x) * 0.03,
        y: prev.y + (targetPos.y - prev.y) * 0.03
      }))
      animationFrameId = requestAnimationFrame(loop)
    }
    loop()
    
    return () => {
      window.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [targetPos])

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
