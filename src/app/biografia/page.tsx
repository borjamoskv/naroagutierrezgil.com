'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useLenis from '@/hooks/useLenis';
import HeroFluid from '@/components/HeroFluid';
import ScrollReveal from '@/components/ScrollReveal';
import Footer from '@/components/Footer';
import GlobalNavigation from '@/components/GlobalNavigation';
import TakeoverModal from '@/components/TakeoverModal';

const renderKineticText = (text: string, baseClass: string, hoverClass: string, staggerOffset: number = 0) => (
  text.split('').map((char, i) => {
    const randomRotate = (i % 3 === 0) ? '-rotate-12' : (i % 2 === 0) ? 'rotate-6' : 'rotate-12';
    const randomTranslate = (i % 2 === 0) ? '-translate-y-4' : (i % 3 === 0) ? 'translate-y-3' : '-translate-y-2';
    const randomScale = (i % 3 === 0) ? 'scale-125' : 'scale-110';
    const delay = staggerOffset + (i * 0.05);

    return (
      <span 
        key={i} 
        style={{ animationDelay: `${delay}s` }}
        className={`inline-block transition-all duration-500 cursor-default animate-[slideUp_1.5s_cubic-bezier(0.16,1,0.3,1)_both] ${baseClass} ${hoverClass} hover:${randomRotate} hover:${randomTranslate} hover:${randomScale}`}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    );
  })
);

