'use client';

import { useState } from 'react';
import { useAgent } from 'agents/react';
import type { EntropicState } from '@/agents/EntropicCanvasAgent';

export default function KintsugiOverlay() {
  const [active, setActive] = useState(false);
  const [entropy, setEntropy] = useState(0);
  
  const agent = useAgent({
    agent: "EntropicCanvasAgent",
    name: "global-canvas",
    onStateUpdate: (state: EntropicState) => {
      setActive(state.kintsugiActive || false);
      setEntropy(state.globalEntropy || 0);
    }
  });

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-[fadeIn_2s_ease-out] pointer-events-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,transparent_60%)]" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 p-12 border border-[#D4AF37]/30 bg-black/50 shadow-[0_0_50px_rgba(212,175,55,0.1)] backdrop-blur-lg">
        <h2 className="text-[#D4AF37] font-serif text-4xl sm:text-6xl tracking-widest uppercase animate-pulse">Lienzo Quebrado</h2>
        
        <p className="text-white/60 font-sans text-[10px] sm:text-xs tracking-widest uppercase text-center max-w-md leading-relaxed">
          La entropía de la comunidad ha fracturado la pizarra (Nivel: {entropy.toFixed(1)}%). 
          Es necesario inyectar resina de oro para repararla y aumentar su valor histórico.
        </p>

        <button 
          onClick={() => {
            if (typeof (agent as any).injectGold === 'function') {
              (agent as any).injectGold(15);
            }
          }}
          className="px-8 py-4 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-sans text-xs font-bold uppercase tracking-[0.3em] transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] cursor-pointer"
        >
          Inyectar Resina de Oro
        </button>
      </div>
    </div>
  );
}
