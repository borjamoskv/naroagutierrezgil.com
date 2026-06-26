'use client';

import Image from 'next/image';

import { AlcoveId, alcoveTabs, alcoveData } from '@/data/alcoves';

interface AlcoveSystemProps {
  activeAlcove: AlcoveId;
  setActiveAlcove: (id: AlcoveId) => void;
  resolveSrc: (src: string) => string;
}

export default function AlcoveSystem({ activeAlcove, setActiveAlcove, resolveSrc }: AlcoveSystemProps) {
  const data = alcoveData[activeAlcove];

  return (
    <section id="alcobas" className="relative z-10 px-6 sm:px-12 py-32 bg-black/60 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
          <div>
            <span className="text-[#2B3BE5] font-mono tracking-[0.4em] text-[9px] uppercase block mb-3">
              Yacimientos del Retrato
            </span>
            <h2 className="text-3xl sm:text-5xl font-brutal-title text-white">
              Materia & Fisura
            </h2>
          </div>
          <p className="max-w-md text-white/40 font-sans text-xs tracking-wider leading-relaxed">
            Explore los 6 pilares constructivos donde la técnica mixta y el soporte de pizarra desafían los límites bidimensionales de la pintura.
          </p>
        </div>

        {/* Alcove tabs */}
        <div className="flex justify-center gap-12 mb-16 border-b border-white/5 pb-6">
          {alcoveTabs.map(alcove => (
            <button
              key={alcove.id}
              onClick={() => setActiveAlcove(alcove.id as AlcoveId)}
              className={`py-2 cursor-pointer transition-all duration-500 font-serif text-lg tracking-widest ${
                activeAlcove === alcove.id
                  ? 'text-white border-b border-[#2B3BE5] scale-125 font-bold'
                  : 'text-white/30 hover:text-white/60 border-b border-transparent'
              }`}
            >
              {alcove.num}
            </button>
          ))}
        </div>

        {/* Active Alcove Content Card (Widescreen Monumental Display) */}
        <div className="w-full relative bg-neutral-950/80 border border-white/5 rounded-sm overflow-hidden group shadow-2xl aspect-[16/9] md:aspect-[21/9]">
          <Image
            src={resolveSrc(data.image)}
            alt={data.title}
            fill
            sizes="100vw"
            quality={95}
            className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
          />

          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none transition-all duration-700 group-hover:from-black/95" />
          
          {/* Subtle kinetic grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

          {/* Minimal Hover HUD overlay (Reveals text info only when hovered) */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-black/60 backdrop-blur-[3px] pointer-events-none">
            <span className="text-[#2B3BE5] font-mono text-[9px] tracking-[0.5em] uppercase mb-3">
              Universo {data.universeNum} / {data.material}
            </span>
            <h3 className="text-2xl sm:text-4xl font-serif font-light text-white uppercase tracking-wider mb-4">
              {data.title}
            </h3>
            <p className="text-white/60 font-sans text-xs tracking-wider max-w-xl leading-relaxed">
              {data.description}
            </p>
          </div>

          {/* Quick HUD overlay in bottom-right (Static, always visible to indicate active universe) */}
          <div className="absolute bottom-6 right-6 bg-black/85 border border-white/10 px-4 py-2 font-mono text-[9px] tracking-[0.4em] text-white uppercase pointer-events-none">
            [ U-{data.universeNum} ]
          </div>
        </div>

      </div>
    </section>
  );
}
