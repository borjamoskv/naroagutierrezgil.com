'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function ScrollyTelling() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const totalScroll = rect.height - windowHeight
      const currentScroll = -rect.top
      let p = currentScroll / totalScroll
      p = Math.max(0, Math.min(1, p))
      setProgress(p)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const getFilters = () => {
    if (progress < 0.25) return 'brightness(0.05) grayscale(100%) contrast(150%)' // Pizarra Oscura
    if (progress < 0.5) return 'brightness(0.4) contrast(200%) grayscale(100%) invert(0.8)' // Boceto Espectral
    if (progress < 0.75) return 'brightness(0.6) contrast(150%) blur(4px) sepia(0.8) hue-rotate(-15deg)' // Mancha Base
    return 'brightness(1) contrast(110%) blur(0px) sepia(0)' // Obra Final
  }

  const getStageText = () => {
    if (progress < 0.25) return ['I', 'El Mineral']
    if (progress < 0.5) return ['II', 'La Estructura']
    if (progress < 0.75) return ['III', 'La Materia']
    return ['IV', 'El Alma']
  }

  const [stageNum, stageName] = getStageText()

  return (
    <section ref={containerRef} className="relative h-[400vh] w-full bg-[#050505] z-20 my-20">
      <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center justify-center overflow-hidden px-6">
        
        {/* Typographic Overlay */}
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-8 md:p-16">
          <div className="flex justify-between items-start text-primary/80 font-serif mix-blend-screen transition-all duration-1000">
            <span className="text-4xl md:text-7xl font-light italic opacity-50">{stageNum}</span>
            <span className="text-xl md:text-3xl tracking-[0.2em] uppercase font-light mt-4">{stageName}</span>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="w-[1px] h-32 bg-gradient-to-b from-primary/50 to-transparent" />
          </div>
        </div>

        {/* Cinematic Presentation */}
        <div className="w-full flex justify-center items-center h-[50vh] md:h-screen">
          <div className="relative w-full max-w-5xl aspect-[4/3] md:aspect-video shadow-[0_0_100px_rgba(0,0,0,1)] ring-1 ring-white/5 overflow-hidden rounded-sm">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,168,124,0.15)_0%,transparent_70%)] z-0 mix-blend-screen" />
            
            <Image 
              src="/assets/hq-amy-BRTriASV.webp"
              alt="Proceso Amy"
              fill
              className="object-cover transition-all duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] z-10 scale-[1.02]"
              style={{ filter: getFilters() }}
            />
            
            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(5,5,5,0.8)_100%)] z-20 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  )
}
