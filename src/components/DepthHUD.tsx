'use client'
import { useEffect, useState } from 'react'

export default function DepthHUD() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0
      setScrollProgress(Number(scroll))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const depth = (scrollProgress * 2500).toFixed(0) // Simulating 2500 micrometers of acrylic/slate depth

  return (
    <>
      {/* Neural Microscope Overlay: Noise & contrast increases as we dive into the strata */}
      <div 
        className="fixed inset-0 pointer-events-none z-[100] mix-blend-overlay transition-opacity duration-100 bg-slate-texture"
        style={{ 
          opacity: scrollProgress * 0.9,
          filter: `contrast(${1 + scrollProgress * 1.5}) brightness(${1 - scrollProgress * 0.2})`
        }}
      />

      <div className="fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 z-[200] pointer-events-none hidden md:flex flex-col items-center gap-4 mix-blend-difference text-[#E0E0E0] opacity-70">
        <div className="text-[8px] uppercase tracking-[0.4em] [writing-mode:vertical-rl] rotate-180">
          Profundidad Estrato
        </div>
        
        <div className="h-32 w-[1px] bg-white/20 relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 w-full bg-primary transition-all duration-300 ease-out shadow-[0_0_15px_rgba(43,59,229,0.9)]"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>

        <div className="font-mono text-[10px] tracking-widest flex flex-col items-center">
          <span>-{depth}µm</span>
          {scrollProgress > 0.8 && (
            <span className="text-primary mt-2 text-[6px] animate-pulse font-sans font-bold">NEURAL MACRO</span>
          )}
        </div>
      </div>
    </>
  )
}
