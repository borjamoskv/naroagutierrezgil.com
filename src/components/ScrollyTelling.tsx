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
    if (progress < 0.25) return 'brightness(0) grayscale(100%)' // Pizarra
    if (progress < 0.5) return 'brightness(0.3) contrast(200%) grayscale(100%) invert(1)' // Boceto
    if (progress < 0.75) return 'brightness(0.7) contrast(150%) blur(8px) sepia(0.6)' // Mancha base
    return 'brightness(1) contrast(100%) blur(0px) sepia(0)' // Final
  }

  return (
    <section ref={containerRef} className="relative h-[300vh] w-full bg-background z-20 my-20 border-y border-primary/20">
      <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center justify-center overflow-hidden px-6">
        
        <div className="w-full flex justify-center items-center h-[50vh] md:h-screen">
          <div className="relative w-full max-w-4xl aspect-[4/3] md:aspect-video shadow-[0_0_50px_rgba(198,168,124,0.1)]">
            <Image 
              src="https://naroa.online/assets/hq-amy-BRTriASV.webp"
              alt="Proceso Amy"
              fill
              className="object-cover transition-all duration-700 ease-out"
              style={{ filter: getFilters() }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
