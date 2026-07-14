import React from 'react';
import Link from 'next/link';

export default function RecreoPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col items-center py-20 px-4">
      {/* Brutalismo Clínico / Blanco Absoluto */}
      <header className="w-full max-w-6xl flex justify-between items-end mb-16 border-b-2 border-black pb-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">El ReCreo</h1>
        <div className="text-right">
          <p className="text-sm font-bold uppercase tracking-widest">Educación Estructural</p>
          <Link href="https://naroagutierrezgil.com" className="text-xs uppercase hover:underline">Volver al Templo ↗</Link>
        </div>
      </header>
      
      <main className="w-full max-w-6xl">
        <section className="mb-12">
          <h2 className="text-2xl font-bold uppercase mb-4">Módulos de Transferencia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="border-2 border-black p-8 hover:bg-black hover:text-white transition-colors duration-300 cursor-pointer">
              <h3 className="text-xl font-black uppercase mb-4">Taller de Técnica PBR</h3>
              <p className="text-sm leading-relaxed opacity-80 mb-8">
                Transducción de pigmentos físicos a materiales `MeshPhysicalMaterial`. Dominio de la luz HDRI sobre oro y resina.
              </p>
              <button className="uppercase text-xs font-bold underline">Reservar Plaza</button>
            </article>
            
            <article className="border-2 border-black p-8 hover:bg-black hover:text-white transition-colors duration-300 cursor-pointer">
              <h3 className="text-xl font-black uppercase mb-4">Escaneo Fotogramétrico</h3>
              <p className="text-sm leading-relaxed opacity-80 mb-8">
                De lienzo 2D a nube de puntos 3D (Gaussian Splats). Captura volumétrica con rigor termodinámico.
              </p>
              <button className="uppercase text-xs font-bold underline">Reservar Plaza</button>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
