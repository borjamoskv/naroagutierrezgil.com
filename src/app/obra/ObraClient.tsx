'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GlobalNavigation from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import HeroFluid from '@/components/HeroFluid';
import ScrollReveal from '@/components/ScrollReveal';
import AlcoveSystem from '@/components/AlcoveSystem';
import LuxuryArtworkViewer from '@/components/LuxuryArtworkViewer';
import TakeoverModal from '@/components/TakeoverModal';
import useLenis from '@/hooks/useLenis';

interface Artwork {
  id: string;
  title: string;
  category: 'pop' | 'pizarra' | 'poliester' | 'kintsugi' | 'mica' | 'reverso';
  material: string;
  year: string;
  src: string;
  desc: string;
}

const ALL_ARTWORKS: Artwork[] = [
  {
    id: 'james',
    title: 'James Dean',
    category: 'pizarra',
    material: 'Pizarra de Tejado Vasco',
    year: '2026',
    src: '/assets/james-new.webp',
    desc: 'Retrato hiperrealista pop sobre pizarra centenaria de tejado vasco recuperada de derribos históricos en Bilbao.',
  },
  {
    id: 'cantinflas',
    title: 'Cantinflas Kintsugi',
    category: 'kintsugi',
    material: 'Kintsugi Accidental & Acrílico',
    year: '2026',
    src: '/assets/cantinflas-kintsugi.webp',
    desc: 'Mezcla de cola blanca y acrílico resquebrajada naturalmente y rellenada con polvo de oro de 24k.',
  },
  {
    id: 'dakari',
    title: 'El Gran Dakari',
    category: 'pop',
    material: 'Pizarra Vasco-Pop',
    year: '2026',
    src: '/assets/el-gran-dakari-C1tAWAhR.webp',
    desc: 'Mirada en alta saturación cobalto cincelada sobre corte rústico de losa basalto.',
  },
  {
    id: 'audre',
    title: 'AUDRE...',
    category: 'pizarra',
    material: 'Acrílico & Basalto Liso',
    year: '2026',
    src: '/assets/audrey-hepburn-DbIBTtIp.webp',
    desc: 'Captura iconográfica de la elegancia clásica con texturas minerales y acabado satinado.',
  },
  {
    id: 'marilyn',
    title: 'Marilyn Rocks',
    category: 'pop',
    material: 'Pizarra & Mica Mineral',
    year: '2026',
    src: '/assets/marilyn-rocks--qPeLHxE.webp',
    desc: 'Retrato pop con escamas de mica encoladas que reflejan destellos cambiantes bajo luz natural.',
  },
  {
    id: 'la_famiglia',
    title: 'La Famiglia',
    category: 'pop',
    material: 'Pizarra & Encargo Especial',
    year: '2026',
    src: '/assets/la_famiglia_1783824320607.webp',
    desc: 'Retrato colectivo personalizado con estética vintage y técnica mixta sobre piedra geológica.',
  },
  {
    id: 'amy',
    title: 'DiviNos Amy',
    category: 'mica',
    material: 'Mica & Cerámica 3D',
    year: '2026',
    src: '/assets/divinos-amy-Celol3XJ.webp',
    desc: 'Pupilas tridimensionales con barniz cerámico aplicado con palillo y brillo mineral profundo.',
  },
  {
    id: 'freddie',
    title: 'Mr. Fahrenheit (Freddie)',
    category: 'kintsugi',
    material: 'Relieve Mineral & Oro',
    year: '2026',
    src: '/assets/mr-fahrenheit-BzcoVisa.webp',
    desc: 'Fuerza escénica plasmada en texturas volcánicas con filamentos dorados.',
  },
  {
    id: 'geisha',
    title: 'Geisha en Tensión',
    category: 'poliester',
    material: 'Papel Poliéster & Colonia',
    year: '2026',
    src: '/assets/geisha-MfRtKWdu.webp',
    desc: 'Tintas disueltas con agua de colonia sobre poliéster translúcido creando capas flotantes tipo radiografía.',
  },
  {
    id: 'celia',
    title: 'Celia Cruz Cantinflowers',
    category: 'kintsugi',
    material: 'Técnica Mixta & Resina',
    year: '2026',
    src: '/assets/celia-cruz-cantinflowers-DO-SRKMB.webp',
    desc: 'Vibración de color sobre fisuras sanadas con barniz cerámico y destellos dorados.',
  },
];

