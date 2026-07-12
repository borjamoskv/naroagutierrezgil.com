'use client';

import { useEffect, useState } from 'react';

interface WPPost {
  title: string;
  link: string;
  pubDate: string;
  image: string;
}

export default function WordPressFeedClient() {
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wp')
      .then(res => res.json())
      .then(data => {
        if (data.items) setPosts(data.items);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load WP posts', err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="w-full h-48 flex items-center justify-center border border-white/5 bg-[#050505] animate-pulse relative z-20 max-w-7xl mx-auto mt-12 mb-24 rounded-sm">
      <span className="font-mono text-[9px] text-[var(--primary)] uppercase tracking-widest">Sintonizando señal de WordPress...</span>
    </div>
  );

  if (posts.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 mt-12 mb-24 relative z-20">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-4">
        <div>
          <h3 className="font-mono text-[10px] tracking-widest text-[var(--primary)] uppercase mb-2">Transmisión en directo</h3>
          <h2 className="font-sans text-3xl md:text-4xl font-bold uppercase text-white">Últimas Entradas del Blog</h2>
        </div>
        <a href="https://naroagutierrez.wordpress.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono tracking-widest uppercase hover:text-[var(--primary)] transition-colors mt-4 md:mt-0 flex items-center gap-2 text-white/50">
          Ver archivo completo
          <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <a 
            key={i} 
            href={post.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative flex flex-col bg-[#0a0a0a] border border-white/5 hover:border-[var(--primary)]/50 transition-all duration-500 overflow-hidden rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          >
            <div className="h-56 w-full overflow-hidden relative bg-black">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-60 filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                style={{ backgroundImage: `url(${post.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              
              <div className="absolute top-4 left-4">
                <span className="font-mono text-[8px] tracking-widest text-black bg-[var(--primary)] px-2 py-1 uppercase">Crónica</span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-grow relative">
              <span className="font-mono text-[9px] tracking-widest text-[var(--primary)] mb-3">{post.pubDate}</span>
              <h4 className="font-sans text-lg font-bold text-white uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors line-clamp-3 leading-tight">
                {post.title}
              </h4>
              <div className="mt-8 flex items-center text-white/30 group-hover:text-white transition-colors">
                <span className="font-mono text-[9px] tracking-widest uppercase">Leer más en WordPress</span>
                <svg className="ml-2 w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