export default function Biografia() {
  useLenis();

  const [takeoverArtwork, setTakeoverArtwork] = useState<{ src: string; title: string; category?: string; desc?: string } | null>(null);

  // Parallax SOTA Hover State for main portrait
  const portraitCardRef = useRef<HTMLDivElement>(null);
  const [portraitTilt, setPortraitTilt] = useState({ x: 0, y: 0 });
  const [isPortraitHovered, setIsPortraitHovered] = useState(false);

  const handlePortraitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!portraitCardRef.current) return;
    const rect = portraitCardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    const maxTilt = 3;
    setPortraitTilt({ x: -mouseY * maxTilt, y: mouseX * maxTilt });
  };

  const openFullscreenArtwork = (artwork: { src: string; title: string; category?: string; desc?: string }) => {
    setTakeoverArtwork(artwork);
    document.body.style.overflow = 'hidden';
  };

  const closeTakeover = () => {
    setTakeoverArtwork(null);
    document.body.style.overflow = '';
  };

  const timelineMilestones = [
    {
      year: '2010',
      title: 'Espejos del Alma',
      desc: 'Inicio del core loop artístico. Primeras miradas e introspección sobre madera y metal oxidado en Bilbao.',
      src: '615438426_1577822580363824_2923463327956560352_n.webp',
      category: 'Técnica Mixta'
    },
    {
      year: '2016',
      title: 'I See Your True Colors',
      desc: 'Transición al retrato hiperrealista monumental con saturaciones pop cian y magenta.',
      src: 'paul_newmum_1783824262669.webp',
      category: 'Retrato Pop'
    },
    {
      year: '2022',
      title: 'Repóker de Reinas',
      desc: 'Consolidación del soporte lítico. Búsqueda de pizarras de tejado vasco recuperadas de derribos.',
      src: 'amy-rocks-new.webp',
      category: 'Pizarra Lítica'
    },
    {
      year: '2026',
      title: 'DiviNos VaiVenes',
      desc: 'Instalación interactiva y colaborativa acústica con el productor Borja Moskv en el espacio Politena y Dock Bilbao.',
      src: 'exposicion-politena.webp',
      category: 'Instalación / Sonorización'
    }
  ];

  const curiosidades = [
    { 
      t: 'Paul Newman sobre Pizarra', 
      d: 'El retrato clave que inició el uso de soportes pétreos oscuros y relieve.',
      src: 'paul_newmum_1783824262669.webp',
      cat: 'Materia'
    },
    { 
      t: 'Láminas de Mica Pura', 
      d: 'Láminas minerales encoladas para crear reflejos ópticos con la luz física.',
      src: 'el-gran-dakari-C1tAWAhR.webp',
      cat: 'Mineral'
    },
    { 
      t: 'Arqueología Industrial', 
      d: 'Reciclaje de envases de conserva antiguos y maderas erosionadas por el Cantábrico.',
      src: 'dar-la-lata-DxWlKgS-.webp',
      cat: 'Reciclaje'
    },
    { 
      t: 'El Reverso Acústico', 
      d: 'Códigos QR grabados en la trasera con música electrónica de Borja Moskv.',
      src: 'naroa-portrait-new.webp',
      cat: 'Alquimia'
    },
    { 
      t: 'Contraste Cromático', 
      d: 'Rigor fotográfico de facciones humanas sumergido en neones saturados.',
      src: 'divinos-marilyn-By8KYPMI.webp',
      cat: 'Pop'
    },
    { 
      t: 'Kintsugi Accidental', 
      d: 'Grietas de cola resquebrajada en pandemia rellenadas con resinas de oro.',
      src: 'cantinflas-kintsugi.webp',
      cat: 'Textura'
    }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden relative">
      {/* Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.05]" />
        <HeroFluid />
      </div>

      <GlobalNavigation />

      <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-40 pb-32">
        
        {/* HEADER MEGA KINÉTICO */}
        <header className="mb-40 relative pt-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E')] opacity-20 mix-blend-soft-light pointer-events-none" />
          <div className="absolute -left-6 sm:-left-12 top-0 w-[2px] h-full bg-gradient-to-b from-[#2B3BE5] via-[#2B3BE5]/20 to-transparent" />
          <h1 className="text-[12vw] md:text-[8rem] font-serif font-light leading-[0.8] tracking-tighter uppercase mb-6 drop-shadow-2xl select-none relative">
            <span className="flex overflow-hidden">
              <span className="chromatic-text flex">
                {renderKineticText('Naroa', 'text-transparent [-webkit-text-stroke:1px_rgba(234,234,234,0.3)]', 'hover:[-webkit-text-stroke:1px_#2B3BE5] hover:text-[#2B3BE5] hover:drop-shadow-[0_0_20px_rgba(43,59,229,0.8)]', 0.1)}
              </span>
            </span>
            <span className="flex overflow-hidden mt-2">
              <span className="chromatic-text flex">
                {renderKineticText('Gutiérrez', 'text-[#EAEAEA]', 'hover:text-[#2B3BE5] hover:drop-shadow-[0_0_20px_rgba(43,59,229,0.8)]', 0.2)}
              </span>
            </span>
            <span className="absolute top-[35%] left-[25%] md:left-[35%] z-20 pointer-events-none">
              <span className="inline-block animate-[slideUp_2s_cubic-bezier(0.16,1,0.3,1)_0.4s_both] text-[#2B3BE5] font-hand lowercase text-[18vw] md:text-[12rem] -rotate-3 opacity-90 mix-blend-screen drop-shadow-[0_20px_50px_rgba(43,59,229,0.3)] chromatic-text">Gil</span>
            </span>
          </h1>
          <p className="max-w-3xl text-lg sm:text-2xl font-light tracking-wide text-white/60 leading-relaxed mt-16 border-l border-[#2B3BE5]/30 pl-8 py-2 relative">
            <span className="absolute -left-[1px] top-0 w-[2px] h-1/3 bg-[#2B3BE5] shadow-[0_0_10px_#2B3BE5]" />
            Cincelando identidades en pizarra y mica. Fusión visceral de hiperrealismo y arte pop para capturar el relieve de lo invisible.
          </p>
        </header>

        {/* TRAYECTORIA SPLIT-COLUMN (ART-FIRST) */}
        <section className="mb-40 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Brief Biography and Timeline */}
          <div className="lg:col-span-6 space-y-12">
            <ScrollReveal>
              <h2 className="text-3xl font-serif tracking-widest uppercase text-white/80 flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-[#2B3BE5] animate-ping" />
                Mi Trayectoria
              </h2>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <div className="space-y-6 text-white/60 font-light leading-relaxed text-base sm:text-lg border-l border-white/5 pl-6">
                <p>Establecida en Bilbao, inicié mi trayectoria en 2010 con <em className="text-white">Espejos del alma</em>, confrontando la identidad humana mediante técnicas mixtas sobre madera y metal.</p>
                <p>Mi evolución me arrastró a hibridar la introspección psicológica del retrato con códigos saturados de la cultura pop, un proceso plasmado en las series <em className="text-white">I see your true colors</em> y <em className="text-white">Repóker de Reinas</em>.</p>
                <p>En 2026, consolido mi lenguaje sobre soportes líticos recuperados con <em className="text-white">DiviNos VaiVenes</em> y mi integración en el **Bwall Collective** en Bilbao.</p>
              </div>
            </ScrollReveal>

            {/* Visual Timeline Stepper */}
            <div className="space-y-8 pt-8">
              {timelineMilestones.map((milestone, idx) => (
                <ScrollReveal delay={idx * 0.1} key={milestone.year}>
                  <div 
                    onClick={() => openFullscreenArtwork({ src: milestone.src, title: milestone.title, category: milestone.category, desc: milestone.desc })}
                    className="flex gap-6 group cursor-pointer border-b border-white/5 pb-6 hover:border-[#2B3BE5]/30 transition-colors"
                  >
                    <span className="font-mono text-xl text-[#2B3BE5] font-black">{milestone.year}</span>
                    <div className="space-y-1 flex-grow">
                      <h4 className="font-serif text-lg text-white uppercase group-hover:text-[#2B3BE5] transition-colors">{milestone.title}</h4>
                      <p className="text-xs text-white/40 leading-relaxed font-light">{milestone.desc}</p>
                    </div>
                    <div className="w-12 h-16 relative bg-neutral-900 overflow-hidden border border-white/10 shrink-0">
                      <Image 
                        src={`/assets/${milestone.src}`}
                        alt={milestone.title}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        sizes="50px"
                      />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Right Column: Giant Volumetric Portrait of the Artist */}
          <div className="lg:col-span-6 lg:sticky lg:top-32 flex justify-center">
            <ScrollReveal delay={0.2}>
              <div 
                className="relative group w-full max-w-[480px]"
                ref={portraitCardRef}
                onMouseMove={handlePortraitMouseMove}
                onMouseEnter={() => setIsPortraitHovered(true)}
                onMouseLeave={() => { setIsPortraitHovered(false); setPortraitTilt({ x: 0, y: 0 }); }}
                style={{ perspective: "1000px" }}
              >
                {/* Back projection layer */}
                <div 
                  className="absolute inset-0 bg-[#2B3BE5] translate-x-4 translate-y-4 opacity-10 transition-transform duration-500" 
                  style={{
                    transform: `translate3d(12px, 12px, -30px) rotateX(${portraitTilt.x * 0.5}deg) rotateY(${portraitTilt.y * 0.5}deg)`,
                    transition: isPortraitHovered ? "transform 0.1s ease-out" : "transform 0.8s ease-in-out"
                  }}
                />
                
                {/* Visual frame container */}
                <div 
                  className="relative aspect-[4/5] bg-black border border-white/10 overflow-hidden shadow-2xl"
                  style={{
                    transform: `rotateX(${portraitTilt.x}deg) rotateY(${portraitTilt.y}deg) scale(${isPortraitHovered ? 1.02 : 1.0})`,
                    transition: isPortraitHovered ? "transform 0.1s ease-out" : "transform 0.8s ease-in-out",
                    transformStyle: "preserve-3d"
                  }}
                >
                  <Image 
                    src="/assets/Naroa x16.webp" 
                    alt="Naroa Gutiérrez Gil en su estudio" 
                    fill 
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-[1.05]" 
                    style={{ transform: `translateZ(20px)` }}
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  
                  {/* Floating coordinate stamp */}
                  <div className="absolute bottom-6 left-6 font-mono text-[9px] tracking-widest text-white/50" style={{ transform: 'translateZ(30px)' }}>
                    [ BILBAO // EST. 2010 ]
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* MATERIAL Y TEXTURA (PIZARRA) */}
        <section className="mb-40 relative p-8 sm:p-20 overflow-hidden border-t border-b border-white/5 bg-[#080808]">
          <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2B3BE5] rounded-full blur-[150px] opacity-5 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-[#2B3BE5]/30 to-transparent" />
          
          <h2 className="text-4xl md:text-6xl font-serif tracking-widest uppercase text-white mb-12 relative z-10 opacity-90 mix-blend-difference">
            Materia & Resistencia
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-6 text-white/70 font-light text-base sm:text-lg leading-relaxed border-l border-[#2B3BE5]/40 pl-6">
              <p className="text-xl font-serif text-white/95 italic">&quot;El lienzo tradicional es inerte. Busco un soporte natural rústico que me exija interactuar con sus relieves.&quot;</p>
              <p>Abandono los soportes tradicionales. Trabajo sobre pizarra natural recuperada de derribos y láminas translúcidas de mica, forzando la luz y el acrílico sobre la porosidad mineral.</p>
            </div>
            <div className="p-8 border border-white/5 bg-white/[0.01] relative group flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[#2B3BE5] scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left" />
              <h3 className="text-[#2B3BE5] font-serif text-2xl mb-4">Arqueología Industrial</h3>
              <p className="text-sm text-white/60 font-light leading-relaxed">
                Uso de hojalata oxidada y maderas erosionadas por el Mar Cantábrico en la serie <em className="text-white">Dar la Lata</em>, entrelazando memoria obrera de la ría de Bilbao con retratos pop.
              </p>
            </div>
          </div>
        </section>

        {/* CURIOSIDADES VISUALES (MORE ART) */}
        <ScrollReveal>
          <section className="mb-40">
            <h2 className="text-3xl font-serif tracking-widest uppercase text-white/80 mb-16 text-center">
              Datos Líticos & Alquimia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {curiosidades.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => openFullscreenArtwork({ src: item.src, title: item.t, category: item.cat, desc: item.d })}
                  className="group relative p-8 bg-[#0A0A0A] border border-white/5 hover:border-[#2B3BE5]/30 transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-pointer min-h-[320px] shadow-2xl"
                >
                  <div className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" style={{ backgroundImage: `url(/assets/${item.src})` }} />
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#2B3BE5] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div>
                    <span className="font-mono text-[8px] tracking-[0.4em] text-[#2B3BE5] uppercase block mb-4">[ {item.cat} ]</span>
                    <h3 className="text-xl font-serif text-white/90 mb-4 group-hover:text-[#2B3BE5] transition-colors leading-tight">{item.t}</h3>
                    <p className="text-white/40 text-xs font-light leading-relaxed group-hover:text-white/70 transition-colors">{item.d}</p>
                  </div>
                  
                  <div className="flex justify-between items-end mt-8 border-t border-white/5 pt-4">
                    <span className="font-mono text-[9px] text-white/20">DETALLE 0{i + 1}</span>
                    <span className="font-mono text-[8px] text-[#2B3BE5] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest font-bold">Zoom ↗</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* COLABORACIONES */}
        <ScrollReveal>
          <section className="mb-24">
            <div className="border-t border-white/10 pt-16">
              <h2 className="text-4xl font-serif tracking-widest uppercase text-white mb-12">Colisiones Creativas</h2>
              <ul className="space-y-6 text-lg font-light text-white/60">
                {[
                  { name: 'Vintage-Shop', role: 'Muebles Escultura c/ Fernando Gutiérrez' },
                  { name: 'Proyecto Akelarre', role: 'Estructuras efímeras incendiadas' },
                  { name: 'ZAWP & Fair Saturday', role: 'Activismo y pintura a favor de CEAR-Euskadi' },
                  { name: 'Borja Moskv', role: 'Sonorización electrónica y espacio virtual C5-REAL', link: 'https://borjamoskv.com' }
                ].map((collab, index) => (
                  <li key={index} className="flex flex-col sm:flex-row sm:items-end gap-2 border-b border-white/5 pb-6 hover:text-white transition-colors duration-300">
                    {collab.link ? (
                      <a href={collab.link} target="_blank" rel="noopener noreferrer" className="text-2xl font-serif text-[#2B3BE5] hover:text-white transition-colors">
                        {collab.name}
                      </a>
                    ) : (
                      <span className="text-2xl font-serif text-[#2B3BE5]">{collab.name}</span>
                    )}
                    <span className="sm:ml-auto text-xs tracking-widest uppercase text-white/40">{collab.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </ScrollReveal>

      </main>

      <Footer />

      <TakeoverModal 
        artwork={takeoverArtwork} 
        isPersistent={true}
        getImageUrl={(src) => `/assets/${src}`} 
        onClose={closeTakeover}
      />
    </div>
  );
}
