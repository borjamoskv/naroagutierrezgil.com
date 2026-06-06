import Image from 'next/image';
import HeroFluid from '@/components/HeroFluid';
import ScrollyTelling from '@/components/ScrollyTelling';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-black">
      
      {/* ── SOTA ANTI-TEMPLATE HERO ── */}
      <section className="relative w-full h-screen flex flex-col justify-between overflow-hidden px-6 sm:px-12 py-12">
        <HeroFluid />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(198,168,124,0.15)_0%,transparent_50%)] z-0 pointer-events-none mix-blend-color-dodge" />
        
        {/* Top Header - Microtypography */}
        <div className="relative z-10 w-full flex justify-between items-start animate-[fadeIn_2s_ease-out]">
          <span className="text-foreground/40 font-sans tracking-[0.2em] text-[9px] uppercase">Acrílico sobre pizarra</span>
          <span className="text-foreground/40 font-sans tracking-[0.2em] text-[9px] uppercase">Bilbao</span>
        </div>
        
        {/* Center - Massive Editorial Typography */}
        <div className="relative z-10 flex flex-col items-start w-full max-w-[1800px] mx-auto mt-20 mb-auto min-h-[50vh] justify-center">
          <h1 className="relative flex flex-col w-full text-[15vw] leading-[0.75] font-serif font-light tracking-tighter uppercase select-none">
            
            {/* Naroa: Esqueleto Outline */}
            <span className="flex overflow-hidden z-10">
              <span className="animate-[slideUp_1.5s_cubic-bezier(0.16,1,0.3,1)_0.1s_both] text-transparent [-webkit-text-stroke:1px_var(--color-foreground)] sm:[-webkit-text-stroke:2px_var(--color-foreground)] opacity-50 mix-blend-difference">Naroa</span>
            </span>
            
            {/* Gutiérrez: Firma Dorada Flotante Masiva */}
            <span className="absolute top-[20%] left-[5%] sm:left-[12%] z-30 pointer-events-none w-full">
              <span className="inline-block animate-[slideUp_2s_cubic-bezier(0.16,1,0.3,1)_0.4s_both] text-primary font-hand normal-case tracking-normal text-[26vw] sm:text-[22vw] -rotate-6 drop-shadow-[0_20px_50px_rgba(198,168,124,0.5)] mix-blend-screen">Gutiérrez</span>
            </span>
            
            {/* Gil: Sólido, Extremo Derecho */}
            <span className="flex overflow-hidden self-end mr-[2vw] sm:mr-[8vw] z-20 mt-[2vw]">
              <span className="animate-[slideUp_1.5s_cubic-bezier(0.16,1,0.3,1)_0.2s_both] text-foreground mix-blend-difference">Gil</span>
            </span>
          </h1>
        </div>

        {/* Bottom - Scroll */}
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-end items-end mt-auto max-w-[1800px] mx-auto animate-[fadeIn_3s_ease-out_1s_both]">
          <a href="#galeria" className="group flex items-center gap-6 text-foreground/30 hover:text-primary transition-colors duration-700 cursor-pointer">
            <span className="uppercase font-sans tracking-[0.4em] text-[9px] font-medium rotate-180 [writing-mode:vertical-rl]">Descender</span>
            <div className="w-[1px] h-32 bg-foreground/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-primary animate-[translateY_2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
            </div>
          </a>
        </div>
      </section>

      {/* ── GALERÍA ORGÁNICA (MASONRY DE AUTOR) ── */}
      <section id="galeria" className="relative z-10 px-4 sm:px-12 py-32 max-w-[1800px] mx-auto w-full">
        <div className="mb-40 text-center flex flex-col items-center">
          <h2 className="text-5xl sm:text-7xl font-serif font-light tracking-wide text-foreground leading-tight max-w-2xl mx-auto uppercase">
            Obras
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
                <span className="text-primary/70 font-sans tracking-[0.3em] uppercase text-[9px] mb-4 block opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-300">Acrílico sobre pizarra</span>
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
