import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-[#000000] overflow-hidden selection:bg-[#2B3BE5] selection:text-white">
      {/* Radial void gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(43,59,229,0.08)_0%,transparent_60%)] z-0 pointer-events-none" />

      {/* Animated scanlines */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          backgroundSize: '100% 4px',
          animation: 'scanline-drift 8s linear infinite',
        }}
      />

      {/* Massive 404 typography */}
      <h1
        className="relative z-20 text-[30vw] sm:text-[25vw] leading-[0.75] font-serif font-extralight text-transparent select-none"
        style={{
          WebkitTextStroke: '1px rgba(43, 59, 229, 0.15)',
          animation: 'glitch-text 3s ease-in-out infinite',
        }}
      >
        404
      </h1>

      {/* Foreground content */}
      <div className="absolute z-30 flex flex-col items-center text-center mt-8">
        <span
          className="font-serif text-5xl sm:text-7xl italic text-[#2B3BE5] -rotate-3 mb-6 select-none"
          style={{
            textShadow: '0 0 60px rgba(43, 59, 229, 0.4), 0 0 120px rgba(43, 59, 229, 0.15)',
          }}
        >
          Pizarra Vacía
        </span>
        <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-white/40 max-w-sm px-6 mb-12 leading-relaxed">
          El estrato que buscas no ha sido cincelado todavía. Puede que la ruta se haya fracturado.
        </p>

        <Link
          href="/"
          className="group relative px-10 py-5 border border-white/10 hover:border-[#2B3BE5]/40 bg-[#000000] transition-all duration-700 overflow-hidden magnetic-glow"
        >
          <div className="absolute inset-0 bg-[#2B3BE5]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]" />
          <span className="relative z-10 font-mono text-[9px] tracking-[0.5em] uppercase text-white/70 group-hover:text-[#2B3BE5] transition-colors duration-500">
            Volver al Origen
          </span>
        </Link>
      </div>

      {/* Coordinates HUD */}
      <div className="absolute bottom-8 left-8 z-40 flex flex-col gap-1">
        <span className="font-mono text-[8px] tracking-[0.4em] text-white/15 uppercase">
          ERROR_STATE: VOID_STRATUM
        </span>
        <span className="font-mono text-[8px] tracking-[0.3em] text-[#2B3BE5]/30 uppercase">
          C5-REAL // borjamoskv
        </span>
      </div>

      {/* Inline styles for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline-drift {
          0% { background-position: 0 0; }
          100% { background-position: 0 100vh; }
        }
        @keyframes glitch-text {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, 2px); }
          80% { transform: translate(1px, -2px); }
        }
      `}} />
    </div>
  );
}
