import React from 'react';
import Link from 'next/link';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col items-center py-20 px-4">
      {/* Brutalismo Clínico / Blanco Absoluto */}
      <header className="w-full max-w-6xl flex justify-between items-end mb-16 border-b-2 border-black pb-4">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Bóveda Transaccional</h1>
        <div className="text-right">
          <p className="text-sm font-bold uppercase tracking-widest">Estado: C5-REAL</p>
          <Link href="https://naroagutierrezgil.com" className="text-xs uppercase hover:underline">Volver al Templo ↗</Link>
        </div>
      </header>
      
      <main className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Placeholder para Obras C5-REAL */}
        {[
          { id: 'paul-newmum', title: 'Paul Newmum', price: '4.500€', status: 'Adquirir Materia' },
          { id: 'summer-monroe', title: 'Summer Monroe', price: '3.800€', status: 'Adquirir Materia' },
          { id: 'la-famiglia', title: 'La Famiglia', price: '5.200€', status: 'Adquirir Materia' }
        ].map((obra) => (
          <article key={obra.id} className="border-2 border-black p-6 flex flex-col justify-between hover:bg-black hover:text-white transition-colors duration-300 group cursor-pointer">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">{obra.title}</h2>
              <p className="text-sm font-mono opacity-60 group-hover:opacity-100 mb-8">Hash: {obra.id}</p>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xl font-black">{obra.price}</span>
              <button className="text-xs font-bold uppercase border-b-2 border-transparent group-hover:border-white pb-1 transition-all">
                {obra.status}
              </button>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
