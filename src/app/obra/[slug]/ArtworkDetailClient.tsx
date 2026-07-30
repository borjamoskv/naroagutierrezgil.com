'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GlobalNavigation from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import { Artwork } from '@/lib/artworkData';

const CinematicCanvas = dynamic(() => import('@/components/CinematicCanvas'), { ssr: false });
const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false });
const Slate3DViewer = dynamic(() => import('@/components/Slate3DViewer'), { ssr: false });

export default function ArtworkDetailClient({ artwork }: { artwork: Artwork }) {
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
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans selection:bg-[#2B3BE5] selection:text-[#F5F5F5] relative overflow-x-hidden">
      <CustomCursor />
      <CinematicCanvas />
      <GlobalNavigation />

      <main className="max-w-7xl mx-auto px-6 sm:px-12 pt-36 pb-32">
        <div className="mb-12">
          <Link href="/obra" className="text-[#F5F5F5]/60 hover:text-[#F59E0B] font-mono text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
            <span>←</span> Volver a la Galería
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left Column - High Res Image + 3D Slab Inspector */}
          <div className="space-y-6">
            <div className="relative w-full aspect-[4/5] bg-[#050505] border border-white/5 overflow-hidden shadow-[0_0_30px_rgba(43,59,229,0.1)]">
              <Image
                src={`/assets/${artwork.image}`}
                alt={artwork.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            
            {/* Interactive 3D Slab Inspector */}
            <Slate3DViewer imageUrl={`/assets/${artwork.image}`} title={artwork.title} />
          </div>

          {/* Right Column - Ficha Técnica */}
          <div className="sticky top-32 space-y-12">
            <header className="space-y-4 border-b border-white/10 pb-8">
              <h1 className="text-5xl md:text-6xl font-serif font-light text-[#F5F5F5] leading-tight">
                {artwork.title}
              </h1>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm tracking-widest text-[#F5F5F5]/60 uppercase">
                  {artwork.year || '2023'}
                </span>
                <span className="text-[#2B3BE5]/50">|</span>
                <span className="font-mono text-sm tracking-widest text-[#F5F5F5]/60 uppercase">
                  {artwork.series || 'Obra Única'}
                </span>
              </div>
            </header>

            <div className="space-y-8">
              {artwork.description && (
                <div>
                  <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-[#F59E0B] mb-3 font-bold">Descripción</h3>
                  <p className="text-[#F5F5F5]/80 leading-relaxed font-light text-sm sm:text-base">
                    {artwork.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-[#F59E0B] mb-2 font-bold">Técnica</h3>
                  <p className="text-[#F5F5F5] font-light text-sm">{artwork.technique}</p>
                </div>
                
                <div>
                  <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-[#F59E0B] mb-2 font-bold">Soporte</h3>
                  <p className="text-[#F5F5F5] font-light text-sm">{artwork.support}</p>
                </div>

                {artwork.dimensions && (
                  <div>
                    <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-[#F59E0B] mb-2 font-bold">Dimensiones</h3>
                    <p className="text-[#F5F5F5] font-light text-sm">{artwork.dimensions}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-[#F59E0B] mb-2 font-bold">Materiales</h3>
                  <p className="text-[#F5F5F5] font-light text-sm">{artwork.materials.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(artwork.availability)}`}></span>
                  <span className="font-mono text-xs tracking-widest uppercase text-[#F5F5F5]/80 font-bold">
                    {artwork.availability}
                  </span>
                </div>
                {artwork.price && (
                  <span className="text-xl font-serif text-[#F59E0B]">{artwork.price}€</span>
                )}
              </div>

              {artwork.availability === 'Disponible' && (
                <Link
                  href={`/contacto?obra=${artwork.slug}&action=adquirir`}
                  className="block w-full py-5 bg-[#F59E0B] hover:bg-[#2B3BE5] text-[#0A0A0A] hover:text-white text-center font-mono text-xs tracking-[0.2em] uppercase transition-colors duration-300 font-bold"
                >
                  Consultar sobre esta obra
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
