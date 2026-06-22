import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-[#0A0A0A] overflow-hidden selection:bg-primary selection:text-black">
      {/* Dynamic Void Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(43,59,229,0.1)_0%,transparent_70%)] z-0 pointer-events-none" />
      <div className="absolute w-full h-full bg-slate-texture opacity-30 mix-blend-overlay z-0 pointer-events-none" />

      {/* Massive 404 Typography */}
      <h1 className="relative z-10 text-[25vw] leading-[0.8] font-serif font-light text-transparent [-webkit-text-stroke:2px_var(--color-primary)] mix-blend-screen opacity-20 select-none animate-[pulse_4s_ease-in-out_infinite]">
        404
      </h1>

      {/* Foreground Content */}
      <div className="absolute z-20 flex flex-col items-center text-center mt-32">
        <span className="text-primary font-hand text-5xl sm:text-7xl -rotate-6 mb-4 drop-shadow-[0_0_30px_rgba(43,59,229,0.8)]">
          Pizarra Vacía
        </span>
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-foreground/50 max-w-md px-6 mb-12">
          El estrato que buscas no ha sido cincelado en la realidad todavía.
        </p>
        
        <Link 
          href="/"
          className="group relative px-8 py-4 border border-white/10 hover:border-primary/50 bg-[#050505] transition-all duration-700 overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
          <span className="relative z-10 font-sans text-[9px] tracking-[0.4em] uppercase text-foreground/80 group-hover:text-primary transition-colors duration-500">
            Volver al Origen
          </span>
        </Link>
      </div>

      {/* Glitch Overlay */}
      <div className="absolute inset-0 pointer-events-none mix-blend-difference opacity-10 z-50 bg-[url('/assets/naroa-portrait-new.jpg')] bg-cover grayscale" style={{ filter: 'contrast(300%)' }} />
    </div>
  );
}
