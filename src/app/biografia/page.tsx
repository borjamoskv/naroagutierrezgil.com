export const metadata = {
  title: "Biografía | Naroa Gutiérrez Gil",
  description: "Trayectoria y declaración filosófica de Naroa Gutiérrez Gil. Arte, hiperrealismo pop y kintsugi digital.",
};

export default function BiografiaPage() {
  return (
    <main className="w-full min-h-screen pt-48 pb-32 px-6 md:px-24 flex justify-center">
      <article className="max-w-4xl w-full">
        <header className="mb-24 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-light tracking-[0.3em] uppercase mb-6 opacity-90">Origen</h1>
          <p className="text-xs md:text-sm font-mono tracking-[0.2em] text-[#888] uppercase">El Punto Cero • Bilbao</p>
        </header>

        <div className="space-y-12 text-[#CCC] font-sans leading-relaxed text-sm md:text-base opacity-80 mix-blend-screen max-w-3xl">
          <p>
            Naroa Gutiérrez Gil (Bilbao) forja su obra en la intersección de la gravedad y la levedad. 
            Su enfoque técnico descansa en el control absoluto del hiperrealismo pop, anclado en 
            materiales de alta densidad termodinámica: la pizarra negra centenaria, la resina epoxi 
            y la hoja de oro.
          </p>
          <p>
            Al abandonar el lienzo tradicional de lino y algodón, Naroa transmuta la superficie estéril 
            de la piedra de cantera en un escenario de tensión. Cada retrato no es una simple mímesis 
            visual, sino una extracción arqueológica de la psique del sujeto.
          </p>
          <p>
            Inspirada por la estética del <em className="text-white not-italic border-b border-white/20">Kintsugi</em>, sus obras fracturan 
            las convenciones del retrato al integrar fisuras físicas selladas con mica o pigmentos áureos. 
            El sujeto retratado (desde la melancolía de Amy Winehouse hasta la fuerza bruta de Basquiat) 
            existe simultáneamente en dos estados: su deificación pop y su materialidad geológica inquebrantable.
          </p>
        </div>

        <div className="mt-32 pt-16 border-t border-white/10">
          <h2 className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase mb-12 opacity-90 text-center md:text-left">Exhibiciones</h2>
          <ul className="space-y-8 font-mono text-xs md:text-sm tracking-widest text-[#888] uppercase">
            <li className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 hover:text-white transition-colors">
              <span className="w-24 border-b border-[#333] pb-1">2026</span>
              <span>Galería Contemporánea C5 • Bilbao</span>
            </li>
            <li className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 hover:text-white transition-colors">
              <span className="w-24 border-b border-[#333] pb-1">2025</span>
              <span>Feria Internacional ArtePop • Madrid</span>
            </li>
            <li className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 hover:text-white transition-colors">
              <span className="w-24 border-b border-[#333] pb-1">2024</span>
              <span>Retrospectiva Pizarra Vasca • Donostia</span>
            </li>
          </ul>
        </div>
      </article>
    </main>
  );
}
