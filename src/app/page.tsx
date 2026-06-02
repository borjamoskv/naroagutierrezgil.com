import Image from 'next/image';
import HeroFluid from '@/components/HeroFluid';
import ScrollyTelling from '@/components/ScrollyTelling';



export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-black">
      
      {/* ── ORGANIC HERO ── */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
        <HeroFluid />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(198,168,124,0.08)_0%,transparent_70%)] z-10 pointer-events-none" />
        
        <div className="relative z-10 text-center px-6 flex flex-col items-center max-w-4xl mx-auto mt-12">
          <span className="text-primary font-sans font-light tracking-[0.4em] uppercase text-xs mb-8">Acrílico sobre pizarra</span>
          
          <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-serif font-light tracking-widest text-foreground leading-none uppercase mb-6 flex flex-wrap justify-center gap-4 sm:gap-8">
            <span>N</span><span>A</span><span>R</span><span>O</span><span>A</span>
          </h1>
          
          <h2 className="text-2xl sm:text-3xl text-foreground/70 font-serif italic font-light tracking-wide mb-16">
            Gutiérrez Gil
          </h2>

          <p className="text-lg sm:text-xl text-foreground/50 font-sans font-light max-w-xl mx-auto mb-20 leading-relaxed">
            Hiperrealismo POP fundido con la naturaleza viva de la mica mineral. Cada obra es un diálogo entre la luz, la textura y el alma.
          </p>

          <a href="#galeria" className="group flex flex-col items-center gap-6 text-foreground/40 hover:text-primary transition-colors duration-500">
            <span className="uppercase font-sans tracking-[0.3em] text-[10px] font-medium">Descubrir Obras</span>
            <div className="w-[1px] h-16 bg-foreground/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-primary animate-[translateY_2.5s_ease-in-out_infinite]" />
            </div>
          </a>
        </div>
      </section>

      {/* ── GALERÍA ORGÁNICA (MASONRY DE AUTOR) ── */}
      <section id="galeria" className="relative z-10 px-4 sm:px-12 py-32 max-w-[1800px] mx-auto w-full">
        <div className="mb-32 text-center">
          <h2 className="text-4xl sm:text-6xl font-serif font-light tracking-wide text-foreground">
            El <em className="text-primary italic">Universo</em> Artístico
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 auto-rows-[300px] sm:auto-rows-[450px]">
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
            <div key={i} className={`${artwork.span} group relative overflow-hidden bg-[#1a1a1c] rounded-sm shadow-xl`}>
              <Image 
                src={`https://naroa.online/assets/${artwork.src}`} 
                alt={artwork.title} 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={100}
                className="object-cover transition-all duration-[2s] grayscale-[0.8] contrast-125 sepia-[.15] group-hover:grayscale-0 group-hover:contrast-100 group-hover:sepia-0 group-hover:scale-105" 
                priority={i < 2} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141416]/90 via-transparent to-transparent z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute bottom-0 left-0 p-8 sm:p-12 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                <h3 className="text-3xl sm:text-5xl font-serif text-foreground mb-3">{artwork.title}</h3>
                <p className="text-primary font-sans font-light tracking-widest text-xs uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">Acrílico sobre pizarra / Mica</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MANIFIESTO EDITORIAL (Ultra Minimalista) ── */}
      <section className="relative z-10 px-6 py-40 max-w-5xl mx-auto w-full border-y border-foreground/5 my-20 text-center">
        <span className="text-primary font-sans font-light tracking-[0.4em] uppercase text-[10px] mb-8 block">Concepto</span>
        <blockquote className="text-3xl sm:text-5xl font-serif font-light text-foreground leading-snug mb-8 max-w-3xl mx-auto">
          "La volatilidad de la cultura pop, anclada en la <em className="text-primary italic">solidez geológica</em> de la pizarra."
        </blockquote>
      </section>

      {/* ── SCROLLYTELLING (Evolución de la Obra) ── */}
      <ScrollyTelling />

      {/* ── FOOTER VISUAL ── */}
      <footer className="relative py-40 overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,168,124,0.05)_0%,transparent_70%)] z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <a 
            href="mailto:naroa@naroa.eu" 
            className="text-5xl sm:text-8xl md:text-[8rem] font-serif font-light tracking-tighter text-foreground/80 hover:text-primary transition-colors duration-700 mb-12 block"
          >
            naroa@naroa.eu
          </a>
          
          <div className="flex flex-wrap justify-center gap-12 text-[10px] font-sans font-light tracking-[0.3em] uppercase text-foreground/40 mt-12">
            <a href="https://www.instagram.com/naroagutierrezgil" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-500">Instagram</a>
            <a href="https://www.facebook.com/naroagutierrezgil" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-500">Facebook</a>
            <a href="#" className="hover:text-primary transition-colors duration-500">Aviso Legal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
