'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Lenis from 'lenis';
import HeroFluid from '@/components/HeroFluid';

export default function Biografia() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.05]" />
        <HeroFluid />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 p-6 sm:p-12 mix-blend-difference">
        <Link 
          href="/" 
          className="group flex items-center gap-4 text-white/50 hover:text-white transition-colors duration-500"
        >
          <div className="w-8 h-[1px] bg-white/30 group-hover:bg-[#2B3BE5] group-hover:w-16 transition-all duration-700" />
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase">Retorno al Laboratorio</span>
        </Link>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-40 pb-32">
        
        {/* HEADER MEGA KINÉTICO */}
        <header className="mb-40 relative pt-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none" />
          <div className="absolute -left-6 sm:-left-12 top-0 w-[2px] h-full bg-gradient-to-b from-[#2B3BE5] via-[#2B3BE5]/20 to-transparent" />
          <h1 className="text-[14vw] md:text-[9rem] font-serif font-light leading-[0.75] tracking-tighter uppercase mb-8 drop-shadow-2xl mix-blend-difference">
            <span className="block text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.4)] hover:[-webkit-text-stroke:2px_#2B3BE5] hover:text-[#2B3BE5]/10 transition-all duration-700 cursor-default">Naroa</span>
            <span className="block text-white translate-x-8 sm:translate-x-16">Gutiérrez</span>
            <span className="block text-[#2B3BE5] font-hand lowercase text-[18vw] md:text-[12rem] -mt-16 ml-32 -rotate-6 opacity-90 drop-shadow-[0_0_30px_rgba(43,59,229,0.5)]">Gil</span>
          </h1>
          <p className="max-w-3xl text-lg sm:text-2xl font-light tracking-wide text-white/60 leading-relaxed mt-16 border-l border-[#2B3BE5]/30 pl-8 py-2 relative">
            <span className="absolute -left-[1px] top-0 w-[2px] h-1/3 bg-[#2B3BE5] shadow-[0_0_10px_#2B3BE5]" />
            Artista plástica contemporánea. Una colisión termodinámica entre el <strong className="text-[#2B3BE5] font-normal">hiperrealismo pop</strong> y la arqueología matérica forjada sobre <strong className="text-white font-normal">pizarra natural y mica mineral</strong>.
          </p>
        </header>

        {/* TRAYECTORIA */}
        <section className="mb-40 grid grid-cols-1 md:grid-cols-12 gap-12 items-center animate-[fadeIn_2s_ease-out_0.8s_both]">
          <div className="md:col-span-5 relative group">
            <div className="absolute inset-0 bg-[#2B3BE5] translate-x-4 translate-y-4 opacity-20 transition-transform duration-700 group-hover:translate-x-6 group-hover:translate-y-6" />
            <div className="relative aspect-[4/5] bg-[#0A0A0A] border border-white/10 overflow-hidden">
              <Image 
                src="https://naroa.online/assets/Naroa%20x16.jpeg" 
                alt="Naroa Gutiérrez Gil en su estudio" 
                fill 
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100" 
              />
            </div>
          </div>
          <div className="md:col-span-7 md:pl-12 space-y-8">
            <h2 className="text-4xl font-serif tracking-widest uppercase text-white/80 flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-[#2B3BE5] animate-ping" />
              Trayectoria Artística
            </h2>
            <div className="space-y-6 text-white/60 font-light leading-relaxed text-lg">
              <p>Establecida en Bilbao, su carrera expositiva despegó en 2010 con <em className="text-white">Espejos del alma</em>, explorando la identidad humana mediante técnicas mixtas sobre madera y metal.</p>
              <p>La evolución la llevó a hibridar la introspección psicológica con colores vibrantes, culminando en muestras icónicas como <em className="text-white">I see your true colors</em> (2016) y <em className="text-white">Repóker de Reinas</em> (2022).</p>
              <p>En 2026, consolida su estatus en el circuito contemporáneo urbano con <em className="text-white">DiviNos VaiVenes</em> y su integración en el <strong>Bwall Collective</strong> de Dock Bilbao.</p>
            </div>
          </div>
        </section>

        {/* ESTILO Y TÉCNICA - MATÉRICO (PIZARRA) */}
        <section className="mb-40 relative p-12 sm:p-20 overflow-hidden border-t border-b border-white/10 bg-black">
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2B3BE5] rounded-full blur-[150px] opacity-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-[#2B3BE5] to-transparent opacity-50" />
          
          <h2 className="text-5xl md:text-7xl font-serif tracking-widest uppercase text-white mb-16 relative z-10 opacity-90 mix-blend-difference">
            Materia & Silencio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
            <div className="space-y-8 text-white/70 font-light text-xl leading-relaxed">
              <p className="border-l-2 border-[#2B3BE5] pl-6 text-2xl font-serif text-white/90">"El lienzo no es un soporte pasivo. Es un yacimiento arqueológico que exige ser rascado."</p>
              <p>Un híbrido entre el rigor del <strong>hiperrealismo</strong> anatómico y los códigos cromáticos saturados del <strong>arte pop</strong>.</p>
              <p>Destaca su abandono de los soportes clásicos en favor de elementos telúricos. Transicionó radicalmente hacia el uso de <strong>mica mineral y pizarra natural</strong> de tejados en ruinas, desafiando el anclaje de pigmentos acrílicos sobre superficies pétreas reflectantes.</p>
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
        <section className="mb-40 animate-[fadeIn_2s_ease-out_1.4s_both]">
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
              <div key={i} className="group relative p-10 bg-black border border-white/10 hover:border-transparent transition-all duration-700 flex flex-col justify-between overflow-hidden cursor-default min-h-[300px]">
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

        {/* COLABORACIONES (Lista Cinemática) */}
        <section className="mb-40 animate-[fadeIn_2s_ease-out_1.7s_both]">
          <div className="border-t border-[#2B3BE5]/30 pt-16">
            <h2 className="text-5xl font-serif tracking-widest uppercase text-white mb-12">Redes & Colisiones</h2>
            <ul className="space-y-8 text-xl font-light text-white/60">
              <li className="flex flex-col sm:flex-row sm:items-end gap-2 border-b border-white/5 pb-8 hover:text-white transition-colors duration-500">
                <span className="text-3xl font-serif text-[#2B3BE5]">Vintage-Shop</span>
                <span className="sm:ml-auto text-sm tracking-widest uppercase">Muebles Escultura c/ Fernando Gutiérrez</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-end gap-2 border-b border-white/5 pb-8 hover:text-white transition-colors duration-500">
                <span className="text-3xl font-serif text-[#2B3BE5]">Proyecto Akelarre</span>
                <span className="sm:ml-auto text-sm tracking-widest uppercase">Estructuras efímeras incendiadas (2019)</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-end gap-2 border-b border-white/5 pb-8 hover:text-white transition-colors duration-500">
                <span className="text-3xl font-serif text-[#2B3BE5]">ZAWP & Fair Saturday</span>
                <span className="sm:ml-auto text-sm tracking-widest uppercase">Activismo a favor de CEAR-Euskadi</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-end gap-2 border-b border-white/5 pb-8 hover:text-white transition-colors duration-500">
                <span className="text-3xl font-serif text-[#2B3BE5]">Wikitoki</span>
                <span className="sm:ml-auto text-sm tracking-widest uppercase">Prácticas colaborativas artísticas</span>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-end gap-2 border-b border-white/5 pb-8 hover:text-white transition-colors duration-500">
                <a href="https://borjamoskv.com" target="_blank" rel="noopener noreferrer" className="text-3xl font-serif text-[#2B3BE5] hover:text-white transition-colors">Borja Moskv</a>
                <span className="sm:ml-auto text-sm tracking-widest uppercase">Arquitectura digital SOTA</span>
              </li>
            </ul>
          </div>
        </section>

      </main>

      {/* Footer Minimalista */}
      <footer className="w-full text-center py-12 border-t border-white/5 text-[10px] tracking-[0.3em] uppercase text-white/30">
        Extracción Biográfica Enciclopédica — C5-REAL
      </footer>
    </div>
  );
}
