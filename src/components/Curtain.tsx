'use client'
import { useEffect, useState } from 'react'

export default function Curtain() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    // 0: Initial black
    // 1: Text appears
    // 2: Curtains split
    // 3: Remove from DOM completely
    const t1 = setTimeout(() => setStage(1), 800)
    const t2 = setTimeout(() => setStage(2), 2200)
    const t3 = setTimeout(() => setStage(3), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); }
  }, [])

  if (stage === 3) return null

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex">
      {/* Left Curtain */}
      <div 
        className={`w-1/2 h-full bg-[#0a0a0c] border-r border-[#1a1a1c] transition-transform duration-[1.5s] ease-[cubic-bezier(0.76,0,0.24,1)] ${stage >= 2 ? '-translate-x-full' : 'translate-x-0'}`}
      />
      {/* Right Curtain */}
      <div 
        className={`w-1/2 h-full bg-[#0a0a0c] border-l border-[#1a1a1c] transition-transform duration-[1.5s] ease-[cubic-bezier(0.76,0,0.24,1)] ${stage >= 2 ? 'translate-x-full' : 'translate-x-0'}`}
      />
      
      {/* Cinematic Text */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${stage === 1 ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-primary font-serif font-light text-xl sm:text-2xl tracking-[0.3em] uppercase">Acrílico sobre Piedra</span>
      </div>
    </div>
  )
}
