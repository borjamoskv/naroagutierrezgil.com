'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#030303] overflow-hidden selection:bg-[#2B3BE5] selection:text-white px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(43,59,229,0.06)_0%,transparent_60%)] z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="w-16 h-16 rounded-full border border-[#2B3BE5]/30 flex items-center justify-center mb-8">
          <span className="text-[#2B3BE5] text-2xl font-mono">!</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl italic text-[#2B3BE5] mb-4">
          Fractura Detectada
        </h1>

        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-white/40 mb-2 leading-relaxed">
          El estrato ha sufrido una fisura inesperada.
        </p>

        {error.digest && (
          <p className="font-mono text-[8px] text-white/20 mb-8">
            DIGEST: {error.digest}
          </p>
        )}

        <div className="flex gap-4">
          <button
            onClick={reset}
            className="group relative px-8 py-4 border border-[#2B3BE5]/30 hover:border-[#2B3BE5] bg-[#050505] transition-all duration-700 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#2B3BE5]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <span className="relative z-10 font-mono text-[9px] tracking-[0.4em] uppercase text-white/70 group-hover:text-[#2B3BE5] transition-colors duration-500">
              Reintentar
            </span>
          </button>

          <Link
            href="/"
            className="group relative px-8 py-4 border border-white/10 hover:border-white/30 bg-[#050505] transition-all duration-700 overflow-hidden"
          >
            <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-white/50 group-hover:text-white transition-colors duration-500">
              Origen
            </span>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 flex flex-col gap-1">
        <span className="font-mono text-[8px] tracking-[0.4em] text-white/15 uppercase">
          ERROR_STATE: FRACTURE_DETECTED
        </span>
        <span className="font-mono text-[8px] tracking-[0.3em] text-[#2B3BE5]/30 uppercase">
          C5-REAL // borjamoskv
        </span>
      </div>
    </div>
  );
}