export default function ObraClient() {
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [activeAlcove, setActiveAlcove] = useState<'pop' | 'pizarra' | 'poliester' | 'kintsugi' | 'mica' | 'reverso'>('pop');
  const [modalArtwork, setModalArtwork] = useState<{ src: string; title: string; category?: string; desc?: string } | null>(null);

  useLenis();

  const filteredArtworks = selectedFilter === 'todos'
    ? ALL_ARTWORKS
    : ALL_ARTWORKS.filter(a => a.category === selectedFilter);

  const getImageUrl = (src: string) => src;

  return (
    <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" />
        <HeroFluid />
      </div>

      <GlobalNavigation />

      <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-36 pb-24">
        {/* HEADER SECTION */}
        <ScrollReveal>
          <header className="text-center max-w-4xl mx-auto mb-16 space-y-4">
            <span className="text-[#2B3BE5] font-mono tracking-[0.4em] uppercase text-xs block border-b border-[#2B3BE5]/20 pb-2">
              [ CATÁLOGO DE OBRA // YACIMIENTOS DEL RETRATO ]
            </span>
            <h1 className="text-4xl sm:text-7xl font-serif font-light tracking-wide uppercase text-white leading-none">
              Catálogo de Obra
            </h1>
            <p className="text-white/60 font-sans text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">
              Explora las colecciones en técnica mixta sobre pizarra centenaria de tejado vasco, Kintsugi accidental, papel poliéster y escamas de mica mineral.
            </p>
          </header>
        </ScrollReveal>

        {/* 3D LUXURY ARTWORK VIEWER SECTION */}
        <ScrollReveal delay={0.1}>
          <div className="mb-24">
            <LuxuryArtworkViewer 
              onExpand={(art) => setModalArtwork(art)}
            />
          </div>
        </ScrollReveal>

        {/* FILTER CATEGORIES */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
          {[
            { id: 'todos', label: 'Todas las Obras' },
            { id: 'pizarra', label: 'Pizarra Vasco-Lítica' },
            { id: 'kintsugi', label: 'Kintsugi Accidental' },
            { id: 'pop', label: 'Retrato Pop' },
            { id: 'poliester', label: 'Poliéster Translúcido' },
            { id: 'mica', label: 'Mica & Cerámica 3D' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-5 py-2.5 font-mono text-[10px] sm:text-xs uppercase tracking-widest rounded-full transition-all duration-300 border cursor-pointer ${
                selectedFilter === cat.id
                  ? 'bg-[#2B3BE5] text-white border-[#2B3BE5] shadow-[0_0_20px_rgba(43,59,229,0.4)] font-bold'
                  : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ARTWORK GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-28">
          {filteredArtworks.map((artwork, idx) => (
            <ScrollReveal key={artwork.id} delay={0.05 * (idx % 3)}>
              <div 
                onClick={() => setModalArtwork({ src: artwork.src, title: artwork.title, category: artwork.material, desc: artwork.desc })}
                className="group relative bg-[#0A0A0A] border border-white/10 hover:border-[#2B3BE5]/60 rounded-sm overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(43,59,229,0.2)] cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
                  <Image
                    src={artwork.src}
                    alt={artwork.title}
                    fill
                    className="object-cover contrast-110 group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-500" />
                  
                  {/* Badge */}
                  <span className="absolute top-4 left-4 font-mono text-[9px] tracking-widest uppercase bg-black/80 border border-white/10 px-3 py-1 text-white/80 rounded-xs backdrop-blur-md">
                    {artwork.year}
                  </span>

                  <span className="absolute top-4 right-4 font-mono text-[9px] tracking-widest uppercase bg-[#2B3BE5]/80 text-white px-3 py-1 rounded-xs backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    🔍 Ampliar
                  </span>
                </div>

                {/* Card Info */}
                <div className="p-6 space-y-2 border-t border-white/5">
                  <span className="text-[9px] font-mono text-[#2B3BE5] uppercase tracking-widest block">
                    {artwork.material}
                  </span>
                  <h3 className="text-xl font-serif text-white group-hover:text-[#2B3BE5] transition-colors font-bold">
                    {artwork.title}
                  </h3>
                  <p className="text-xs font-sans text-white/60 line-clamp-2 leading-relaxed">
                    {artwork.desc}
                  </p>
                  
                  <div className="pt-4 flex justify-between items-center border-t border-white/5">
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Ver Ficha</span>
                    <Link
                      href={`/contacto?obra=${artwork.id}&action=adquirir`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] font-mono text-white hover:text-[#2B3BE5] uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      <span>Adquirir / Encargar</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ALCOVE SYSTEM COMPONENT SECTION */}
        <ScrollReveal>
          <div className="border-t border-white/10 pt-16">
            <AlcoveSystem
              activeAlcove={activeAlcove}
              setActiveAlcove={setActiveAlcove}
              resolveSrc={getImageUrl}
              onExpand={(art) => setModalArtwork(art)}
            />
          </div>
        </ScrollReveal>

        {/* CUSTOM COMMISSION CALL TO ACTION */}
        <ScrollReveal delay={0.2}>
          <div className="mt-20 p-10 sm:p-16 bg-gradient-to-r from-[#0A0A0A] via-[#121216] to-[#0A0A0A] border border-[#2B3BE5]/30 rounded-sm text-center space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-[#2B3BE5] to-transparent" />
            <span className="text-[#2B3BE5] font-mono text-[10px] tracking-[0.4em] uppercase block">
              [ CO-CREACIÓN DE OBRAS PERSONALIZADAS ]
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif text-white font-light uppercase tracking-wide">
              ¿Deseas encargar una obra única sobre pizarra?
            </h2>
            <p className="text-white/60 font-sans text-sm max-w-xl mx-auto leading-relaxed">
              Cada encargo inicia con una conversación directa. Naroa cincela tu retrato sobre pizarra centenaria vasca, resina epoxi y Kintsugi.
            </p>
            <div className="pt-4">
              <Link
                href="/contacto?action=encargo"
                className="inline-block px-10 py-5 bg-[#2B3BE5] hover:bg-white text-white hover:text-black font-mono text-xs uppercase tracking-[0.3em] font-bold rounded-sm transition-all duration-500 shadow-[0_0_30px_rgba(43,59,229,0.3)] hover:scale-105"
              >
                Configurar Encargo
              </Link>
            </div>
          </div>
        </ScrollReveal>

      </main>

      {/* FULLSCREEN ARTWORK INSPECTION MODAL */}
      <TakeoverModal
        artwork={modalArtwork}
        getImageUrl={getImageUrl}
        onClose={() => setModalArtwork(null)}
      />

      <Footer />
    </div>
  );
}
