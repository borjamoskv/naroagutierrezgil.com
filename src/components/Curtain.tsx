'use client'
import { useEffect, useState } from 'react'

export default function Curtain() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    // 0: Initial black
    // 1: Text appears
    // 2: Dissipation begins (blur + scale)
    // 3: Remove from DOM completely
    const t1 = setTimeout(() => setStage(1), 800)
    const t2 = setTimeout(() => setStage(2), 2600)
    const t3 = setTimeout(() => setStage(3), 5000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); }
  }, [])

  if (stage === 3) return null

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Cinematic Dissipation Veil */}
      <div 
        className={`absolute inset-[-10%] bg-[#0A0A0A] bg-slate-texture transition-all duration-[2.2s] ease-[cubic-bezier(0.76,0,0.24,1)] origin-center ${
          stage >= 2 ? 'scale-110 opacity-0 blur-3xl' : 'scale-100 opacity-100 blur-0'
        }`}
      />
      
      {/* Cinematic Text */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out ${
          stage === 0 ? 'opacity-0 scale-95 blur-md' : 
          stage === 1 ? 'opacity-100 scale-100 blur-0' : 
          'opacity-0 scale-105 blur-xl'
        }`}
      >
        <span className="text-primary font-serif font-light text-xl sm:text-2xl tracking-[0.4em] uppercase text-center px-4">
          Acrílico sobre Piedra
        </span>
      </div>
    </div>
  )
}
