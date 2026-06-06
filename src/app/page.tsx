import Image from 'next/image';
import HeroFluid from '@/components/HeroFluid';
import ScrollyTelling from '@/components/ScrollyTelling';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-black">
      
      {/* ── ORGANIC HERO ── */}
      <section className="relative w-full min-h-[95vh] flex items-center justify-center overflow-hidden">
        <HeroFluid />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(198,168,124,0.12)_0%,transparent_60%)] z-10 pointer-events-none mix-blend-screen" />
        
        <div className="relative z-10 text-center px-6 flex flex-col items-center justify-center max-w-5xl mx-auto mt-12 w-full h-full">
          <span className="text-primary font-sans font-light tracking-[0.6em] uppercase text-xs mb-8 opacity-80 mix-blend-plus-lighter animate-[fadeIn_2s_ease-out]">Acrílico sobre pizarra</span>
          
          <h1 className="text-[5rem] sm:text-[8rem] md:text-[12rem] font-serif font-light tracking-widest text-foreground leading-none uppercase mb-2 flex flex-wrap justify-center gap-4 sm:gap-8 mix-blend-plus-lighter">
            <span className="animate-[slideUp_1s_ease-out_0.1s_both]">N</span>
            <span className="animate-[slideUp_1s_ease-out_0.2s_both]">A</span>
            <span className="animate-[slideUp_1s_ease-out_0.3s_both]">R</span>
            <span className="animate-[slideUp_1s_ease-out_0.4s_both]">O</span>
            <span className="animate-[slideUp_1s_ease-out_0.5s_both]">A</span>
          </h1>
          
          <h2 className="text-2xl sm:text-4xl text-foreground/50 font-serif italic font-light tracking-[0.2em] mb-24 animate-[fadeIn_2s_ease-out_1s_both]">
            Gutiérrez Gil
          </h2>

          <a href="#galeria" className="group flex flex-col items-center gap-6 text-foreground/30 hover:text-primary transition-colors duration-700 animate-[fadeIn_3s_ease-out_1.5s_both]">
            <span className="uppercase font-sans tracking-[0.4em] text-[9px] font-medium">Excavar la Materia</span>
            <div className="w-[1px] h-24 bg-foreground/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-primary animate-[translateY_3s_ease-in-out_infinite]" />
            </div>
          </a>
        </div>
      </section>

      {/* ── GALERÍA ORGÁNICA (MASONRY DE AUTOR) ── */}
      <section id="galeria" className="relative z-10 px-4 sm:px-12 py-32 max-w-[1800px] mx-auto w-full">
        <div className="mb-40 text-center flex flex-col items-center">
          <span className="text-primary font-sans font-light tracking-[0.4em] uppercase text-xs mb-6 opacity-60">Portfolio</span>
          <h2 className="text-5xl sm:text-7xl font-serif font-light tracking-wide text-foreground leading-tight max-w-2xl mx-auto">
            Materia <em className="text-primary italic">Revelada</em>
          </h2>
          <div className="w-px h-16 bg-gradient-to-b from-primary/30 to-transparent mt-12"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 auto-rows-[350px] sm:auto-rows-[500px]">
          {/* GALERÍA MASIVA Y DINÁMICA SOTA */}
          {[
            { src: 'hq-james-CjsTrO7r.webp', title: 'James Dean', span: 'md:col-span-8 row-span-2' },
            { src: 'hq-amy-BRTriASV.webp', title: 'Amy Winehouse', span: 'md:col-span-4 row-span-1' },
            { src: 'hq-portrait-1-bV-_WHlX.webp', title: 'Retrato I', span: 'md:col-span-4 row-span-1' },
            { src: 'el-gran-dakari-C1tAWAhR.webp', title: 'El Gran Dakari', span: 'md:col-span-6 row-span-1' },
            { src: 'hq-johnny-5ueL8eU0.webp', title: 'Johnny Depp', span: 'md:col-span-6 row-span-1' },
            { src: 'marilyn-rocks--qPeLHxE.webp', title: 'Marilyn Rocks', span: 'md:col-span-12 row-span-2' },
            { src: 'audrey-hepburn-DbIBTtIp.webp', title: 'Audrey Hepburn', span: 'md:col-span-4 row-span-1' },
            { src: 'geisha-MfRtKWdu.webp', title: 'Geisha', span: 'md:col-span-4 row-span-1' },
            { src: 'lagrimas-de-oro-DikHc-Tk.webp', title: 'Lágrimas de Oro', span: 'md:col-span-4 row-span-1' },
            { src: 'love-DA7L_L5F.webp', title: 'Love', span: 'md:col-span-6 row-span-1' },
            { src: 'la-pensadora-CFHSnMA0.webp', title: 'La Pensadora', span: 'md:col-span-6 row-span-1' },
            { src: 'amor-en-conserva-CMHRIKXx.webp', title: 'Amor en Conserva', span: 'md:col-span-3 row-span-1' },
            { src: 'baroque-farrokh-mjg4ClA9.webp', title: 'Baroque Farrokh', span: 'md:col-span-3 row-span-1' },
            { src: 'cantinflas-0-D712oJYO.webp', title: 'Cantinflas', span: 'md:col-span-3 row-span-1' },
            { src: 'dar-la-lata-DxWlKgS-.webp', title: 'Dar la Lata', span: 'md:col-span-3 row-span-1' },
            { src: 'mr-fahrenheit-BzcoVisa.webp', title: 'Mr Fahrenheit', span: 'md:col-span-4 row-span-1' },
            { src: 'celia-cruz-cantinflowers-DO-SRKMB.webp', title: 'Celia Cruz', span: 'md:col-span-4 row-span-1' },
            { src: 'tedas-queen-GT9W8egT.webp', title: 'Tedas Queen', span: 'md:col-span-4 row-span-1' },
            { src: 'hammock-in-tin-XD5nAoyg.webp', title: 'Hammock', span: 'md:col-span-6 row-span-2' },
            { src: 'sardine-tin-collage-Bo41LZ-o.webp', title: 'Sardine Tin Collage', span: 'md:col-span-6 row-span-1' },
            { src: 'en-caja-CDdrJMsP.webp', title: 'En Caja', span: 'md:col-span-6 row-span-1' },
            { src: 'soy-un-amor-y-tengo-alas-ItTo7aOd.webp', title: 'Soy un Amor', span: 'md:col-span-4 row-span-1' },
            { src: 'the-golden-couple-C9C95N75.webp', title: 'The Golden Couple', span: 'md:col-span-4 row-span-1' },
            { src: 'pink-and-sparkles-c4K6RUzC.webp', title: 'Pink & Sparkles', span: 'md:col-span-4 row-span-1' },
            { src: 'monster-dragon-QQiqdImO.webp', title: 'Monster Dragon', span: 'md:col-span-12 row-span-2' }
          ].map((artwork, i) => (
            <div key={i} className={`${artwork.span} group relative overflow-hidden bg-[#080809] rounded-sm ring-1 ring-white/5 shadow-2xl`}>
              <Image 
                src={`https://naroa.online/assets/${artwork.src}`} 
                alt={artwork.title} 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={100}
                className="object-cover transition-all duration-[3s] grayscale-[1] contrast-150 brightness-50 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 group-hover:scale-110" 
                priority={i < 2} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/20 to-transparent z-10 opacity-90 group-hover:opacity-40 transition-opacity duration-1000 mix-blend-multiply" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(198,168,124,0.15)_0%,transparent_50%)] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              
              <div className="absolute bottom-0 left-0 p-8 sm:p-14 z-20 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-1000 ease-out">
                <span className="text-primary/70 font-sans tracking-[0.3em] uppercase text-[9px] mb-4 block opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-300">Acrílico sobre piedra</span>
                <h3 className="text-3xl sm:text-5xl font-serif text-foreground mb-1 font-light tracking-wide drop-shadow-2xl">{artwork.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEPARADOR VISUAL ── */}
      <div className="relative w-full py-20 flex justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,168,124,0.03)_0%,transparent_50%)] z-0 pointer-events-none" />
        <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent relative z-10"></div>
      </div>

      {/* ── SCROLLYTELLING (Evolución de la Obra) ── */}
      <ScrollyTelling />

      {/* ── FOOTER VISUAL ── */}
      <footer className="relative pt-40 pb-20 overflow-hidden bg-[#030303] border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(198,168,124,0.08)_0%,transparent_60%)] z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <span className="text-primary font-sans font-light tracking-[0.4em] uppercase text-xs mb-8 opacity-60">Comisiones Privadas</span>
          <a 
            href="mailto:naroa@naroa.eu" 
            className="text-4xl sm:text-6xl md:text-[7rem] font-serif font-light tracking-tighter text-foreground/70 hover:text-primary transition-colors duration-1000 mb-20 block hover:tracking-normal"
          >
            naroa@naroa.eu
          </a>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-3xl pt-12 border-t border-white/5 text-foreground/30 font-sans text-xs tracking-widest uppercase">
            <span>© 2026 Naroa Gutiérrez Gil</span>
            <span className="mt-4 sm:mt-0">Bilbao, Spain</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
