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
    if (progress < 0.16) return 'brightness(0.05) grayscale(100%) contrast(150%)' // I: Selección de la Pizarra
    if (progress < 0.33) return 'brightness(0.15) contrast(180%) grayscale(80%) sepia(0.2)' // II: Preparación y Sellado
    if (progress < 0.50) return 'brightness(0.3) contrast(200%) grayscale(60%) invert(0.8)' // III: Encaje y Estructura
    if (progress < 0.66) return 'brightness(0.5) contrast(160%) blur(2px) sepia(0.5) hue-rotate(-10deg)' // IV: Texturas y Vetas
    if (progress < 0.83) return 'brightness(0.8) contrast(130%) blur(1px) sepia(0.2) hue-rotate(-5deg)' // V: Resonancia Lumínica
    return 'brightness(1) contrast(110%) blur(0px) sepia(0)' // VI: El Alma
  }

  const getStageText = () => {
    if (progress < 0.16) return ['I', 'Selección de la Pizarra']
    if (progress < 0.33) return ['II', 'Preparación y Sellado']
    if (progress < 0.50) return ['III', 'Encaje y Estructura']
    if (progress < 0.66) return ['IV', 'Texturas y Vetas']
    if (progress < 0.83) return ['V', 'Resonancia Lumínica']
    return ['VI', 'El Alma']
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
