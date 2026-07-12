'use client';

import Image from 'next/image';

type AlcoveId = 'pop' | 'pizarra' | 'poliester' | 'kintsugi' | 'mica' | 'reverso';

interface AlcoveSystemProps {
  activeAlcove: AlcoveId;
  setActiveAlcove: (id: AlcoveId) => void;
  resolveSrc: (src: string) => string;
  onExpand?: (artwork: { src: string; title: string; category?: string; desc?: string }) => void;
}

const alcoveTabs = [
  { id: 'pop', num: 'I', label: 'El Retrato Pop' },
  { id: 'pizarra', num: 'II', label: 'Pizarra Centenaria' },
  { id: 'poliester', num: 'III', label: 'Poliéster Translúcido' },
  { id: 'kintsugi', num: 'IV', label: 'Kintsugi Accidental' },
  { id: 'mica', num: 'V', label: 'Mica & Cerámica' },
  { id: 'reverso', num: 'VI', label: 'El Reverso Acústico' },
] as const;

const alcoveData: Record<AlcoveId, { universeNum: string; title: string; description: string; material: string; friction: string; image: string }> = {
  pop: {
    universeNum: 'I',
    title: 'El Retrato Pop Monumental',
    description: 'La cara no es una similitud física; es una máscara emocional. Rostros icónicos del cine y de la música se plasman sobre un soporte indómito, logrando una confrontación de alta fidelidad entre la saturación del acrílico y la aspereza del basalto.',
    material: 'Acrílico & Basalto',
    friction: 'Grosor 2cm a 4cm',
    image: 'james-new.webp',
  },
  pizarra: {
    universeNum: 'II',
    title: 'La Pizarra de Tejado Vasco',
    description: 'Material recuperado directamente de derribos de tejados tradicionales en Bilbao. Sometidas a cortes geográficos, sellado con resina epoxi de brillo espejo y rematadas con bordes rotos, las pizarras representan el concepto de refugio, hogar y dureza ancestral.',
    material: 'Pizarra Vasco-Lítica',
    friction: 'Corte Rústico Manual',
    image: '601340023_1552126202933462_7815927344957967258_n.webp',
  },
  poliester: {
    universeNum: 'III',
    title: 'El Papel Poliéster Translúcido',
    description: 'Un laboratorio químico de tintas diluidas con agua de colonia. Los trazos disueltos sobre poliéster translúcido crean siluetas orgánicas flotantes, semejantes a radiografías de huesos o fluidos en tensión lumínica.',
    material: 'Tinta y Poliéster',
    friction: 'Sin Fricción (Líquido)',
    image: '612329591_1571120784367337_8798688892093004057_n.webp',
  },
  kintsugi: {
    universeNum: 'IV',
    title: 'Kintsugi Accidental & Costras',
    description: 'Nacido por un error en pandemia mezclando cola blanca barata y acrílico. La costra del lienzo se resquebraja al secarse. En lugar de descartarlo, la artista raspa la herida y la rellena con barnices de oro, transformando la falla física en una veta de luz.',
    material: 'Cola, Acrílico & Oro',
    friction: 'Fractura Termodinámica',
    image: 'lagrimas-de-oro-DikHc-Tk.webp',
  },
  mica: {
    universeNum: 'V',
    title: 'La Mica Mineral y los Ojos de Cristal',
    description: 'Escamas de mica mineral encoladas que reflejan destellos aleatorios según el punto de vista del espectador. Se complementa con las pupilas del retrato, pintadas en capas cerámicas 3D aplicadas con palillo de dientes para lograr un relieve ocular realista.',
    material: 'Mica, Barniz de Vidrio',
    friction: 'Escamas Cristalizadas',
    image: 'el-gran-dakari-C1tAWAhR.webp',
  },
  reverso: {
    universeNum: 'VI',
    title: 'El Reverso del Lienzo y la Acústica',
    description: 'El lienzo físico guarda secretos en su reverso: cartas escritas por el retratado, códigos QR que reproducen el paisaje acústico electrónico compuesto especialmente por el productor Borja Moskv, y el alter ego masculino "Aaron".',
    material: 'QR & Ledger Criptográfico',
    friction: 'Flujo Dual Reverso',
    image: 'naroa-portrait-new.webp',
  },
};

