"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ScrollAwareHeader from './ScrollAwareHeader';
import AudioSynthesizer from './AudioSynthesizer';

export default function GlobalNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const scrollToTop = () => {
    if (pathname === '/') {
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };


  return (
    <>
      <AudioSynthesizer isPlaying={isPlayingAudio} />
      <ScrollAwareHeader className="fixed top-6 left-1/2 -translate-x-1/2 w-auto px-2 py-2 flex items-center z-[210] pointer-events-auto select-none text-[#F5F5F5] rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border border-white/10 bg-black/50 backdrop-blur-md">
      <div className="flex items-center gap-1">
        <Link href="/" className="group flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-[#F59E0B] transition-colors duration-300 ml-1 mr-2" aria-label="Volver al inicio">
          <span className="font-sans text-sm font-black text-[#F5F5F5] group-hover:text-[#0A0A0A] transition-colors duration-300">N</span>
        </Link>

        <button
          onClick={scrollToTop}
          className="font-mono text-[9.5px] tracking-[0.2em] uppercase bg-transparent hover:bg-white/5 text-[#F5F5F5]/60 hover:text-[#F5F5F5] px-4 py-2.5 transition-all duration-300 cursor-pointer rounded-full"
          aria-label="Ir arriba"
        >
          Inicio
        </button>

        <Link
          href="/obra"
          className={`font-mono text-[9.5px] tracking-[0.2em] uppercase px-4 py-2.5 transition-all duration-300 cursor-pointer rounded-full ${
            pathname === '/obra' ? 'bg-[#F59E0B] text-[#0A0A0A] font-bold' : 'bg-transparent hover:bg-white/5 text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
          }`}
        >
          Obra
        </Link>

        <Link
          href="/biografia"
          className="font-mono text-[9.5px] tracking-[0.2em] uppercase bg-transparent hover:bg-white/5 text-[#F5F5F5]/60 hover:text-[#F5F5F5] px-4 py-2.5 transition-all duration-300 cursor-pointer rounded-full"
        >
          Biografía
        </Link>

        <Link
          href="/blog"
          className="font-mono text-[9.5px] tracking-[0.2em] uppercase bg-transparent hover:bg-white/5 text-[#F5F5F5]/60 hover:text-[#F5F5F5] px-4 py-2.5 transition-all duration-300 cursor-pointer rounded-full"
        >
          Blog
        </Link>

        <button
          onClick={toggleAudio}
          className={`ml-2 px-3 py-2 text-[9px] font-mono tracking-widest rounded-full transition-all duration-300 flex items-center gap-1.5 ${
            isPlayingAudio
              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50'
              : 'bg-white/5 text-white/40 hover:text-white border border-white/10'
          }`}
          title="Sonido de ambiente mineral"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isPlayingAudio ? 'bg-[#F59E0B] animate-ping' : 'bg-white/40'}`}></span>
          <span>{isPlayingAudio ? 'AUDIO ON' : 'AUDIO'}</span>
        </button>

        <Link
          href="/contacto"
          className="ml-2 font-mono text-[9.5px] tracking-[0.2em] uppercase bg-[#2B3BE5] hover:bg-[#F59E0B] text-white hover:text-[#0A0A0A] px-5 py-2.5 transition-all duration-300 cursor-pointer rounded-full font-bold shadow-[0_0_15px_rgba(43,59,229,0.4)]"
        >
          Contacto
        </Link>
      </div>
    </ScrollAwareHeader>
    </>
  );
}
