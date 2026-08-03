'use client';

import React from 'react';

interface KineticTickerProps {
  items?: string[];
  speed?: number;
}

export const KineticTicker: React.FC<KineticTickerProps> = ({
  items = [
    'NAROA GUTIÉRREZ GIL',
    'RETRATOS EN PIZARRA NATURAL & MICA',
    'TRANSMUTACIÓN FOTOGRÁFICA',
    'KINTSUGI ORO 24K',
    'FINE ART & POP HYPERREALISM',
    'BILBAO / ESPAÑA',
  ],
  speed = 25,
}) => {
  const marqueeText = items.join(' — ') + ' — ';

  return (
    <div className="w-full overflow-hidden bg-[#0F0F11] border-y border-white/5 py-4 my-12 select-none">
      <div 
        className="flex whitespace-nowrap animate-marquee"
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        <span className="text-sm md:text-base tracking-[0.3em] uppercase font-light text-neutral-400">
          {marqueeText}{marqueeText}{marqueeText}{marqueeText}
        </span>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee ${speed}s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