export default function AlcoveSystem({ activeAlcove, setActiveAlcove, resolveSrc, onExpand }: AlcoveSystemProps) {
  const data = alcoveData[activeAlcove];

  return (
    <section id="alcobas" className="relative z-10 px-0 sm:px-12 py-32 bg-black border-t border-white/5 overflow-hidden">
      <div className="max-w-[100rem] mx-auto w-full">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20 px-6 sm:px-0">
          <div>
            <span className="text-[var(--primary)] font-mono tracking-[0.5em] text-[10px] uppercase block mb-4 border-l-2 border-[var(--primary)] pl-4">
              Yacimientos del Retrato
            </span>
            <h2 className="text-4xl sm:text-7xl font-sans font-black text-white uppercase tracking-tighter leading-none mix-blend-difference">
              Materia <br/> & Fisura
            </h2>
          </div>
          <p className="max-w-md text-white/50 font-mono text-xs tracking-widest leading-relaxed border-t border-white/10 pt-4">
            Explore los 6 pilares constructivos donde la técnica mixta y el soporte de pizarra desafían los límites bidimensionales de la pintura contemporánea.
          </p>
        </div>

        {/* Alcove tabs - Brutalist Navigation */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-12 mb-16 px-6 sm:px-0">
          {alcoveTabs.map(alcove => (
            <button
              key={alcove.id}
              onClick={() => setActiveAlcove(alcove.id as AlcoveId)}
              className={`relative py-2 sm:py-4 cursor-pointer transition-all duration-500 font-mono text-sm sm:text-lg tracking-[0.3em] overflow-hidden group ${
                activeAlcove === alcove.id
                  ? 'text-white font-bold'
                  : 'text-white/30 hover:text-white/80'
              }`}
            >
              <span className="relative z-10">{alcove.num}</span>
              {/* Animated underline */}
              <div className={`absolute bottom-0 left-0 h-[2px] bg-[var(--primary)] transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                activeAlcove === alcove.id ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </button>
          ))}
        </div>

        {/* Active Alcove Content Card (Widescreen Monumental Display) */}
        <div className="w-full relative bg-neutral-950 border-y sm:border border-white/10 overflow-hidden group shadow-2xl aspect-[4/5] sm:aspect-[21/9]">
          
          <Image
            src={resolveSrc(data.image)}
            alt={data.title}
            fill
            sizes="100vw"
            quality={100}
            className="object-cover transition-transform duration-[6s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.20] filter contrast-125 saturate-50 group-hover:contrast-150 group-hover:saturate-150"
          />

          {/* CRT Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-50 mix-blend-overlay" />
          
          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none transition-all duration-1000 group-hover:from-black" />

          {/* Colossal Number Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] sm:text-[30vw] font-black text-white/5 font-sans leading-none pointer-events-none mix-blend-overlay transition-transform duration-1000 group-hover:scale-150">
            {data.universeNum}
          </div>

          {/* Minimal Hover HUD overlay (Reveals text info only when hovered) */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-20 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-transparent sm:bg-black/60 sm:backdrop-blur-md pointer-events-none">
            
            <div className="translate-y-0 sm:translate-y-10 group-hover:translate-y-0 transition-transform duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)]">
              <span className="text-[var(--primary)] font-mono text-[10px] tracking-[0.6em] uppercase mb-4 block animate-pulse">
                System: {data.universeNum} // {data.material}
              </span>
              
              <h3 className="text-3xl sm:text-6xl font-sans font-black text-white uppercase tracking-tighter mb-6 leading-none shadow-black drop-shadow-2xl">
                {data.title}
              </h3>
              
              <p className="text-white/80 font-mono text-xs sm:text-sm tracking-wider max-w-2xl leading-relaxed border-l border-[var(--primary)] pl-6 bg-black/40 p-4 backdrop-blur-lg">
                {data.description}
              </p>
            </div>

          </div>

          {/* Quick HUD overlay in bottom-right (Static, always visible to indicate active universe) */}
          <div className="absolute top-6 right-6 sm:bottom-6 sm:top-auto sm:right-6 bg-black border border-white/20 px-6 py-3 font-mono text-[10px] tracking-[0.5em] text-[var(--primary)] uppercase pointer-events-none backdrop-blur-xl">
            [ U-{data.universeNum} ]
          </div>
        </div>

      </div>
    </section>
  );
}

