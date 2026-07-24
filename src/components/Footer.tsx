import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative pt-40 pb-20 overflow-hidden bg-[#000000] border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(43,59,229,0.08)_0%,transparent_60%)] z-0 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <Link 
          href="/contacto" 
          aria-label="Establecer contacto y configurar propuesta"
          className="text-4xl sm:text-6xl md:text-[7rem] font-serif font-light tracking-tighter text-foreground/70 hover:text-primary transition-colors duration-1000 mb-12 block hover:tracking-normal uppercase"
        >
          Contacto
        </Link>
        
        <div className="flex flex-col gap-4 mb-20 items-center">
          <a href="https://naroa.online" aria-label="Acceder al Laboratorio Kinético SOTA" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 text-primary/50 hover:text-primary transition-colors duration-500 px-8 py-3 border border-primary/20 hover:border-primary/50 rounded-sm w-full max-w-sm justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-sans text-[9px] tracking-[0.4em] uppercase">Laboratorio Kinético</span>
          </a>
          
          <Link href="/autodidact" aria-label="Experiencia Inmersiva Autodidacta" className="group flex items-center gap-4 text-white/30 hover:text-white transition-colors duration-500 px-8 py-3 border border-white/10 hover:border-white/30 rounded-sm w-full max-w-sm justify-center">
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase">Experiencia Autodidacta</span>
          </Link>
        </div>

        <div className="flex flex-wrap gap-8 justify-center mb-16 text-[9px] tracking-[0.4em] uppercase text-white/40">
          <Link href="/obra" className="hover:text-primary transition-colors duration-500">Obra</Link>
          <Link href="/blog" className="hover:text-primary transition-colors duration-500">Bitácora</Link>
          <Link href="/shop" className="hover:text-primary transition-colors duration-500">Bóveda</Link>
          <Link href="/biografia" className="hover:text-primary transition-colors duration-500">Trayectoria</Link>
          <Link href="/juegos" className="hover:text-primary transition-colors duration-500">Juegos</Link>
          <a href="https://www.instagram.com/naroa_art/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-500 text-primary/70">
            @naroa_art
          </a>
        </div>



        <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-3xl pt-12 border-t border-white/5 text-foreground/30 font-sans text-xs tracking-widest uppercase">
          <span>© 2026 Naroa Gutiérrez Gil · Creado por <a href="https://www.borjamoskv.com" aria-label="Web de Borja Moskv" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-500">Borja Moskv</a></span>
          <span className="mt-4 sm:mt-0">Bilbao, Spain</span>
        </div>
      </div>
    </footer>
  );
}
