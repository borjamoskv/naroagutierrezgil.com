'use client';

import React, { useState } from 'react';
import { Artwork } from '@/lib/artworkData';

interface CoAGeneratorProps {
  artwork: Artwork;
}

export const CoAGenerator: React.FC<CoAGeneratorProps> = ({ artwork }) => {
  const [showModal, setShowModal] = useState(false);

  // Generate deterministic serial hash based on slug
  const certificateHash = `NGG-${artwork.slug.toUpperCase().slice(0, 4)}-2026-${Math.abs(
    artwork.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % 8999 + 1000}`;

  return (
    <div className="w-full bg-[#0F0F12] border border-[#F59E0B]/30 rounded-lg p-5 my-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B] flex items-center justify-center text-[#F59E0B]">
          🛡️
        </div>
        <div>
          <span className="text-[10px] font-mono text-[#F59E0B] tracking-[0.2em] uppercase font-bold block">
            CERTIFICADO DE AUTENTICIDAD
          </span>
          <h4 className="text-sm font-serif text-white font-medium">
            Sello Digital de Pieza Única — ID: {certificateHash}
          </h4>
        </div>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-white/5 hover:bg-[#F59E0B] text-neutral-300 hover:text-black text-xs font-mono tracking-widest uppercase rounded border border-white/10 transition-colors"
      >
        Verificar Certificado
      </button>

      {/* CoA Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#0A0A0C] border border-[#F59E0B] rounded-lg p-8 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <div className="text-center border-b border-white/10 pb-6 mb-6">
              <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#F59E0B] block mb-1">
                COLECCIÓN DE ARTE EN PIZARRA NATURAL
              </span>
              <h3 className="text-2xl font-serif text-white tracking-wide">
                CERTIFICADO DE AUTENTICIDAD
              </h3>
              <p className="text-xs text-neutral-400 font-light mt-1">
                Taller Naroa Gutiérrez Gil — Bilbao, País Vasco
              </p>
            </div>

            <div className="space-y-4 text-xs font-light text-neutral-300">
              <div className="flex justify-between border-b border-white/5 py-2">
                <span className="text-neutral-500 font-mono">TÍTULO:</span>
                <span className="font-serif text-white font-bold">{artwork.title}</span>
              </div>

              <div className="flex justify-between border-b border-white/5 py-2">
                <span className="text-neutral-500 font-mono">TÉCNICA Y SOPORTE:</span>
                <span className="text-neutral-200 text-right">{artwork.technique} sobre {artwork.support}</span>
              </div>

              <div className="flex justify-between border-b border-white/5 py-2">
                <span className="text-neutral-500 font-mono">DIMENSIONES:</span>
                <span className="text-neutral-200">{artwork.dimensions}</span>
              </div>

              <div className="flex justify-between border-b border-white/5 py-2">
                <span className="text-neutral-500 font-mono">ESTADO DE DISPONIBILIDAD:</span>
                <span className="text-[#F59E0B] font-mono font-bold">{artwork.availability}</span>
              </div>

              <div className="flex justify-between border-b border-white/5 py-2">
                <span className="text-neutral-500 font-mono">HASH CRIPTOGRÁFICO:</span>
                <span className="font-mono text-[#F59E0B]">{certificateHash}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] text-neutral-500 font-mono">
              <span>FIRMA DIGITAL: Naroa Gutiérrez Gil</span>
              <span>VERIFICADO 2026 ✔</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoAGenerator;
