'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import useLenis from '@/hooks/useLenis';
import HeroFluid from '@/components/HeroFluid';
import ScrollReveal from '@/components/ScrollReveal';
import Footer from '@/components/Footer';

interface BlogPost {
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  image: string;
  url: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    title: "Bwall Collective en el Dock: brotes de alma y manos",
    date: "01/06/2026",
    category: "Exposiciones",
    tags: ["Colectiva", "Dock Bilbao", "Feminismo", "Olatz Arrese"],
    excerpt: "Nuevas sinergias y colisiones artísticas de tinte femenino en Dock Bilbao. Siete creadoras visuales germinan muros con arte y ritmo de vinilo.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2026/05/whatsapp-image-2026-05-27-at-15.00.32.jpeg?w=800",
    url: "https://naroagutierrez.wordpress.com/2026/06/01/bwall-collective-en-el-dock-brotes-de-alma-y-manos/"
  },
  {
    title: "Autorretratos: Mujeres a través del Espejo",
    date: "14/05/2026",
    category: "Talleres",
    tags: ["Marienea", "Identidad", "Autorretrato", "Sanación"],
    excerpt: "Un viaje íntimo frente al espejo gestado en Marienea (Basauri). Un ramillete de mujeres valientes indaga en su propia identidad plasmando sus almas en libretas.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2026/05/autorretratos-marienea-png.png?w=800",
    url: "https://naroagutierrez.wordpress.com/2026/05/14/autorretratos-mujeres-a-traves-del-espejo/"
  },
  {
    title: "Muestra «DiviNos VaiVenes» en Politena",
    date: "15/01/2026",
    category: "Exposiciones",
    tags: ["Individual", "Politena", "Pizarra", "Pop"],
    excerpt: "Selección de retratos pop sobre pizarra y soportes recuperados en el espacio Politena de Bilbao. Un recorrido por miradas intensas y relieves lágricos.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2026/01/6-foto-100-auto.jpg?w=800",
    url: "https://naroagutierrez.wordpress.com/2026/01/15/divinos-vaivenes-muestra-plastica-en-politena-espacio-de-arte/"
  },
  {
    title: "Azoka en Lataska, Sopela",
    date: "22/05/2025",
    category: "Encuentros",
    tags: ["Sopela", "Lataska", "Feria", "Artesanía"],
    excerpt: "Domingos de arte con aroma costero y sabor a hogar. Piezas únicas sobre pizarra, láminas Fine Art y encuentro matérico junto al mar.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2025/05/0-aazoka-en-lataska.png?w=800",
    url: "https://naroagutierrez.wordpress.com/2025/05/22/25-mayo-2025-azoka-en-lataska-sopela/"
  },
  {
    title: "Udaberriko Jaia 2025: Market en Sopelana",
    date: "09/05/2025",
    category: "Encuentros",
    tags: ["Sopela", "Market", "Primavera", "Diseño"],
    excerpt: "Celebrando la llegada del buen tiempo en Uribe Kosta. Una exhibición al aire libre de piezas limitadas y obras en técnica mixta.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2026/05/gif-olatz-flores-para-gif.gif",
    url: "https://naroagutierrez.wordpress.com/2025/05/09/udaberriko-jaia-2025-market-en-sopelana-18-de-mayo/"
  },
  {
    title: "El ReCreo: Espacio de Creación para recreArte",
    date: "12/01/2024",
    category: "Talleres",
    tags: ["Formación", "Yo Pinto Mucho", "Kintsugi Pedagógico", "Libre"],
    excerpt: "Nace un refugio de acompañamiento creativo libre en Uribarri. Un espacio multigeneracional para jugar con la pintura y revalorizar el error.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2024/01/el-recreo5.jpg?w=800",
    url: "https://naroagutierrez.wordpress.com/2024/01/12/el-recreo-espacio-de-creacion-para-recrearte/"
  },
  {
    title: "Muestra Colectiva «Emakumeen arteaN»",
    date: "16/12/2022",
    category: "Exposiciones",
    tags: ["Feminismo", "Colectiva", "Uribarri", "Mujeres Artistas"],
    excerpt: "Encuentro y visibilización de creadoras locales en el corazón de Bilbao. Una muestra que celebra el poder colectivo del arte femenino.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2026/05/foto-grupo-ok.png?w=800",
    url: "https://naroagutierrez.wordpress.com/2022/12/16/muestra-colectiva-emakumeen-artean/"
  },
  {
    title: "Repóker de Reinas: VAIVENES en Siarte",
    date: "22/03/2022",
    category: "Exposiciones",
    tags: ["Siarte", "Pop", "Espejo", "Retratos"],
    excerpt: "Cinco reinas y cinco miradas pop cargadas de turbulencias internas. Retratos en tensión que desafían los moldes y los reflejos del alma.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2026/05/gif-2022.gif",
    url: "https://naroagutierrez.wordpress.com/2022/03/22/repoker-de-reinas-vaivenes-en-siarte/"
  }
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useLenis();

  // Track cursor position to update subtle ambient glows
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const categories = ['Todos', 'Exposiciones', 'Talleres', 'Encuentros'];

  const filteredPosts = selectedCategory === 'Todos'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden relative">
      {/* Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute w-[600px] h-[600px] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[180px] opacity-10 transition-transform duration-500 ease-out" 
          style={{
            transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)`,
          }}
        />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.05]" />
        <HeroFluid />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 p-6 sm:p-12 mix-blend-difference flex justify-between items-center">
        <Link 
          href="/" 
          className="group flex items-center gap-4 text-white/50 hover:text-white transition-colors duration-500"
        >
          <div className="w-8 h-[1px] bg-white/30 group-hover:bg-[#2B3BE5] group-hover:w-16 transition-all duration-700" />
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase">Retorno al Laboratorio</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/biografia" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">Biografía</Link>
          <Link href="/autodidact" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">Autodidacta</Link>
          <Link href="/contacto" className="font-sans text-[9px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-500">Contacto</Link>
        </div>
      </nav>

      <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-40 pb-32">
        {/* HEADER */}
        <header className="mb-24 relative pt-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E')] opacity-20 mix-blend-soft-light pointer-events-none" />
          <div className="absolute -left-6 sm:-left-12 top-0 w-[2px] h-full bg-gradient-to-b from-[#2B3BE5] via-[#2B3BE5]/20 to-transparent" />
          
          <span className="font-mono text-[10px] tracking-[0.5em] uppercase text-[#2B3BE5] block mb-4 animate-[fadeIn_1s_ease-out]">
            Diario de Procesos y Alquimia
          </span>
          <h1 className="text-[12vw] md:text-[8rem] font-serif font-light leading-[0.8] tracking-tighter uppercase mb-8 drop-shadow-2xl select-none relative">
            <span className="flex overflow-hidden">
              <span className="animate-[slideUp_1.5s_cubic-bezier(0.16,1,0.3,1)_0.1s_both] text-transparent [-webkit-text-stroke:1px_rgba(234,234,234,0.3)] hover:[-webkit-text-stroke:1px_#2B3BE5] transition-all duration-1000 cursor-default chromatic-text">Bitácora</span>
            </span>
          </h1>
          <p className="max-w-2xl text-lg font-light tracking-wide text-white/60 leading-relaxed mt-10 border-l border-[#2B3BE5]/30 pl-8 py-2 relative">
            <span className="absolute -left-[1px] top-0 w-[2px] h-1/3 bg-[#2B3BE5] shadow-[0_0_10px_#2B3BE5]" />
            Crónicas artísticas, talleres de creación libre y reflexiones sobre la pizarra, la mica y la mirada humana desde Bilbao.
          </p>
        </header>

        {/* CATEGORY FILTER */}
        <div className="mb-16 flex flex-wrap gap-4 border-b border-white/10 pb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`relative font-mono text-[10px] tracking-widest uppercase py-2.5 px-6 rounded-full transition-all duration-500 cursor-pointer overflow-hidden border ${
                selectedCategory === category
                  ? 'bg-[#2B3BE5] text-white border-[#2B3BE5] shadow-[0_0_20px_rgba(43,59,229,0.3)]'
                  : 'bg-black/35 text-white/50 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* POSTS GRID */}
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, i) => (
              <article
                key={i}
                className="group relative bg-[#090909]/80 border border-white/15 hover:border-[#2B3BE5]/30 hover:bg-black/90 transition-all duration-700 flex flex-col justify-between overflow-hidden min-h-[480px] rounded-sm"
              >
                {/* Visual hover background lines */}
                <div className="absolute inset-0 bg-[#2B3BE5] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] opacity-[0.02] pointer-events-none" />
                
                <div>
                  {/* Thumbnail Image */}
                  <div className="relative aspect-[16/10] w-full bg-[#121212] overflow-hidden border-b border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image}
                      alt={post.title}
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.2s] ease-out"
                    />
                    <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-sm">
                      <span className="font-mono text-[8px] tracking-widest uppercase text-[#2B3BE5] font-semibold">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content details */}
                  <div className="p-8 space-y-4">
                    <span className="font-mono text-[9px] tracking-widest text-white/40 block">
                      {post.date}
                    </span>
                    <h2 className="text-2xl font-serif text-white/90 group-hover:text-[#2B3BE5] transition-colors duration-500 leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-white/50 text-sm font-light leading-relaxed font-sans">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Tags and Action link */}
                <div className="p-8 pt-0 space-y-6">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag, tagIdx) => (
                      <span 
                        key={tagIdx} 
                        className="font-mono text-[7px] tracking-widest uppercase bg-white/[0.04] text-white/40 px-2 py-0.5 rounded-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 font-mono text-[9px] tracking-[0.2em] uppercase text-primary hover:text-white transition-colors duration-500 group/link"
                  >
                    <span>Leer artículo completo</span>
                    <span className="transform translate-x-0 group-hover/link:translate-x-2 transition-transform duration-500">→</span>
                  </a>
                </div>

                {/* Top border glowing highlight */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#2B3BE5] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              </article>
            ))}
          </div>
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
}
