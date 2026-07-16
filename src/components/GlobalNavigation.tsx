"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ScrollAwareHeader from './ScrollAwareHeader';

export default function GlobalNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const scrollToTop = () => {
    if (pathname === '/') {
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  const scrollToAlcove = () => {
    if (pathname === '/') {
      if (typeof document !== 'undefined') {
        document.getElementById('alcove-system')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push('/#alcove-system');
    }
  };

  return (
    <ScrollAwareHeader className="fixed top-6 left-1/2 -translate-x-1/2 w-auto px-2 py-2 flex items-center z-[210] pointer-events-auto select-none text-white rounded-full animate-[fadeIn_1.5s_ease-out_both] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] border border-white/10">
      <div className="flex items-center gap-1">
        <Link href="/" className="group flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-[var(--primary)] transition-colors duration-300 ml-1 mr-2" aria-label="Volver al inicio">
          <span className="font-sans text-sm font-black text-white group-hover:text-black transition-colors duration-300">N</span>
        </Link>

        <button
          onClick={scrollToTop}
          className="font-mono text-[9.5px] tracking-[0.2em] uppercase bg-transparent hover:bg-white/10 text-white/60 hover:text-white px-4 py-2.5 transition-all duration-300 cursor-pointer rounded-full"
          aria-label="Ir arriba"
        >
          Inicio
        </button>

        <button
          onClick={scrollToAlcove}
          className="font-mono text-[9.5px] tracking-[0.2em] uppercase bg-transparent hover:bg-white/10 text-white/60 hover:text-white px-4 py-2.5 transition-all duration-300 cursor-pointer rounded-full"
          aria-label="Ir a sección de obras"
        >
          Obra
        </button>

        <Link
          href="/biografia"
          className="font-mono text-[9.5px] tracking-[0.2em] uppercase bg-transparent hover:bg-white/10 text-white/60 hover:text-white px-4 py-2.5 transition-all duration-300 cursor-pointer rounded-full"
        >
          Trayectoria
        </Link>

        <Link
          href="/autodidact"
          className="font-mono text-[9.5px] tracking-[0.2em] uppercase bg-transparent hover:bg-white/10 text-white/60 hover:text-white px-4 py-2.5 transition-all duration-300 cursor-pointer rounded-full"
        >
          Filosofía
        </Link>

        <Link
          href="/recreo"
          className="font-mono text-[9.5px] tracking-[0.2em] uppercase bg-transparent hover:bg-white/10 text-white/60 hover:text-white px-4 py-2.5 transition-all duration-300 cursor-pointer rounded-full"
        >
          El ReCreo
        </Link>

        <Link
          href="/shop"
          className="font-mono text-[9.5px] tracking-[0.2em] uppercase bg-transparent hover:bg-white/10 text-white/60 hover:text-white px-4 py-2.5 transition-all duration-300 cursor-pointer rounded-full"
        >
          Bóveda
        </Link>

        <Link
          href="/blog"
          className="font-mono text-[9.5px] tracking-[0.2em] uppercase bg-transparent hover:bg-white/10 text-white/60 hover:text-white px-4 py-2.5 transition-all duration-300 cursor-pointer rounded-full"
        >
          Blog
        </Link>

        <Link
          href="/contacto"
          className="ml-2 font-mono text-[9.5px] tracking-[0.2em] uppercase bg-[var(--primary)] hover:bg-white text-white hover:text-black px-5 py-2.5 transition-all duration-300 cursor-pointer rounded-full font-bold shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_0_20px_rgba(255,255,255,0.6)]"
        >
          Contacto
        </Link>
      </div>
    </ScrollAwareHeader>
  );
}
