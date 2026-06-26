'use client';

export default function ContactoPage() {
  return (
    <main className="w-full min-h-screen pt-48 pb-32 px-6 md:px-24 flex flex-col md:flex-row gap-16 md:gap-32 justify-center items-start">
      <div className="max-w-md w-full">
        <h1 className="text-4xl md:text-6xl font-light tracking-[0.3em] uppercase mb-8 opacity-90">Contacto</h1>
        <p className="text-sm font-mono tracking-[0.1em] text-[#888] mb-12 leading-loose">
          Adquisición de obra original, comisiones privadas de retrato hiperrealista y prensa.
        </p>
        
        <div className="space-y-8 font-mono text-xs tracking-widest uppercase text-[#666]">
          <div>
            <h3 className="text-white mb-2">Estudio</h3>
            <p>Bilbao, España (Visitas con cita previa)</p>
          </div>
          <div>
            <h3 className="text-white mb-2">Representación</h3>
            <p>info@naroagutierrezgil.com</p>
          </div>
          <div>
            <h3 className="text-white mb-2">Protocolo de Venta</h3>
            <p>Silent Commerce. No transacciones web directas.</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg w-full bg-[#080808] border border-white/5 p-8 md:p-12 relative overflow-hidden group">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        
        <form className="relative flex flex-col gap-10 font-sans z-10" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <input 
              type="text" 
              id="name" 
              required
              className="peer w-full bg-transparent border-b border-white/20 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
            />
            <label htmlFor="name" className="absolute left-0 top-2 text-xs uppercase tracking-widest text-[#555] peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:text-white peer-valid:-translate-y-6 peer-valid:text-[10px] peer-valid:text-white transition-all">
              Entidad (Nombre)
            </label>
          </div>

          <div className="relative">
            <input 
              type="email" 
              id="email" 
              required
              className="peer w-full bg-transparent border-b border-white/20 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors"
            />
            <label htmlFor="email" className="absolute left-0 top-2 text-xs uppercase tracking-widest text-[#555] peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:text-white peer-valid:-translate-y-6 peer-valid:text-[10px] peer-valid:text-white transition-all">
              Señal (Email)
            </label>
          </div>

          <div className="relative mt-4">
            <textarea 
              id="message" 
              required
              rows={4}
              className="peer w-full bg-transparent border border-white/20 p-4 text-sm text-white focus:outline-none focus:border-white transition-colors resize-none"
            ></textarea>
            <label htmlFor="message" className="absolute left-4 top-4 text-xs uppercase tracking-widest text-[#555] peer-focus:-translate-y-8 peer-focus:-translate-x-4 peer-focus:text-[10px] peer-focus:text-white peer-valid:-translate-y-8 peer-valid:-translate-x-4 peer-valid:text-[10px] peer-valid:text-white transition-all bg-[#080808] px-2">
              Inscripción (Mensaje)
            </label>
          </div>

          <button type="submit" className="mt-8 border border-white/20 text-white text-xs uppercase tracking-[0.3em] py-4 hover:bg-white hover:text-black transition-all duration-500">
            Transmitir
          </button>
        </form>
      </div>
    </main>
  );
}
