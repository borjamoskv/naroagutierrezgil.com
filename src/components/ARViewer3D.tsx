'use client';

import React, { useState } from 'react';

interface ARViewer3DProps {
  title: string;
  dimensions?: string;
}

export const ARViewer3D: React.FC<ARViewer3DProps> = ({ title, dimensions = '40 x 50 cm' }) => {
  const [showARGuide, setShowARGuide] = useState(false);

  return (
    <div className="w-full bg-[#0D0D10] border border-white/10 rounded-lg p-5 my-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2B3BE5]/10 border border-[#2B3BE5] flex items-center justify-center text-[#2B3BE5]">
            📱
          </div>
          <div>
            <span className="text-[9.5px] font-mono text-[#2B3BE5] tracking-[0.2em] uppercase font-bold block">
              REALIDAD AUMENTADA (AR 1:1)
            </span>
            <h4 className="text-xs font-serif text-white font-medium">
              Proyectar obra en tu pared real ({dimensions})
            </h4>
          </div>
        </div>

        <button
          onClick={() => setShowARGuide(true)}
          className="px-4 py-2 bg-[#2B3BE5]/20 hover:bg-[#2B3BE5] text-white text-xs font-mono tracking-widest uppercase rounded border border-[#2B3BE5]/40 transition-colors"
        >
          Ver en AR 1:1
        </button>
      </div>

      {showARGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0A0A0C] border border-[#2B3BE5] rounded-lg p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShowARGuide(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <span className="text-3xl mb-3 block">👓</span>
            <h3 className="text-xl font-serif text-white mb-2">Visor de Realidad Aumentada</h3>
            <p className="text-xs text-neutral-300 font-light leading-relaxed mb-6">
              Escanea el código con la cámara de tu iPhone / Android para visualizar <strong className="text-white">{title}</strong> colgada a escala real en tu pared.
            </p>

            {/* QR Code Placeholder Graphic */}
            <div className="w-48 h-48 bg-white p-4 mx-auto rounded-lg shadow-inner flex items-center justify-center border-4 border-[#2B3BE5]">
              <div className="w-full h-full bg-[#0A0A0C] rounded flex flex-col items-center justify-center text-[#F59E0B] font-mono text-[10px] p-2 text-center">
                <span>[ SCANNABLE AR QR ]</span>
                <span className="text-neutral-400 text-[8px] mt-2">https://naroagutierrezgil.com/ar/{title.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>
            </div>

            <div className="mt-6 text-[10px] font-mono text-neutral-500">
              Compatible con iOS QuickLook & Android WebXR (ARCore)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARViewer3D;
