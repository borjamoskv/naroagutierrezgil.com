export default function AutodidactPage() {
  return (
    <main className="w-full min-h-screen pt-48 pb-32 px-6 md:px-24 flex flex-col items-center">
      <header className="mb-24 text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-light tracking-[0.3em] uppercase mb-6 opacity-90">Laboratorio</h1>
        <p className="text-xs md:text-sm font-mono tracking-[0.2em] text-[#888] uppercase">Aprendizaje sin dogma</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl w-full">
        <article className="border-t border-white/10 pt-12">
          <h2 className="text-xl font-light tracking-[0.2em] uppercase mb-6 text-white">01. La Doctrina del Error</h2>
          <p className="text-[#AAA] font-sans text-sm leading-relaxed mb-6">
            La técnica mixta sobre soportes líticos (pizarra, basalto) no existe en los manuales académicos. 
            El proceso de Naroa es estrictamente empírico: prueba, error y adaptación física.
          </p>
          <p className="text-[#AAA] font-sans text-sm leading-relaxed">
            La adherencia del acrílico sobre piedra centenaria requiere un entendimiento termodinámico del soporte. 
            El conocimiento no se hereda, se extrae del material a través de la experimentación continua.
          </p>
        </article>

        <article className="border-t border-white/10 pt-12">
          <h2 className="text-xl font-light tracking-[0.2em] uppercase mb-6 text-white">02. Kintsugi Reactivo</h2>
          <p className="text-[#AAA] font-sans text-sm leading-relaxed mb-6">
            La rotura de la pizarra no es un fallo, es un evento físico. Al emplear mica, oro y resinas 
            para sellar estas fracturas geológicas, el hiperrealismo choca con el caos estructural.
          </p>
          <p className="text-[#AAA] font-sans text-sm leading-relaxed">
            Este enfoque autodidacta transforma cada obra en un registro geológico y biográfico inmutable.
          </p>
        </article>
      </div>

      <div className="mt-32 max-w-4xl w-full border border-white/5 p-8 md:p-16 bg-[#0A0A0A] text-center">
        <h3 className="font-mono text-xs tracking-[0.4em] text-[#555] uppercase mb-6">Manifiesto Material</h3>
        <p className="font-serif text-lg md:text-2xl text-[#EAEAEA] italic opacity-80 leading-relaxed">
          "No pinto sobre la piedra para dominarla, sino para revelar la tensión exacta en la que 
          la luz del sujeto y el peso de la tierra logran el equilibrio."
        </p>
      </div>
    </main>
  );
}
