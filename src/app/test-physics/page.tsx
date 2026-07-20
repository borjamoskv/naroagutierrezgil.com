'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

const SplatPhysicsTester = dynamic(() => import('@/components/SplatPhysicsTester'), { ssr: false });

export default function TestPhysicsPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#EAEAEA] font-sans selection:bg-primary selection:text-white flex flex-col justify-between py-12 px-6">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto w-full z-50 flex justify-between items-center mb-12">
        <Link 
          href="/" 
          className="group flex items-center gap-4 text-white/50 hover:text-white transition-colors duration-500 cursor-pointer"
        >
          <div className="w-8 h-[1px] bg-white/30 group-hover:bg-primary group-hover:w-16 transition-all duration-700" />
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase">Retorno</span>
        </Link>
        <span className="font-mono text-[9px] tracking-[0.2em] text-white/30">C5-REAL // EXPERIMENTO LAB 01</span>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center w-full z-10 my-auto">
        <SplatPhysicsTester />
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center mt-12 text-[9px] tracking-[0.3em] uppercase text-white/20 select-none">
        Laboratorio de Física Splat WebGPU — Forjado en 2026
      </footer>
    </div>
  );
}
