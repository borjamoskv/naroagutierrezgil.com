'use client';

import { useState, useEffect } from 'react';
import useLenis from '@/hooks/useLenis';
import HeroFluid from '@/components/HeroFluid';
import ScrollReveal from '@/components/ScrollReveal';
import Footer from '@/components/Footer';
import GlobalNavigation from '@/components/GlobalNavigation';
import { BlogPost } from '@/lib/blogData';


interface BlogClientProps {
  initialPosts: BlogPost[];
}

export default function BlogClient({ initialPosts }: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'embed'>('grid');
  const [readerPost, setReaderPost] = useState<BlogPost | null>(null);
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
    ? initialPosts
    : initialPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden relative">
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

      <GlobalNavigation />

      <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-40 pb-32">
        {/* HEADER */}
        <header className="mb-16 relative pt-20">
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-20 mix-blend-soft-light pointer-events-none" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
          />
          <div className="absolute -left-6 sm:-left-12 top-0 w-[2px] h-full bg-gradient-to-b from-[#2B3BE5] via-[#2B3BE5]/20 to-transparent" />
          
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_10px_#39FF14] animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#2B3BE5]">
              WordPress Live Sync · naroagutierrez.wordpress.com
            </span>
          </div>

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

        {/* SOTA CONTROL BAR & VIEW SWITCHER */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md">
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('grid')}
              className={`font-mono text-[10px] tracking-widest uppercase py-2.5 px-6 rounded-full transition-all duration-500 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#2B3BE5] text-white shadow-[0_0_20px_rgba(43,59,229,0.4)]'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:text-white'
              }`}
            >
              📰 Vista Grid SOTA
            </button>
            <button
              onClick={() => setViewMode('embed')}
              className={`font-mono text-[10px] tracking-widest uppercase py-2.5 px-6 rounded-full transition-all duration-500 cursor-pointer ${
                viewMode === 'embed'
                  ? 'bg-[#2B3BE5] text-white shadow-[0_0_20px_rgba(43,59,229,0.4)]'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:text-white'
              }`}
            >
              🌐 Embed WordPress Live
            </button>
          </div>

          <a
            href="https://naroagutierrez.wordpress.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] tracking-widest uppercase text-white/60 hover:text-primary transition-colors flex items-center gap-2"
          >
            <span>↗ Abrir en WordPress.com</span>
          </a>
        </div>

        {/* CATEGORY FILTER (Grid Mode) */}
        {viewMode === 'grid' && (
          <div className="mb-16 flex flex-wrap gap-4 border-b border-white/10 pb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`relative font-mono text-[10px] tracking-widest uppercase py-2 px-5 rounded-full transition-all duration-500 cursor-pointer overflow-hidden border ${
                  selectedCategory === category
                    ? 'bg-[#2B3BE5] text-white border-[#2B3BE5] shadow-[0_0_20px_rgba(43,59,229,0.3)]'
                    : 'bg-black/35 text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* EMBED MODE: Interactive Live Iframe */}
        {viewMode === 'embed' && (
          <div className="relative w-full h-[75vh] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black mb-16">
            <iframe
              src="https://naroagutierrez.wordpress.com/"
              className="w-full h-full border-none"
              title="WordPress Live Embed Naroa Gutierrez Gil"
              loading="lazy"
            />
          </div>
        )}

        {/* POSTS GRID */}
        {viewMode === 'grid' && (
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
                      <p className="text-white/50 text-xs sm:text-sm font-light leading-relaxed font-sans max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] overflow-hidden">
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
                      href={`/blog/${post.slug}`}
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
        )}
      </main>

      <Footer />
    </div>
  );
}
