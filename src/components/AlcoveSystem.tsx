'use client';

import Image from 'next/image';

type AlcoveId = 'pop' | 'pizarra' | 'poliester' | 'kintsugi' | 'mica' | 'reverso';

interface AlcoveSystemProps {
  activeAlcove: AlcoveId;
  setActiveAlcove: (id: AlcoveId) => void;
  resolveSrc: (src: string) => string;
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
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-16 border-b border-white/5 pb-4">
          {alcoveTabs.map(alcove => (
            <button
              key={alcove.id}
              onClick={() => setActiveAlcove(alcove.id as AlcoveId)}
              className={`flex flex-col items-center py-4 border-b-2 cursor-pointer transition-all duration-300 ${
                activeAlcove === alcove.id
                  ? 'border-[#2B3BE5] text-white'
                  : 'border-transparent text-white/30 hover:text-white/60'
              }`}
            >
              <span className="font-serif text-xs mb-1 opacity-65">{alcove.num}</span>
              <span className="font-sans text-[9px] tracking-widest uppercase text-center block leading-normal">
                {alcove.label}
              </span>
            </button>
          ))}
        </div>

        {/* Active Alcove Content Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Description Column */}
          <div className="lg:col-span-5 flex flex-col">
            <span className="text-[#2B3BE5] font-mono text-[9px] tracking-widest uppercase mb-4">
              Arqueología Lítica // Universo {data.universeNum}
            </span>

            <h3 className="text-3xl sm:text-4xl font-serif font-light text-white uppercase tracking-wider mb-6">
              {data.title}
            </h3>

            <p className="text-white/70 font-sans text-sm leading-relaxed mb-8">
              {data.description}
            </p>

            {/* Technical Specifications list */}
            <div className="border-t border-white/10 pt-6">
              <span className="text-white/30 font-mono text-[9px] tracking-widest uppercase block mb-3">
                Especificaciones Técnicas
              </span>
              <ul className="grid grid-cols-2 gap-y-4 gap-x-8 font-mono text-[10px] text-white/50">
                <li>
                  <span className="text-white/30 block mb-1">Materia Prima</span>
                  <span className="text-white">{data.material}</span>
                </li>
                <li>
                  <span className="text-white/30 block mb-1">Fricción Física</span>
                  <span className="text-white">{data.friction}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Display Column */}
          <div className="lg:col-span-7 flex justify-center relative">
            <div className="w-full max-w-lg aspect-[4/5] relative bg-neutral-950/80 border border-white/5 rounded-sm overflow-hidden group shadow-2xl">
              <Image
                src={resolveSrc(data.image)}
                alt="Muestra de la técnica de Naroa"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={95}
                className="object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-105"
              />

              {/* Visual frame overlay */}
              <div className="absolute inset-0 border-[12px] border-black/40 pointer-events-none" />

              {/* Quick Info tag */}
              <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md px-4 py-2 border border-white/10 text-[9px] font-mono tracking-widest text-white uppercase">
                [ Muestra Universo {activeAlcove.toUpperCase()} ]
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
