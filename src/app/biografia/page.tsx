'use client';

import Link from 'next/link';
import Image from 'next/image';
import useLenis from '@/hooks/useLenis';
import HeroFluid from '@/components/HeroFluid';
import ScrollReveal from '@/components/ScrollReveal';
import Footer from '@/components/Footer';

import { useState, useRef } from 'react';

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

  // Parallax SOTA Hover State
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    const maxTilt = 12; // High intensity parallax for SOTA
    setTilt({ x: -mouseY * maxTilt, y: mouseX * maxTilt });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.05]" />
        <HeroFluid />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 p-6 sm:p-12 mix-blend-difference flex justify-between items-center">
        <Link 
          href="/" 
          className="group flex items-center gap-4 text-white/50 hover:text-white transition-colors duration-500"
        >
          <div className="w-8 h-[1px] bg-white/30 group-hover:bg-[#2B3BE5] group-hover:w-16 transition-all duration-700" />
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase">Retorno al Laboratorio</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/biografia" className="font-sans text-[9px] tracking-[0.4em] uppercase text-[#2B3BE5] font-bold">Biografía</Link>
          <Link href="/autodidact" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">Autodidacta</Link>
          <Link href="/blog" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">Bitácora</Link>
          <Link href="/recreo" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">El ReCreo</Link>
          <Link href="/shop" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">Bóveda</Link>
          <Link href="/contacto" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">Contacto</Link>
        </div>

      </nav>

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
            No pinto para decorar. Pinto para capturar la tensión de lo invisible. Forjo retratos sobre <strong className="text-[#2B3BE5] font-normal">pizarra natural, mica mineral</strong> y materiales rescatados, desafiando la resistencia del soporte para desenterrar la mirada humana.
          </p>
        </header>

        {/* TRAYECTORIA */}
        <ScrollReveal>
        <section className="mb-40 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div 
            className="md:col-span-5 relative group"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setTilt({ x: 0, y: 0 }); }}
            style={{ perspective: "1000px" }}
          >
            <div 
              className="absolute inset-0 bg-[#2B3BE5] translate-x-4 translate-y-4 opacity-20 transition-transform duration-700" 
              style={{
                transform: `translate3d(16px, 16px, -50px) rotateX(${tilt.x * 0.5}deg) rotateY(${tilt.y * 0.5}deg)`,
                transition: isHovered ? "transform 0.1s ease-out" : "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)"
              }}
            />
            <div 
              className="relative aspect-[4/5] bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-2xl"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.05 : 1.0})`,
                transition: isHovered ? "transform 0.1s ease-out" : "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
                transformStyle: "preserve-3d"
              }}
            >
              <Image 
                src="/assets/Naroa x16.webp" 
                alt="Naroa Gutiérrez Gil en su estudio" 
                fill 
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" 
                style={{
                  transform: `translateZ(30px) scale(1.1)`,
                  transformOrigin: "center center"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            </div>
          </div>
          <div className="md:col-span-7 md:pl-12 space-y-8">
            <h2 className="text-4xl font-serif tracking-widest uppercase text-white/80 flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-[#2B3BE5] animate-ping" />
              Mi Trayectoria
            </h2>
            <div className="space-y-6 text-white/60 font-light leading-relaxed text-lg">
              <p>Establecida en Bilbao, inicié mi trayectoria en 2010 con <em className="text-white">Espejos del alma</em>, confrontando la identidad humana mediante el choque de técnicas mixtas sobre madera y metal.</p>
              <p>Mi evolución me arrastró a hibridar la introspección psicológica del retrato con códigos cromáticos saturados de la cultura pop, un proceso plasmado en exposiciones como <em className="text-white">I see your true colors</em> (2016) y <em className="text-white">Repóker de Reinas</em> (2022).</p>
              <p>En 2026, consolido mi lenguaje en el espacio contemporáneo urbano con <em className="text-white">DiviNos VaiVenes</em> y mi integración en el <strong>Bwall Collective</strong> en Dock Bilbao.</p>
            </div>
          </div>
        </section>
        </ScrollReveal>

        {/* ESTILO Y TÉCNICA - MATÉRICO (PIZARRA) */}
        <section className="mb-40 relative p-12 sm:p-20 overflow-hidden border-t border-b border-white/10 bg-black">
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2B3BE5] rounded-full blur-[150px] opacity-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-[#2B3BE5] to-transparent opacity-50" />
          
          <h2 className="text-5xl md:text-7xl font-serif tracking-widest uppercase text-white mb-16 relative z-10 opacity-90 mix-blend-difference">
            Materia & Silencio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
            <div className="space-y-8 text-white/70 font-light text-xl leading-relaxed">
              <p className="border-l-2 border-[#2B3BE5] pl-6 text-2xl font-serif text-white/90">&quot;El lienzo para mí es un soporte inerte. Busco un yacimiento arqueológico que me exija rascar la superficie.&quot;</p>
              <p>Mi trabajo se sitúa en la frontera entre el rigor milimétrico del <strong>hiperrealismo</strong> anatómico y el impacto estridente del <strong>arte pop</strong>.</p>
              <p>He abandonado los soportes tradicionales en busca de la resistencia mineral: placas de <strong>pizarra natural</strong> rescatadas de tejados derruidos o láminas translúcidas de <strong>mica mineral</strong>, desafiando las leyes físicas de adhesión del acrílico para dejar que la piedra respire.</p>
            </div>
            <div className="space-y-8 text-white/70 font-light text-xl leading-relaxed">
              <div className="p-8 border border-white/5 bg-white/[0.01] relative group h-full flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-[#2B3BE5] scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left" />
                <h3 className="text-[#2B3BE5] font-serif text-3xl mb-6">Arqueología Industrial</h3>
                <p>Incorpora memoria obrera en su serie <em className="text-white">Dar la Lata</em>, elaborada a partir de antiguos envases de hojalata y maderas recuperadas del oleaje salino del Mar Cantábrico.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CURIOSIDADES KINÉTICAS */}
        <ScrollReveal>
        <section className="mb-40">
          <h2 className="text-4xl font-serif tracking-widest uppercase text-white/80 mb-16 text-center">
            Datos de Interés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: 'El retrato de Paul Newman', d: 'Pieza clave hiperrealista que desató su fascinación por los contrastes de luz del cine clásico sobre pizarra oscura.' },
              { t: 'Selección geológica', d: 'Selecciona personalmente las placas de pizarra en canteras, estudiando vetas y fisuras para integrarlas en las facciones.' },
              { t: 'Mica mineral como lienzo', d: 'Utiliza láminas de mica pura. Requiere un sellado químico para no perder la luminiscencia natural de la piedra.' },
              { t: 'Destrucción creativa', d: 'Destruyó decenas de obras formativas antes de 2010 en un meticuloso «vaciado técnico necesario».' },
              { t: 'Arquitectura web kinética', d: 'Su laboratorio digital, codiseñado con Borja Moskv, permite a los usuarios interactuar y rascar la pizarra virtualmente.' },
              { t: 'Arte efímero', d: 'En Akelarre (2019) creó estructuras colaborativas gigantes que fueron incendiadas durante la Noche de San Juan.' },
              { t: 'Muebles escultura', d: 'Con Vintage-Shop rompió la bidimensionalidad, creando mobiliario de autor y piezas funcionales.' },
              { t: 'Arqueología industrial', d: 'Recuperó desechos industriales del Cantábrico para mezclar memoria obrera de Bilbao con retratos.' },
              { t: 'Contraste POP', d: 'Descontextualiza el rigor fotográfico bañando las figuras en neones, cianes y magentas de los años 80.' },
            ].map((item, i) => (
              <div key={i} className="group relative p-10 bg-black border border-white/10 hover:border-[#2B3BE5]/20 transition-all duration-700 flex flex-col justify-between overflow-hidden cursor-default min-h-[300px] magnetic-glow">
                <div className="absolute inset-0 bg-[#2B3BE5] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] opacity-[0.03]" />
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#2B3BE5] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                
                <h3 className="text-2xl font-serif text-white/90 mb-6 group-hover:text-[#2B3BE5] transition-colors relative z-10 leading-tight">{item.t}</h3>
                <p className="text-white/40 text-sm font-sans font-light leading-relaxed group-hover:text-white/70 transition-colors relative z-10">{item.d}</p>
                
                <div className="absolute -bottom-8 -right-4 text-[10rem] font-serif text-white/[0.02] pointer-events-none group-hover:text-[#2B3BE5]/10 transition-colors duration-700 select-none">
                  0{i + 1}
                </div>
              </div>
            ))}
          </div>
        </section>
        </ScrollReveal>

        {/* COLABORACIONES (Lista Cinemática) */}
        <ScrollReveal>
        <section className="mb-40">
          <div className="border-t border-[#2B3BE5]/30 pt-16">
            <h2 className="text-5xl font-serif tracking-widest uppercase text-white mb-12">Redes & Colisiones</h2>
            <ul className="space-y-8 text-xl font-light text-white/60">
              <li className="flex flex-col sm:flex-row sm:items-end gap-2 border-b border-white/5 pb-8 hover:text-white transition-colors duration-500">
                <span className="text-3xl font-serif text-[#2B3BE5] kinetic-underline">Vintage-Shop</span>
                <span className="sm:ml-auto text-sm tracking-widest uppercase">Muebles Escultura c/ Fernando Gutiérrez</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-end gap-2 border-b border-white/5 pb-8 hover:text-white transition-colors duration-500">
                <span className="text-3xl font-serif text-[#2B3BE5] kinetic-underline">Proyecto Akelarre</span>
                <span className="sm:ml-auto text-sm tracking-widest uppercase">Estructuras efímeras incendiadas (2019)</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-end gap-2 border-b border-white/5 pb-8 hover:text-white transition-colors duration-500">
                <span className="text-3xl font-serif text-[#2B3BE5] kinetic-underline">ZAWP & Fair Saturday</span>
                <span className="sm:ml-auto text-sm tracking-widest uppercase">Activismo a favor de CEAR-Euskadi</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-end gap-2 border-b border-white/5 pb-8 hover:text-white transition-colors duration-500">
                <span className="text-3xl font-serif text-[#2B3BE5] kinetic-underline">Wikitoki</span>
                <span className="sm:ml-auto text-sm tracking-widest uppercase">Prácticas colaborativas artísticas</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-end gap-2 border-b border-white/5 pb-8 hover:text-white transition-colors duration-500">
                <a href="https://borjamoskv.com" target="_blank" rel="noopener noreferrer" className="text-3xl font-serif text-[#2B3BE5] hover:text-white transition-colors kinetic-underline">Borja Moskv</a>
                <span className="sm:ml-auto text-sm tracking-widest uppercase">Arquitectura digital SOTA</span>
              </li>
            </ul>
          </div>
        </section>
        </ScrollReveal>

      </main>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}
