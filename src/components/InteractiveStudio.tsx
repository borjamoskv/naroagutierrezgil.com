'use client';

import { useState } from 'react';
import ScratchGame from './studio/ScratchGame';
import PuzzleGame from './studio/PuzzleGame';
import MemoryGame from './studio/MemoryGame';

interface Artwork {
  src: string;
  title: string;
}

interface InteractiveStudioProps {
  artworks?: Artwork[];
}

const ARTWORKS = [
  { src: 'hq-james-CjsTrO7r.webp', title: 'James Dean' },
  { src: 'hq-amy-BRTriASV.webp', title: 'Amy Winehouse' },
  { src: 'hq-portrait-1-bV-_WHlX.webp', title: 'Retrato I' },
  { src: 'el-gran-dakari-C1tAWAhR.webp', title: 'El Gran Dakari' },
  { src: 'hq-johnny-5ueL8eU0.webp', title: 'Johnny Depp' },
  { src: 'marilyn-rocks--qPeLHxE.webp', title: 'Marilyn Rocks' },
  { src: 'audrey-hepburn-DbIBTtIp.webp', title: 'Audrey Hepburn' },
  { src: 'geisha-MfRtKWdu.webp', title: 'Geisha' },
  { src: 'lagrimas-de-oro-DikHc-Tk.webp', title: 'Lágrimas de Oro' },
  { src: 'love-DA7L_L5F.webp', title: 'Love' },
  { src: 'la-pensadora-CFHSnMA0.webp', title: 'La Pensadora' }
];

export default function InteractiveStudio({ artworks }: InteractiveStudioProps) {
  const [activeTab, setActiveTab] = useState<'scratch' | 'puzzle' | 'memory'>('scratch');
  const list = artworks || ARTWORKS;

  return (
    <section id="taller-interactivo" className="relative z-10 py-32 px-4 sm:px-12 bg-[#0A0A0A] border-t border-white/5">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-20 text-center flex flex-col items-center">
          <span className="text-primary/70 font-sans tracking-[0.4em] uppercase text-[10px] mb-4 block">
            Pizarra y Alquimia
          </span>
          <h2 className="text-4xl sm:text-6xl font-serif font-light tracking-wide text-foreground uppercase">
            El Taller Interactivo
          </h2>
          <div className="w-px h-12 bg-gradient-to-b from-primary/30 to-transparent mt-8"></div>
          <p className="max-w-2xl text-foreground/50 font-sans text-sm tracking-wide mt-6 leading-relaxed">
            Experimenta de manera lúdica con la obra original de Naroa Gutiérrez Gil. Descubre la textura de la pizarra, recompón retratos fragmentados o empareja los espejos de la identidad.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center gap-2 sm:gap-6 mb-16 border-b border-white/5 pb-6">
          {[
            { id: 'scratch', label: 'Cincelar la Pizarra' },
            { id: 'puzzle', label: 'Rayuela de Retratos' },
            { id: 'memory', label: 'Espejos del Alma' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'scratch' | 'puzzle' | 'memory')}
              className={`px-4 sm:px-8 py-3 rounded-sm font-sans text-[11px] uppercase tracking-[0.2em] transition-all duration-500 relative cursor-pointer ${
                activeTab === tab.id
                  ? 'text-primary border border-primary/30 bg-primary/5 shadow-[0_0_20px_rgba(43,59,229,0.15)]'
                  : 'text-foreground/40 border border-transparent hover:text-foreground/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Game Container */}
        <div className="bg-black rounded-sm ring-1 ring-white/5 shadow-2xl p-6 sm:p-12 min-h-[600px] flex items-center justify-center">
          {activeTab === 'scratch' && <ScratchGame artworks={list} />}
          {activeTab === 'puzzle' && <PuzzleGame artworks={list} />}
          {activeTab === 'memory' && <MemoryGame artworks={list} />}
        </div>
      </div>
    </section>
  );
}
