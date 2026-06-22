'use client';

export default function PhilosophyStatement() {
  return (
    <section id="statement" className="relative z-10 px-6 sm:px-12 py-48 max-w-6xl mx-auto w-full flex flex-col items-center text-center select-none">
      <span className="text-[var(--primary)] font-mono text-[9px] tracking-[0.5em] uppercase mb-6">
        Física de la Materia y la Fisura
      </span>
      <p className="text-2xl sm:text-4xl md:text-5xl font-serif font-light tracking-wide text-white leading-relaxed max-w-4xl italic">
        &quot;El lienzo no es un soporte; es la materia misma que <span className="text-[var(--primary)] text-glow font-normal">gobierna la forma</span>. En Naroa, la pizarra centenaria, la mica mineral y el kintsugi se alían en retratos que son calibres de memoria.&quot;
      </p>
      <div className="w-16 h-[1px] bg-[#2B3BE5]/30 mt-12" />
    </section>
  );
}
