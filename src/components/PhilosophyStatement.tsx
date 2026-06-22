'use client';

import ScrollMarquee from './ScrollMarquee';

export default function PhilosophyStatement() {
  return (
    <section id="statement" className="relative z-10 py-32 w-full overflow-hidden select-none bg-black/40 border-t border-white/5 border-b">
      <ScrollMarquee 
        texts={["MATERIA", "FISURA", "ALQUIMIA", "LÍTICA", "SOBERANÍA"]}
        baseSpeed={1.8}
        textClassName="text-[10vw] font-serif font-light tracking-widest uppercase text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.15)] hover:[-webkit-text-stroke:2px_var(--primary)] transition-all duration-500 cursor-default"
      />
    </section>
  );
}
