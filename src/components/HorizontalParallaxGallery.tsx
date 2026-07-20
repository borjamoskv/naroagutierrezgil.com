"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ArtworkSlide {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  desc: string;
  color: string;
  accent: string;
}

const SLIDES: ArtworkSlide[] = [
  {
    id: "amy",
    src: "amy-new.webp",
    title: "AMY WINEHOUSE",
    subtitle: "Tensión en Cobalto",
    desc: "Trazos sinuosos grabados sobre pizarra vasca recuperada con disoluciones de resina epoxi de alta viscosidad y pigmento mineral puro.",
    color: "rgba(43, 59, 229, 0.15)",
    accent: "#2B3BE5",
  },
  {
    id: "geisha",
    src: "geisha-MfRtKWdu.webp",
    title: "GEISHA",
    subtitle: "Alquimia Lítica",
    desc: "Fusión texturada de polvo de mica, pigmento dorado y pan de oro aplicados en capas sucesivas sobre roca basaltica erosionada.",
    color: "rgba(245, 158, 11, 0.15)",
    accent: "#F59E0B",
  },
  {
    id: "cantinflas",
    src: "cantinflas-kintsugi.webp",
    title: "CANTINFLAS",
    subtitle: "Kintsugi Accidental",
    desc: "Retrato icónico reconstruido mediante la unión deliberada de fragmentos de pizarra fracturada, sellados con resina dorada reflectante.",
    color: "rgba(229, 43, 59, 0.15)",
    accent: "#E52B3B",
  },
];

interface HorizontalParallaxGalleryProps {
  onExpand: (artwork: { src: string; title: string; category?: string; desc?: string }) => void;
}

