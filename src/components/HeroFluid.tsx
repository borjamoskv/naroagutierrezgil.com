'use client'
import { useEffect, useRef } from 'react'

export default function HeroFluid() {
  const blob1Ref = useRef<HTMLDivElement>(null)
  const blob2Ref = useRef<HTMLDivElement>(null)
  
  const currentPos = useRef({ x: -1000, y: -1000 })
  const targetPos = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    // Initial center position so it doesn't pop in from 0,0
    const initialX = window.innerWidth / 2
    const initialY = window.innerHeight / 2
    currentPos.current = { x: initialX, y: initialY }
    targetPos.current = { x: initialX, y: initialY }

    const handleMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMove)
    
    let animationFrameId: number
    const loop = () => {
      const dx = targetPos.current.x - currentPos.current.x
      const dy = targetPos.current.y - currentPos.current.y
      
      // Update current pos
      currentPos.current.x += dx * 0.05 // Slightly faster interpolation
      currentPos.current.y += dy * 0.05
      
      // Mutate DOM directly (Zero React re-renders)
      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate3d(${currentPos.current.x - 300}px, ${currentPos.current.y - 300}px, 0)`
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate3d(${currentPos.current.x * 0.8 - 450}px, ${currentPos.current.y * 0.8 - 450}px, 0)`
      }
      
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
        ref={blob1Ref}
        className="absolute w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] will-change-transform"
      />
      <div 
        ref={blob2Ref}
        className="absolute w-[900px] h-[900px] bg-[#141416]/70 rounded-full blur-[120px] will-change-transform"
      />
    </div>
  )
}
