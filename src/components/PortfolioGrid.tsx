'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { artworkData } from '@/lib/artworkData';

export default function PortfolioGrid() {
  const [selectedFilter, setSelectedFilter] = useState<string>('Todas');

  const categories = ['Todas', 'Disponibles', 'Pizarra Lítica', 'Retrato Pop', 'Técnica Mixta'];

  const filteredArtworks = artworkData.filter((artwork) => {
    if (selectedFilter === 'Todas') return true;
    if (selectedFilter === 'Disponibles') return artwork.availability === 'Disponible';
    if (selectedFilter === 'Pizarra Lítica') return artwork.support?.toLowerCase().includes('pizarra');
    if (selectedFilter === 'Retrato Pop') return artwork.series?.toLowerCase().includes('pop') || artwork.technique?.toLowerCase().includes('pop');
    if (selectedFilter === 'Técnica Mixta') return artwork.technique?.toLowerCase().includes('mixta');
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'bg-emerald-400';
      case 'Reservado': return 'bg-amber-400';
      case 'Colección privada': return 'bg-neutral-500';
      case 'Vendido': return 'bg-rose-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-12">
      {/* Alyssa Monks Style Filter Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedFilter(category)}
            className={`px-5 py-2 text-xs font-mono tracking-[0.2em] uppercase rounded-full transition-all duration-300 border ${
              selectedFilter === category
                ? 'bg-[#F59E0B] text-[#0A0A0A] border-[#F59E0B] font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 text-[#F5F5F5]/60 border-white/10 hover:border-white/30 hover:text-[#F5F5F5]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Masonry / Grid Display */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-12 pb-24">
        {filteredArtworks.map((artwork) => (
          <div key={artwork.id} className="break-inside-avoid group">
            <Link href={`/obra/${artwork.slug}`} className="block">
              {/* Image Container with 3D Tilt Effect and Glow */}
              <div className="relative w-full bg-[#050505] border border-white/5 overflow-hidden shadow-sm transition-all duration-700 group-hover:border-[#F59E0B]/50 group-hover:shadow-[0_0_35px_rgba(245,158,11,0.2)] group-hover:-translate-y-2">
                <Image
                  src={`/assets/${artwork.image}`}
                  alt={artwork.title}
                  width={800}
                  height={1000}
                  className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(artwork.availability)} opacity-90`} title={artwork.availability}></span>
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
