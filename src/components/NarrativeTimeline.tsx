'use client'

import React, { useRef, useEffect, useState } from 'react'

interface TimelineEvent {
  year: string
  title: string
  location: string
  description: string
}

const events: TimelineEvent[] = [
  {
    year: '2006',
    title: 'Raíces Escénicas',
    location: 'Teatro Arriaga, Bilbao',
    description: 'Participación en el grupo de teatro Encrucijada. El inicio de la fascinación por la máscara, la teatralidad en el retrato y el concepto del "primer disfraz".'
  },
  {
    year: '2010',
    title: 'Espejos del Alma (I)',
    location: 'Espacio de Arte Hegoak, Bilbao',
    description: 'Muestra fundacional centrada en la introspección facial y la mirada como puente psicológico.'
  },
  {
    year: '2014',
    title: 'Facefood',
    location: 'Casa de Cultura Goñi Portal, Plentzia',
    description: 'Fusión de técnicas tradicionales y formatos ilustrativos.'
  },
  {
    year: '2015',
    title: 'Arima Islak',
    location: 'Colegio de Abogados de Bizkaia',
    description: 'Consolidación estética. Acrílicos combinados en soportes mixtos: lienzo, madera, papel y metal.'
  },
  {
    year: '2020',
    title: 'Akelarre',
    location: 'Sarean, Bilbao',
    description: 'Co-exhibición con el colectivo feminista y multicultural Bwall Collective.'
  },
  {
    year: '2022',
    title: 'Repóker de Reinas',
    location: 'Siarte Leku, Bilbao',
    description: 'Cinco retratos de gran carga psicológica bajo una estética hiperrealista POP.'
  },
  {
    year: '2026',
    title: 'DiviNos VaiVenes',
    location: 'Politena Espacio de Arte, Bilbao',
    description: 'Fusión conceptual de iconos globales ("DiviNos") y laberintos de espejos con polaridades complementarias ("Vaivenes"). Nivel de Realidad: C5-REAL.'
  }
]

export default function NarrativeTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const progress = -rect.top / (rect.height - windowHeight)
      
      if (progress >= 0 && progress <= 1) {
        const index = Math.floor(progress * events.length)
        setActiveIdx(Math.min(index, events.length - 1))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={containerRef} className="relative w-full bg-[#030303] text-[#E0E0E0] h-[300vh] z-10 font-sans border-t border-white/5">
      <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center justify-center overflow-hidden">
        
        {/* Background OSINT texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] select-none text-justify flex flex-wrap gap-2 overflow-hidden text-[0.4rem] leading-none text-white font-mono z-0 mix-blend-screen">
          {Array.from({ length: 200 }).map((_, i) => (
            <span key={i}>OSINT-TRACK-{events[activeIdx]?.year}-{Math.random().toString(36).substring(7)} </span>
          ))}
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row h-full">
          
          {/* Left: Titles & Context */}
          <div className="w-full md:w-1/2 flex flex-col justify-center h-[50vh] md:h-full relative">
            <h2 className="text-[0.65rem] md:text-xs tracking-[0.4em] uppercase font-mono opacity-50 mb-8 border-l border-white/20 pl-4">
              Dossier Forense / Registro Cronológico
            </h2>
            <div className="relative h-[250px] md:h-[300px]">
              {events.map((ev, i) => (
                <div 
                  key={i} 
                  className={`absolute inset-0 flex flex-col transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                    i === activeIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
                  }`}
                >
                  <h3 className="text-6xl md:text-8xl font-light tracking-tighter mb-2 text-[#fff]">{ev.year}</h3>
                  <h4 className="text-2xl md:text-4xl font-light uppercase tracking-widest text-[#bbb] mb-4">{ev.title}</h4>
                  <p className="text-[0.6rem] md:text-xs tracking-[0.2em] font-mono text-[#666] uppercase mb-4">{ev.location}</p>
                  <p className="text-sm md:text-base leading-relaxed opacity-60 max-w-md font-light">{ev.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual Progression / Timeline Graphic */}
          <div className="w-full md:w-1/2 flex items-center justify-start md:justify-end h-[50vh] md:h-full pb-20 md:pb-0">
            <div className="relative flex flex-col items-start md:items-end gap-6 md:gap-10 border-l md:border-l-0 md:border-r border-white/10 pl-6 md:pl-0 md:pr-6">
              {events.map((ev, i) => {
                const isActive = i === activeIdx
                const isPast = i < activeIdx
                return (
                  <div key={i} className="flex items-center gap-4 transition-all duration-500 relative">
                    {/* Active dot indicator for mobile */}
                    <div className={`absolute -left-[27px] md:hidden w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isActive ? 'bg-white' : 'bg-transparent'}`} />
                    
                    <span className={`text-[0.6rem] md:text-xs font-mono tracking-[0.2em] transition-opacity duration-500 hidden md:block ${isActive ? 'opacity-100 text-white' : 'opacity-30 text-[#666]'}`}>
                      {ev.year}
                    </span>
                    <div 
                      className={`h-[1px] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                        isActive ? 'w-16 md:w-48 bg-white' : isPast ? 'w-8 md:w-24 bg-white/20' : 'w-4 md:w-8 bg-white/10'
                      }`}
                    />
                    <span className={`text-[0.6rem] md:text-xs font-mono tracking-[0.2em] transition-opacity duration-500 md:hidden ${isActive ? 'opacity-100 text-white' : 'opacity-30 text-[#666]'}`}>
                      {ev.year}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
