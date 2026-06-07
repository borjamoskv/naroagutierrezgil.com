"use client";

import { useEffect, useState } from 'react';

export default function DimensionToggle() {
  const [mode, setMode] = useState<"CAOS" | "ORDEN">("ORDEN");

  useEffect(() => {
    const handleDimensionChange = (e: Event) => {
      setMode((e as CustomEvent).detail);
    };
    window.addEventListener('dimension-changed', handleDimensionChange);
    return () => window.removeEventListener('dimension-changed', handleDimensionChange);
  }, []);

  const toggle = () => {
    const next = mode === "CAOS" ? "ORDEN" : "CAOS";
    window.dispatchEvent(new CustomEvent('request-dimension-toggle', { detail: next }));
  };

  const isLaboratorio = mode === "CAOS";
  const label = isLaboratorio ? 'Otra Naro (Orden)' : 'Otra Naro (Caos)';

  return (
    <div 
      className="fixed top-6 right-6 z-[100] flex flex-col items-end gap-2 animate-[slideUp_0.8s_ease-out_1s_both]"
    >
      <button 
        onClick={toggle}
        className="group flex items-center gap-3 px-5 py-2.5 bg-black/60 backdrop-blur-xl border border-white/10 hover:border-[#2B3BE5]/50 rounded-full text-xs font-mono text-white/70 hover:text-white transition-all duration-500 shadow-2xl cursor-pointer"
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLaboratorio ? 'bg-red-500' : 'bg-[#2B3BE5]'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isLaboratorio ? 'bg-red-500' : 'bg-[#2B3BE5]'}`}></span>
        </span>
        <span className="tracking-widest uppercase">{label}</span>
      </button>
    </div>
  );
}
