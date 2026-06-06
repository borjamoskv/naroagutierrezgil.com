'use client'
import { useEffect, useState } from 'react'

export default function DepthHUD() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scroll = `${totalScroll / windowHeight}`
      setScrollProgress(Number(scroll))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const depth = (scrollProgress * 2500).toFixed(0) // Simulating 2500 micrometers of acrylic/slate depth

  return (
    <div className="fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 z-[200] pointer-events-none hidden md:flex flex-col items-center gap-4 mix-blend-difference text-primary opacity-60">
      <div className="text-[8px] uppercase tracking-[0.4em] [writing-mode:vertical-rl] rotate-180">
        Profundidad
      </div>
      
      <div className="h-32 w-[1px] bg-foreground/20 relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full bg-primary transition-all duration-300 ease-out"
          style={{ height: `${scrollProgress * 100}%` }}
        />
      </div>

      <div className="font-mono text-[10px] tracking-widest text-foreground">
        -{depth}µm
      </div>
    </div>
  )
}
