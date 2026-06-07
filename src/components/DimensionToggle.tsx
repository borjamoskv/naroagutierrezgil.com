"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function DimensionToggle() {
  const [currentDomain, setCurrentDomain] = useState<string>('');

  useEffect(() => {
    setCurrentDomain(window.location.hostname);
  }, []);

  if (!currentDomain) return null;

  // We consider local dev as non-preview for routing testing purposes, 
  // but the main logic is between the two Cloudflare Pages domains.
  const isPreview = currentDomain.includes('master.');
  
  const targetUrl = isPreview 
    ? 'https://naroa-gutierrez-gil.pages.dev' 
    : 'https://master.naroa-gutierrez-gil.pages.dev';

  const label = isPreview ? 'Cambiar a: ORDEN (Producción)' : 'Cambiar a: CAOS (Preview)';

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="fixed top-6 right-6 z-[100] flex flex-col items-end gap-2"
    >
      <a 
        href={targetUrl}
        className="group flex items-center gap-3 px-5 py-2.5 bg-black/60 backdrop-blur-xl border border-white/10 hover:border-[#2B3BE5]/50 rounded-full text-xs font-mono text-white/70 hover:text-white transition-all duration-500 shadow-2xl"
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPreview ? 'bg-red-500' : 'bg-[#2B3BE5]'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isPreview ? 'bg-red-500' : 'bg-[#2B3BE5]'}`}></span>
        </span>
        <span className="tracking-widest uppercase">{label}</span>
      </a>
    </motion.div>
  );
}