export default function HorizontalParallaxGallery({ onExpand }: HorizontalParallaxGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Mouse tilt state for each slide
  const [tilts, setTilts] = useState<{ [key: string]: { x: number; y: number } }>({
    amy: { x: 0, y: 0 },
    geisha: { x: 0, y: 0 },
    cantinflas: { x: 0, y: 0 },
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleScroll = () => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;

      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculate scroll progress through the horizontal track section
      const scrolled = -rect.top;
      const maxScroll = containerHeight - windowHeight;
      
      if (maxScroll <= 0) return;

      const currentProgress = Math.min(Math.max(scrolled / maxScroll, 0), 1);
      setProgress(currentProgress);

      // Translate horizontal track
      const maxTranslate = track.offsetWidth - window.innerWidth;
      track.style.transform = `translate3d(${-currentProgress * maxTranslate}px, 0, 0)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run initial trigger
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDesktop]);

  const handleMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Set custom CSS variables for interactive mouse spotlight shine
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${mouseX}%`);
    card.style.setProperty('--mouse-y', `${mouseY}%`);

    // Max 3 degrees tilt (super subtle, art-first)
    setTilts((prev) => ({
      ...prev,
      [id]: { x: -y * 3, y: x * 3 },
    }));
  };


  const handleMouseLeave = (id: string) => {
    setTilts((prev) => ({
      ...prev,
      [id]: { x: 0, y: 0 },
    }));
  };

  if (!isDesktop) {
    // Vertical responsive fallback stack for smaller screens
    return (
      <section className="relative z-10 bg-[#000000] py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col gap-24">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[9px] tracking-[0.4em] text-[#2B3BE5] uppercase font-bold">EXCAVACIONES LÍTICAS</span>
            <h2 className="font-serif text-4xl sm:text-5xl italic text-[#EAEAEA]">Obras Gigantes</h2>
            <div className="w-12 h-[1px] bg-white/20 mt-4" />
          </div>

          {SLIDES.map((slide) => (
            <div key={slide.id} className="flex flex-col gap-8">
              <div 
                className="relative w-full aspect-[3/4] bg-[#000000] border border-white/10 rounded-sm overflow-hidden"
                onClick={() => onExpand({ src: `/assets/${slide.src}`, title: slide.title, desc: slide.desc })}
              >
                <Image
                  src={`/assets/${slide.src}`}
                  alt={slide.title}
                  fill
                  className="object-cover opacity-80"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/50">{slide.subtitle}</span>
                  <h3 className="font-serif text-2xl italic text-white mt-1">{slide.title}</h3>
                </div>
              </div>
              <p className="text-white/60 font-light leading-relaxed text-sm">{slide.desc}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative z-[190] h-[300vh] bg-[#000000]"
      style={{ contentVisibility: "auto" }}
    >
      <div 
        ref={stickyRef} 
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center"
      >
        {/* Background Massive Title Parallax Overlay */}
        <div 
          className="absolute inset-x-0 bottom-12 flex justify-around pointer-events-none select-none z-0"
          style={{
            transform: `translate3d(${-progress * 15}vw, 0, 0)`,
            transition: "transform 0.1s linear",
          }}
        >
          <span className="font-serif text-[18vw] leading-none font-extralight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.02)] uppercase tracking-tighter whitespace-nowrap">
            MONOLITOS EN TENSIÓN · IMPERFECCIÓN Y MATERIA ·
          </span>
        </div>

        {/* Horizontal Sliding Track */}
        <div 
          ref={trackRef} 
          className="flex items-center h-full px-[15vw] gap-[10vw] w-max will-change-transform z-10"
        >
          {/* Header Panel */}
          <div className="flex flex-col justify-center w-[30vw] min-w-[320px] select-none h-full pr-[5vw]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-[2px] bg-[#2B3BE5] shadow-[0_0_8px_#2B3BE5]" />
              <span className="font-mono text-[10px] tracking-[0.4em] text-[#2B3BE5] uppercase font-bold">
                PERSPECTIVAS LÍTICAS
              </span>
            </div>
            <h2 className="font-serif text-7xl font-extralight leading-[0.9] tracking-tighter text-white uppercase mb-8">
              Obras<br />
              <span className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.5)] italic">Gigantes</span>
            </h2>
            <p className="font-sans text-[11px] tracking-[0.25em] text-white/40 uppercase leading-relaxed max-w-sm mb-12">
              Desplazamiento cinético por la textura y la profundidad. Estructuras monumentales sobre soportes naturales de gran formato.
            </p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] text-white/20">PROGRESS</span>
              <div className="w-32 h-[1px] bg-white/10 relative">
                <div 
                  className="absolute left-0 top-0 h-full bg-[#2B3BE5] transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="font-mono text-[9px] text-[#2B3BE5] font-bold">
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>

          {/* Artwork Slides */}
          {SLIDES.map((slide, idx) => {
            const tilt = tilts[slide.id] || { x: 0, y: 0 };
            // Compute parallax offset layer positions
            const shiftX = (progress - (idx * 0.3)) * 60;

            return (
              <div 
                key={slide.id}
                className="relative flex items-center w-[60vw] min-w-[700px] h-full"
              >
                {/* Volumetric Glow Background */}
                <div 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full filter blur-[120px] opacity-[0.06] pointer-events-none transition-all duration-1000"
                  style={{ 
                    backgroundColor: slide.accent,
                    transform: `translate3d(${shiftX * 0.3}px, 0, 0)` 
                  }}
                />

                {/* Main Card Container */}
                <div 
                  onMouseMove={(e) => handleMouseMove(slide.id, e)}
                  onMouseLeave={() => handleMouseLeave(slide.id)}
                  onClick={() => onExpand({ src: `/assets/${slide.src}`, title: slide.title, desc: slide.desc })}
                  className="relative flex items-center w-full aspect-[16/10] bg-[#000000]/90 border border-white/5 hover:border-white/15 p-12 transition-all duration-500 rounded-sm cursor-pointer shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden group select-none"
                  style={{
                    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    transition: "transform 0.15s ease-out, border-color 0.5s ease"
                  }}
                >
                  {/* Subtle Inner Volumetric Spotlight Overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
                    style={{
                      background: `radial-gradient(circle 280px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.05), transparent 80%)`
                    }}
                  />
                  {/* Ambient Border Glow tracking the mouse */}
                  <div 
                    className="absolute inset-0 border border-transparent group-hover:border-white/10 transition-colors pointer-events-none z-30"
                    style={{
                      background: `radial-gradient(circle 180px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.08), transparent 80%)`,
                      WebkitMaskImage: 'linear-gradient(black, black)',
                      maskImage: 'linear-gradient(black, black)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                    }}
                  />


                  {/* Gigantic Artwork Image Wrapper (Parallax Box) */}
                  <div 
                    className="relative w-[45%] h-full overflow-hidden bg-[#000000] border border-white/10"
                    style={{
                      transform: `translate3d(${shiftX * -0.25}px, 0, 0)`,
                      transition: "transform 0.1s linear"
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent z-10" />
                    <Image
                      src={`/assets/${slide.src}`}
                      alt={slide.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="30vw"
                      priority
                    />
                  </div>

                  {/* Artwork Detail Text Info Panel (Floating Layer) */}
                  <div 
                    className="flex flex-col justify-center pl-16 w-[55%] h-full z-20"
                    style={{
                      transform: `translate3d(${shiftX * 0.15}px, 0, 0)`,
                      transition: "transform 0.1s linear"
                    }}
                  >
                    <span 
                      className="font-mono text-[9px] tracking-[0.4em] uppercase mb-2 font-bold"
                      style={{ color: slide.accent }}
                    >
                      {slide.subtitle}
                    </span>
                    <h3 className="font-serif text-5xl font-extralight italic text-white uppercase mb-6 leading-none tracking-tight">
                      {slide.title}
                    </h3>
                    <p className="text-white/50 text-xs font-light leading-relaxed mb-8 max-w-sm">
                      {slide.desc}
                    </p>

                    <div className="flex items-center gap-4">
                      <button 
                        className="group/btn relative px-8 py-3.5 border border-white/10 hover:border-white bg-[#000000] transition-all duration-500 overflow-hidden"
                        style={{ '--hover-accent': slide.accent } as React.CSSProperties}
                      >
                        <div 
                          className="absolute inset-0 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out z-0"
                          style={{ backgroundColor: slide.accent, opacity: 0.1 }}
                        />
                        <span className="relative z-10 font-mono text-[8.5px] tracking-[0.3em] uppercase text-white/70 group-hover/btn:text-white transition-colors">
                          Explorar Materia
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Panel Slide HUD Coordinate */}
                  <div className="absolute bottom-6 right-8 font-mono text-[8px] tracking-[0.25em] text-white/10">
                    C5-REAL // LATENT_STRATUM_0{idx + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
