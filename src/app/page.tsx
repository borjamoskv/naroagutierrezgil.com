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

      {/* ── MANIFIESTO EDITORIAL (Biografía & Concepto) ── */}
      <section className="relative z-10 px-6 py-40 max-w-5xl mx-auto w-full bg-[#0a0a0c]/50 backdrop-blur-sm border-y border-foreground/5 my-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-5 md:sticky top-40">
            <span className="text-primary font-sans font-light tracking-[0.4em] uppercase text-[10px] mb-6 block">El Ecosistema Creativo</span>
            <h2 className="text-4xl sm:text-5xl font-serif font-light text-foreground leading-snug mb-8">
              Artivismo, <br/><em className="text-primary italic">Materialidad</em> y Pop
            </h2>
            <div className="w-12 h-[1px] bg-primary/50 mb-8" />
            <p className="text-foreground/40 font-sans font-light italic text-sm leading-relaxed">
              "El arte no como un objeto de consumo estático, sino como un dispositivo relacional idóneo para la dinamización comunitaria."
            </p>
          </div>
          
          <div className="md:col-span-7 space-y-12 text-foreground/70 font-sans font-light leading-loose text-lg">
            <p>
              Consolidada en el panorama artístico contemporáneo del País Vasco, Naroa Gutiérrez Gil opera como una figura híbrida que unifica la plástica y la artesanía. Desde su taller <strong className="text-foreground font-medium">ReCreo</strong> en Bilbao —un refugio de experimentación y sanación terapéutica—, subvierte los canales tradicionales del mercado del arte, tejiendo puentes directos entre la producción artesanal de proximidad y el coleccionismo.
            </p>
            <p>
              Su obra explora el género del retrato mediante la estética del hiperrealismo pop. Sin embargo, la verdadera audacia reside en la <strong className="text-foreground font-medium">hibridación matérica</strong>: la sustitución del lienzo clásico por soportes geológicos de alta densidad como la pizarra y la mica mineral. Al plasmar imágenes de la cultura de masas sobre superficies rústicas y milenarias, la volatilidad del pop choca contra la permanencia de la piedra, confiriendo a cada pieza una cualidad táctil y totémica única.
            </p>
            <blockquote className="pl-6 border-l border-primary/30 text-xl font-serif italic text-foreground/90 my-8">
              "La vulnerabilidad de la identidad propia, anclada en la solidez geológica de la mica."
            </blockquote>
            <p>
              Más allá de la mimesis figurativa, su práctica se inscribe en el <strong className="text-foreground font-medium">artivismo feminista</strong>. A través de exposiciones colaborativas y talleres de autorretrato enfocados en mujeres migradas y creadoras locales, su obra busca la reducción de la brecha de género y la transformación psicosocial, demostrando que el retrato contemporáneo es, ante todo, una herramienta activa de empoderamiento colectivo.
            </p>
          </div>
        </div>
      </section>

      {/* ── SCROLLYTELLING (Evolución de la Obra) ── */}
      <ScrollyTelling />

      {/* ── PROCESO DE ENCARGO SUPER NAROA ── */}

      <section id="encargo" className="relative z-10 px-6 py-40 max-w-4xl mx-auto w-full">
        <div className="text-center mb-32">
          <span className="text-primary font-sans font-light tracking-[0.3em] uppercase text-xs mb-6 block">Encargos</span>
          <h2 className="text-4xl sm:text-6xl font-serif font-light text-foreground leading-snug">
            Del píxel al <em className="text-primary italic">mineral</em>
          </h2>
          <p className="text-foreground/50 mt-8 text-lg font-sans font-light leading-relaxed max-w-2xl mx-auto">
            ¿Tienes una foto brutal y quieres convertirla en Hiperrealismo POP? No hago fotocopias con pintura. Le meto carácter, luz y textura sobre pizarra natural. Escríbeme y le damos caña.
          </p>
        </div>

        <div className="space-y-24 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-foreground/10 before:to-transparent">
          {[
            { step: 'I', title: 'La Idea', desc: 'Me pasas por Facebook o mail esa foto que te vuela la cabeza (tu perro, tu pareja, tu ídolo). Cuanta más resolución, mejor.' },
            { step: 'II', title: 'El Planteamiento', desc: 'Hablamos del tamaño, de los brillos de la mica mineral y de cómo vamos a encajarlo en la pizarra. Te doy presupuesto sin compromiso.' },
            { step: 'III', title: 'Pincel y Pizarra', desc: 'Me encierro en el estudio. Te iré pasando avances de la obra para que veas cómo va saliendo del mineral paso a paso.' },
            { step: 'IV', title: 'A tu pared', desc: 'Te lo envío a casa completamente protegido, listo para colgar y romper la estética de tu salón.' }
          ].map((item, i) => (
            <div key={i} className="relative flex items-start md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border border-primary bg-[#141416] text-transparent shrink-0 md:order-1 md:group-odd:-translate-x-[0.6rem] md:group-even:translate-x-[0.6rem] mt-1.5 shadow-[0_0_15px_rgba(198,168,124,0.4)]">
                •
              </div>
              <div className="w-[calc(100%-3rem)] pl-8 md:pl-0 md:w-[calc(50%-4rem)] md:group-odd:pr-12 md:group-even:pl-12 transition-all duration-700">
                <span className="text-primary font-serif italic text-xl mb-2 block">{item.step}.</span>
                <h3 className="font-serif text-foreground text-2xl sm:text-3xl mb-4">{item.title}</h3>
                <p className="text-foreground/50 font-sans font-light leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-40 text-center">
          <a href="https://www.facebook.com/naroagutierrezgil" target="_blank" rel="noopener noreferrer" className="inline-block px-12 py-5 bg-transparent border border-primary text-primary font-sans font-light uppercase tracking-[0.2em] hover:bg-primary hover:text-black transition-all duration-500 shadow-lg">
            Háblame por Facebook
          </a>
          <p className="mt-6 text-foreground/40 text-sm font-sans font-light tracking-wide">O escríbeme a <a href="mailto:naroa@naroa.eu" className="text-primary hover:underline">naroa@naroa.eu</a></p>
        </div>
      </section>

      {/* ── FOOTER ELEGANTE ── */}
      <footer className="py-20 border-t border-foreground/5 bg-[#121214]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-serif font-light tracking-widest text-foreground/80 mb-6">N A R O A</h2>
          <p className="text-foreground/40 font-sans font-light text-sm tracking-wide mb-12">Arte · Hiperrealismo · Pizarra</p>
          <div className="flex flex-wrap justify-center gap-8 text-xs font-sans font-light tracking-[0.2em] uppercase text-foreground/50">
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">Contacto</a>
            <a href="#" className="hover:text-primary transition-colors">Aviso Legal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
