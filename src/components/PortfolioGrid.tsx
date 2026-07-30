'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { artworkData } from '@/lib/artworkData';

export default function PortfolioGrid() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'bg-green-500';
      case 'Reservado': return 'bg-yellow-500';
      case 'Colección privada': return 'bg-gray-400';
      case 'Vendido': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-12">
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-12 pb-24">
        {artworkData.map((artwork) => (
          <div key={artwork.id} className="break-inside-avoid group">
            <Link href={`/obra/${artwork.slug}`} className="block">
              {/* Image Container */}
              <div className="relative w-full bg-[#050505] border border-white/5 overflow-hidden shadow-sm transition-all duration-500 group-hover:border-[#F59E0B]/50 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] group-hover:-translate-y-1">
                <Image
                  src={`/assets/${artwork.image}`}
                  alt={artwork.title}
                  width={800}
                  height={1000}
                  className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              
              {/* Info Container */}
              <div className="mt-4 flex flex-col space-y-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-xl font-serif text-[#F5F5F5] group-hover:text-[#F59E0B] transition-colors duration-300">
                    {artwork.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-widest text-[#F5F5F5]/40 uppercase">
                      {artwork.year}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(artwork.availability)} opacity-80`} title={artwork.availability}></span>
                  </div>
                </div>
                <p className="text-sm font-sans font-light text-[#F5F5F5]/60">
                  {artwork.technique}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
